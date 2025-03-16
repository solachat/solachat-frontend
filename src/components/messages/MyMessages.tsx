import * as React from 'react';
import {useLocation, useSearchParams} from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import {ChatProps, MessageProps, UserProps} from '../core/types';
import { fetchChatsFromServer } from '../../api/api';
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


export default function MyProfile() {
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<ChatProps | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [currentUser, setCurrentUser] = React.useState<UserProps | null>(null);
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
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
                console.log(`⚠️ Чат ${selectedChat.id} удален, сбрасываем выбор.`);
                setSelectedChat(null);
                navigate('/chat');
            }
        } else {
            console.log(`✅ Чат ${selectedChat.id} найден, обновляем данные.`);
            setSelectedChat(foundChat);
        }
    }, [chats, selectedChat, navigate]);

    const handleWebSocketMessage = (message: any) => {
        switch (message.type) {
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
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Authorization token is missing");
                    return;
                }

                let chatsToProcess = await getCachedChats() || [];
                let fetchedChats = [];

                try {
                    fetchedChats = await fetchChatsFromServer(currentUser.id, token);
                    if (fetchedChats.length > 0) {
                        await cacheChats(fetchedChats);
                        chatsToProcess = fetchedChats;
                    }
                } catch (error) {
                    console.warn("⚠️ Сервер не отвечает, используем кэшированные данные.");
                }

                const updatedChats = await Promise.all(
                    chatsToProcess.map(async (chat) => {
                        const updatedMessages = await Promise.all(
                            chat.messages.map(async (msg: any) => {
                                if (msg.attachment?.filePath) {
                                    let cachedFile = await getCachedMedia(msg.attachment.filePath);
                                    if (!cachedFile) {
                                        try {
                                            console.log(`📌 Кэшируем файл: ${msg.attachment.filePath}`);
                                            const res = await fetch(msg.attachment.filePath);
                                            const blob = await res.blob();
                                            await cacheMedia(msg.attachment.filePath, blob);
                                            cachedFile = URL.createObjectURL(blob);
                                        } catch (err) {
                                            console.warn(`❌ Ошибка загрузки файла: ${msg.attachment.filePath}`);
                                        }
                                    }
                                    return {
                                        ...msg,
                                        attachment: {
                                            ...msg.attachment,
                                            filePath: cachedFile || msg.attachment.filePath
                                        }
                                    };
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

                const sortedChats = updatedChats.sort((a, b) => {
                    const getLastMessageTime = (chat: any) => {
                        if (chat.lastMessage) return new Date(chat.lastMessage.createdAt).getTime();
                        if (chat.messages.length > 0) {
                            return new Date(chat.messages[chat.messages.length - 1].createdAt).getTime();
                        }
                        return 0;
                    };

                    return getLastMessageTime(b) - getLastMessageTime(a);
                });

                console.log("📌 Обновлённые и отсортированные чаты:", sortedChats);
                setChats(sortedChats);

            } catch (error) {
                console.error("❌ Ошибка загрузки чатов:", error);
                setError("Failed to load chats.");
            } finally {
                setLoading(false);
            }
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
                    pt: { xs: 'var(--Header-height)', sm: 0 },
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'minmax(min-content, 250px) 1fr',
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
                                position: 'relative',
                            }}
                        >
                            {error ? (
                                <Typography sx={{ textAlign: 'center', color: 'red' }}>{error}</Typography>
                            ) : loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>

                                </Box>
                            ) : selectedChat ? (
                                <MessagesPane
                                    chat={selectedChat} // Передаём `selectedChat`
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
