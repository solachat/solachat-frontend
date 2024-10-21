import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import { ChatProps, UserProps } from '../core/types';
import { fetchChatsFromServer } from '../../api/api';
import { CircularProgress, Typography } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { JwtPayload } from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { useWebSocket } from '../../api/useWebSocket';
import PageTitle from './PageTitle';
import Box from "@mui/joy/Box";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import CallModal from './CallModal';

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
                username: decodedToken.username as string,
                realname: decodedToken.realname as string,
                avatar: decodedToken.avatar as string,
                online: true,
                verified: false,
                role: 'member',
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const updateLastMessageInChatList = (newMessage: any) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === newMessage.chatId
                    ? { ...chat, newMessage: newMessage }
                    : chat
            )
        );
    };

    const addNewChat = (chatId: number) => {
        fetchChatsFromServer(currentUser!.id, localStorage.getItem('token')!).then((fetchedChats: ChatProps[]) => {
            const newChat = fetchedChats.find((chat: ChatProps) => chat.id === chatId);
            if (newChat && !chats.some(chat => chat.id === chatId)) {
                setChats((prevChats) => [...prevChats, newChat]);
            }
        });
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

    const removeChatFromList = (chatId: number) => {
        setChats((prevChats) => prevChats.filter(chat => chat.id !== chatId));
    };


    const handleWebSocketMessage = (message: any) => {
        console.log('Received WebSocket message:', message);

        switch (message.type) {
            case 'newMessage':
                updateLastMessageInChatList(message.message);
                break;
            case 'chatCreated':
                addNewChat(message.chat);
                break;
            case 'userAdded':
                addNewChat(message.chatId);
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
                console.log('Call rejected, closing modal.');
                break;
            default:
                console.warn('Unknown message type:', message.type);
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

    React.useEffect(() => {
        if (!currentUser) return;

        const loadChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authorization token is missing');
                    return;
                }

                const fetchedChats = await fetchChatsFromServer(currentUser.id, token);
                if (Array.isArray(fetchedChats) && fetchedChats.length > 0) {
                    setChats(fetchedChats);

                    const chatIdFromUrl = searchParams.get('id');
                    if (chatIdFromUrl) {
                        const chatFromUrl = fetchedChats.find(chat => chat.id === Number(chatIdFromUrl));
                        if (chatFromUrl) {
                            setSelectedChat(chatFromUrl);
                        } else {
                            console.error('Chat not found by URL');
                            setError('Chat not found by URL');
                        }
                    } else {
                        console.log('No chat selected by default, and no changes to URL.');
                    }
                } else {
                    setChats([]);
                }
            } catch (error) {
                setError('Failed to load chats.');
                console.error('Error loading chats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChats();
    }, [currentUser, searchParams, navigate]);

    return (
        <>
            <PageTitle
                title={selectedChat
                    ? (selectedChat.isGroup
                            ? selectedChat.name ?? 'Unnamed Group'
                            : selectedChat.users.find(user => user.id !== currentUser?.id)?.realname ?? 'Unnamed User'
                    )
                    : 'Messenger'}
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
                        sm: 'minmax(min-content, min(70%, 700px)) 1fr',
                    },
                }}
            >
                {currentUser ? (
                    <>
                        <ChatsPane
                            chats={chats}
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
                            }}
                        >
                            {error ? (
                                <Typography sx={{ textAlign: 'center', color: 'red' }}>{error}</Typography>
                            ) : loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography>Loading chats...</Typography>
                                    <CircularProgress sx={{ marginTop: 2 }} />
                                </Box>
                            ) : selectedChat ? (
                                <MessagesPane
                                    chat={selectedChat}
                                    members={selectedChat?.users || []}
                                />
                            ) : (
                                <MessagesPane chat={null} />
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
                            realname: callModalState.fromUsername || 'User',
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
