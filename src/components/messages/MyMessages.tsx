import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import { ChatProps, UserProps } from '../core/types';
import { fetchChatsFromServer } from '../../api/api';
import {CircularProgress, Typography} from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { JwtPayload } from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { useWebSocket } from '../../api/useWebSocket';
import {Helmet} from "react-helmet-async";
import Box from "@mui/joy/Box";  // Импортируем WebSocket хук

export default function MyProfile() {
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<ChatProps | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [currentUser, setCurrentUser] = React.useState<UserProps | null>(null);
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    // Получаем текущего пользователя по токену
    const getCurrentUserFromToken = (): UserProps | null => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Authorization token is missing');
            return null;
        }

        try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            return {
                id: decodedToken.id,
                username: decodedToken.username,
                realname: 'User Realname',
                avatar: '',
                online: true,
                role: 'member',
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    // Функция обновления последнего сообщения в списке чатов
    const updateLastMessageInChatList = (newMessage: any) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === newMessage.chatId
                    ? { ...chat, lastMessage: newMessage }
                    : chat
            )
        );
    };

    // Функция добавления нового чата
    const addNewChat = (chatId: number) => {
        // Предположим, что для нового чата нужно запросить его с сервера
        fetchChatsFromServer(currentUser!.id, localStorage.getItem('token')!).then((fetchedChats: ChatProps[]) => {
            const newChat = fetchedChats.find((chat: ChatProps) => chat.id === chatId);
            if (newChat) {
                setChats((prevChats) => [...prevChats, newChat]);
            }
        });
    };

    // Функция удаления пользователя из чата
    const removeUserFromChat = (chatId: number, userId: number) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === chatId
                    ? { ...chat, users: chat.users.filter(user => user.id !== userId) }
                    : chat
            )
        );
    };

    // Функция изменения роли пользователя в чате
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

    // Обработка событий WebSocket
    const handleWebSocketMessage = (message: any) => {
        switch (message.type) {
            case 'newMessage':
                updateLastMessageInChatList(message.message);
                break;
            case 'userAdded':
                addNewChat(message.chatId);
                break;
            case 'userRemoved':
                removeUserFromChat(message.chatId, message.userId);
                break;
            case 'roleChange':
                updateRoleInChat(message.chatId, message.userId, message.newRole);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    };

    useWebSocket(handleWebSocketMessage); // Используем хук WebSocket

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
                        setSelectedChat(chatFromUrl || fetchedChats[0]);
                    } else {
                        setSelectedChat(fetchedChats[0]);
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
    }, [currentUser, searchParams]);

    return (
        <>
            <Helmet>
                <title>Messenger</title>
            </Helmet>
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
                                <MessagesPane chat={null}/>
                            )}
                        </Sheet>
                    </>
                ) : (
                    <Typography>{t('loadingUserInformation')}</Typography>
                )}
            </Sheet>
        </>
    );
}
