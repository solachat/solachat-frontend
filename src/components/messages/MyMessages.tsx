import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import { ChatProps } from '../core/types';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchChatsFromServer } from '../../api/api';
import {Typography} from "@mui/joy";

export default function MyProfile() {
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const currentUser = { id: 1 };

    React.useEffect(() => {
        const loadChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authorization token is missing');
                    return;
                }

                const fetchedChats = await fetchChatsFromServer(currentUser.id, token);

                // Убедимся, что fetchedChats — массив
                if (Array.isArray(fetchedChats)) {
                    setChats(fetchedChats);
                } else {
                    setChats([]);  // Если не массив, установим пустой массив
                }
            } catch (error) {
                console.error('Error loading chats:', error);
                setError('Failed to load chats.');
                setChats([]);  // Установим пустой массив при ошибке
            } finally {
                setLoading(false); // Загрузка завершена
            }
        };

        loadChats();
    }, [currentUser.id]);

    const selectedChat = Array.isArray(chats) && chats.length > 0
        ? chats.find((chat) => chat.id === id) || chats[0]
        : null;

    const setSelectedChat = (chat: ChatProps) => {
        navigate(`/chat?id=${chat.id}`);
    };

    React.useEffect(() => {
        const handleActivity = () => {
            console.log('User is active');
        };

        const handleInactivity = () => {
            console.log('User is inactive');
        };

        const timeout = setTimeout(handleInactivity, 2 * 60 * 1000);

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
        };
    }, []);

    return (
        <Sheet
            sx={{
                flex: 1,
                width: '100%',
                mx: 'auto',
                pt: { xs: 'var(--Header-height)', sm: 0 },
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'minmax(min-content, min(30%, 400px)) 1fr',
                },
            }}
        >
            <Sheet
                sx={{
                    position: { xs: 'fixed', sm: 'sticky' },
                    transform: {
                        xs: 'translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))',
                        sm: 'none',
                    },
                    transition: 'transform 0.4s, width 0.4s',
                    zIndex: 100,
                    width: '100%',
                    top: 52,
                }}
            >
                <ChatsPane
                    chats={chats}
                    selectedChatId={selectedChat ? selectedChat.id : ''}
                    setSelectedChat={setSelectedChat}
                    currentUser={currentUser}
                />
            </Sheet>
            <Sheet
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'background.level1',
                    padding: 2,
                }}
            >
                {error ? (
                    <Typography sx={{ textAlign: 'center', color: 'red' }}>
                        {error}
                    </Typography>
                ) : loading ? (
                    <Typography>Loading chats...</Typography>
                ) : selectedChat ? (
                    <MessagesPane chat={selectedChat} />
                ) : (
                    <MessagesPane chat={null} />  // Отображаем MessagesPane даже если чатов нет
                )}
            </Sheet>
        </Sheet>
    );
}
