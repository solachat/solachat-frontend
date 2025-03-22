import * as React from 'react';
import {useLocation, useSearchParams} from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import {ChatProps, MessageProps, UserProps} from '../core/types';
import {fetchChatsFromServer, getSessions} from '../../api/api';
import { Typography } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { JwtPayload } from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { useWebSocket } from '../../api/useWebSocket';
import PageTitle from './PageTitle';
import Box from "@mui/joy/Box";
import { useNavigate } from 'react-router-dom';
import {useEffect, useRef, useState} from "react";
import CallModal from './CallModal';
import {cacheChats, getCachedChats} from "../../utils/cacheChats";
import {cacheMessages, getCachedMessages} from "../../utils/cacheMessages";
import {cacheMedia, getCachedMedia} from "../../utils/cacheMedia";
import GlobalStyles from "@mui/joy/GlobalStyles";
import {loadAndCacheSessions} from "../../utils/sessionCache";


export default function MyProfile() {
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<ChatProps | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [currentUser, setCurrentUser] = React.useState<UserProps | null>(null);
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const [sessions, setSessions] = useState<any[]>([]);

    const navigate = useNavigate();

    const [callModalState, setCallModalState] = useState({
        open: false,
        fromUserId: null as number | null,
        fromUsername: null as string | null,
        fromAvatar: null as string | null,
        toUserId: null as number | null,
        toUsername: null as string | null,
        toAvatar: null as string | null,
        callId: null as number | null,
        status: null,
    });

    const getCurrentUserFromToken = (): UserProps | null => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Authorization token is missing');
            return null;
        }

        try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            return {
                id: decodedToken.id as number,
                public_key: decodedToken.publicKey as string,
                avatar: decodedToken.avatar as string,
                online: true,
                verified: false,
                lastOnline: new Date().toISOString(),
                role: 'member',
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const updateLastMessageInChatList = (chatId: number, newMessage: MessageProps) => {
        setChats((prevChats) => {
            return prevChats.map((chat) =>
                chat.id === chatId
                    ? { ...chat, lastMessage: newMessage }
                    : chat
            );
        });

        if (selectedChat?.id === chatId) {
            console.log(`✅ Обновляем последнее сообщение в активном чате (${chatId})`);
            setSelectedChat((prev) =>
                prev ? { ...prev, lastMessage: newMessage } : prev
            );
        }
    };



    const removeUserFromChat = (chatId: number, userId: number) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === chatId
                    ? { ...chat, users: chat.users.filter(user => user.id !== userId) }
                    : chat
            )
        );
    };

    const updateRoleInChat = (chatId: number, userId: number, newRole: string) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === chatId
                    ? {
                        ...chat,
                        users: chat.users.map(user =>
                            user.id === userId ? { ...user, role: newRole } : user
                        ),
                    }
                    : chat
            )
        );
    };
    const chatDeletedRef = useRef(false);

    const removeChatFromList = (chatId: number) => {
        chatDeletedRef.current = true;
        console.log(`✅ Удаляем чат ${chatId} из списка.`);

        setChats((prevChats) => prevChats.filter(chat => chat.id !== chatId));
        setSelectedChat(null)
        console.log(`⚠️ Чат ${chatId} удален, сбрасываем выбор.`);
        chatDeletedRef.current = false;

        if (selectedChat?.id === chatId) {
            setSelectedChat(null);
            navigate('/chat');
        }
    };

    useEffect(() => {
        if (!selectedChat) return;

        const foundChat = chats.find(chat => chat.id === selectedChat.id);
        if (!foundChat) {
            if (chatDeletedRef.current) {
                setSelectedChat(null);
                navigate('/chat');
            }
        } else {
            setSelectedChat(foundChat);
        }
    }, [chats, selectedChat, navigate]);

    const handleSessionDeletion = (sessionId: string) => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decodedToken = jwtDecode<{ sessionId?: string }>(token);
                if (decodedToken.sessionId === sessionId) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return true;
                }
            } catch (error) {
                console.error('Token error:', error);
                localStorage.removeItem('token');
            }
        }
        return false;
    };

    const handleWebSocketMessage = (message: any) => {
        switch (message.type) {
            case 'session_deleted':
                handleSessionDeletion(message.sessionId);
                break;
            case 'newMessage':
                updateLastMessageInChatList(message.message.chatId, message.message);
                break;
            case 'userRemoved':
                removeUserFromChat(message.chatId, message.userId);
                break;
            case 'chatDeleted':
                removeChatFromList(message.chatId);
                break;
            case 'roleChange':
                updateRoleInChat(message.chatId, message.userId, message.newRole);
                break;
            case 'callOffer':
                if (message.toUserId === currentUser?.id) {
                    setCallModalState({
                        open: true,
                        fromUserId: message.fromUserId,
                        fromUsername: message.fromUsername,
                        fromAvatar: message.fromAvatar,
                        toUserId: message.toUserId,
                        toUsername: message.toUsername,
                        toAvatar: message.toAvatar,
                        callId: message.callId,
                        status: message.status,
                    });
                }
                break;
            case 'callRejected':
                setCallModalState({
                    open: false,
                    fromUserId: null,
                    fromUsername: null,
                    fromAvatar: null,
                    toUserId: null,
                    toUsername: null,
                    toAvatar: null,
                    callId: null,
                    status: null,
                });
                break;
        }
    };

    useWebSocket(handleWebSocketMessage);

    React.useEffect(() => {
        const user = getCurrentUserFromToken();
        if (user) {
            setCurrentUser(user);
        } else {
            setError('Failed to decode user from token');
        }
    }, []);
    const location = useLocation();

    useEffect(() => {
        if (!currentUser) return;

        const loadChatsAndMessages = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authorization token is missing");
                setLoading(false);
                return;
            }

            // Загрузка сессий
            try {
                const sessionList = await loadAndCacheSessions(currentUser.id, token);
                setSessions(sessionList);
            } catch (err) {
                console.warn("⚠️ Не удалось загрузить сессии");
            }

            // 1. Загружаем чаты из кэша и сразу показываем
            try {
                const cachedChats = await getCachedChats() || [];
                const processedCachedChats = await processChats(cachedChats);
                setChats(sortChats(processedCachedChats));
            } catch (err) {
                console.warn("⚠️ Ошибка при обработке кэша:", err);
            }

            // 2. Параллельно — пытаемся обновить с сервера
            try {
                const fetchedChats = await fetchChatsFromServer(currentUser.id, token);
                if (fetchedChats.length > 0) {
                    await cacheChats(fetchedChats);
                    const processedServerChats = await processChats(fetchedChats);
                    setChats(sortChats(processedServerChats));
                    console.log("📌 Обновлённые и отсортированные чаты:", processedServerChats);
                }
            } catch (err) {
                console.warn("⚠️ Сервер не отвечает, используем кэшированные данные.");
            }

            setLoading(false);
        };

        const processChats = async (chats: any[]) => {
            return await Promise.all(
                chats.map(async (chat) => {
                    const updatedMessages = await Promise.all(
                        chat.messages.map(async (msg: any) => {
                            if (Array.isArray(msg.attachment)) {
                                const updatedAttachments = await Promise.all(
                                    msg.attachment.map(async (file: any) => {
                                        let cachedFile = await getCachedMedia(file.filePath);
                                        if (!cachedFile) {
                                            try {
                                                console.log(`📌 Кэшируем файл: ${file.filePath}`);
                                                const res = await fetch(file.filePath);
                                                const blob = await res.blob();
                                                await cacheMedia(file.filePath, blob);
                                                cachedFile = URL.createObjectURL(blob);
                                            } catch (err) {
                                                console.warn(`❌ Ошибка загрузки файла: ${file.filePath}`, err);
                                            }
                                        }
                                        return { ...file, filePath: cachedFile || file.filePath };
                                    })
                                );
                                return { ...msg, attachment: updatedAttachments };
                            }
                            return msg;
                        })
                    );

                    const updatedUsers = await Promise.all(
                        chat.users.map(async (user: any) => {
                            if (user.avatar) {
                                let cachedAvatar = await getCachedMedia(user.avatar);
                                if (!cachedAvatar) {
                                    try {
                                        console.log(`📌 Кэшируем аватарку: ${user.avatar}`);
                                        const res = await fetch(user.avatar);
                                        const blob = await res.blob();
                                        await cacheMedia(user.avatar, blob);
                                        cachedAvatar = URL.createObjectURL(blob);
                                    } catch (err) {
                                        console.warn(`❌ Ошибка загрузки аватарки: ${user.avatar}`);
                                    }
                                }
                                return { ...user, avatar: cachedAvatar || user.avatar };
                            }
                            return user;
                        })
                    );

                    return { ...chat, messages: updatedMessages, users: updatedUsers };
                })
            );
        };

        const sortChats = (chats: any[]) => {
            return chats.sort((a, b) => {
                const getLastMessageTime = (chat: any) => {
                    if (chat.lastMessage) return new Date(chat.lastMessage.createdAt).getTime();
                    if (chat.messages.length > 0) {
                        return new Date(chat.messages[chat.messages.length - 1].createdAt).getTime();
                    }
                    return 0;
                };

                return getLastMessageTime(b) - getLastMessageTime(a);
            });
        };

        loadChatsAndMessages();
    }, [currentUser]);


    const GlobalStyle = () => (
        <GlobalStyles
            styles={{
                '@keyframes glow': {
                    '0%, 100%': { opacity: 0.6 },
                    '50%': { opacity: 1 }
                }
            }}
        />
    );

    return (
        <>
            <GlobalStyle />
            <PageTitle
                title={
                    selectedChat
                        ? selectedChat.isGroup
                            ? selectedChat.name ?? 'Unnamed Group'
                            : selectedChat.users?.find(user => user.id !== currentUser?.id)?.public_key ?? 'Unnamed User'
                        : 'Messenger'
                }
            />

            <Sheet
                sx={{
                    flex: 1,
                    width: '100%',
                    mx: 'auto',
                    height: '100dvh',
                    pt: { xs: 'var(--Header-height)', sm: 0 },
                    display: 'grid',
                    overflow: 'hidden',
                    gridTemplateColumns: {
                        xs: selectedChat ? '0fr 1fr' : '1fr',
                        sm: selectedChat ? '0.5fr 1fr' : '1fr',
                        md: 'minmax(min-content, 550px) 1fr',
                    },
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: { sm: '250px', md: '550px' },
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: `
              linear-gradient(
                180deg,
                transparent 0%,
                rgba(0, 168, 255, 0.6) 50%,
                transparent 100%
              )`,
                        boxShadow: '0 0 20px rgba(0, 168, 255, 0.3)',
                        zIndex: 999,
                        animation: 'glow 2s ease-in-out infinite',
                    }
                }}
            >
                {currentUser ? (
                    <>
                        <ChatsPane
                            chats={chats}
                            selectedChat={selectedChat}
                            selectedChatId={selectedChat ? String(selectedChat.id) : ''}
                            setSelectedChat={(chat: ChatProps) => {
                                setSelectedChat(chat);
                                navigate(`/chat/#-${chat.id}`);
                            }}
                            currentUser={currentUser}
                        />

                        <Sheet
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                backgroundColor: 'background.level1',
                                position: {
                                    xs: selectedChat ? 'absolute' : 'relative',
                                    sm: 'relative'
                                },
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,

                                transition: 'all 0.3s ease-in-out',

                            }}
                        >
                            {error ? (
                                <Typography sx={{ textAlign: 'center', color: 'red' }}>{error}</Typography>
                            ) : loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>

                                </Box>
                            ) : selectedChat ? (
                                <MessagesPane
                                    chat={selectedChat}
                                    chats={chats}
                                    selectedChat={selectedChat}
                                    members={selectedChat?.users || []}
                                    setSelectedChat={setSelectedChat}
                                />

                            ) : (
                                <MessagesPane chat={null}   selectedChat={selectedChat}  chats={chats} setSelectedChat={setSelectedChat}   />
                            )}
                        </Sheet>
                    </>
                ) : (
                    <Typography>{t('loadingUserInformation')}</Typography>
                )}

                {callModalState.open && (
                    <CallModal
                        open={callModalState.open}
                        onClose={() => setCallModalState({
                            open: false,
                            fromUserId: null,
                            fromUsername: null,
                            fromAvatar: null,
                            toUserId: null,
                            toUsername: null,
                            toAvatar: null,
                            callId: null,
                            status: null
                        })}
                        sender={{
                            id: callModalState.fromUserId!,
                            username: callModalState.fromUsername || 'User',
                            avatar: callModalState.fromAvatar || 'avatar.png',
                            online: true,
                            role: 'member',
                        }}
                        receiver={{
                            id: callModalState.toUserId ?? currentUser?.id!,
                            username: callModalState.toUsername || currentUser?.username || 'User',
                            avatar: callModalState.toAvatar || currentUser?.avatar || 'avatar.png',
                        }}
                        currentUserId={currentUser?.id || null}
                        ws={null}
                        callId={callModalState.callId || null}
                        status={callModalState.status || 'incoming'}
                    />
                )}
            </Sheet>
        </>
    );
}
