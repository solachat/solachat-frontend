import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from '../components/messages/MessagesPane';
import ChatsPane from '../components/messages/ChatsPane';
import { ChatProps } from '../components/core/types';
import { fetchChatsFromServer } from '../api/api';
import LanguageSwitcher from '../components/core/LanguageSwitcher';
import { ColorSchemeToggle } from '../components/core/ColorSchemeToggle';
import { Typography } from "@mui/joy";

export default function MyProfile() {
    const currentUser = { id: 1, username: 'current_user' };

    const [chats, setChats] = React.useState<ChatProps[]>([]); // Убедимся, что это массив
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    React.useEffect(() => {
        const loadChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authorization token is missing');
                }

                const fetchedChats = await fetchChatsFromServer(currentUser.id, token);

                // Проверка на то, что это массив
                if (Array.isArray(fetchedChats)) {
                    setChats(fetchedChats);
                } else {
                    setError('No chats available.');
                    setChats([]); // Если нет данных, установим пустой массив
                }
            } catch (error) {
                console.error('Error loading chats:', error);
                setError('Failed to load chats.');
                setChats([]); // В случае ошибки установим пустой массив
            } finally {
                setLoading(false);
            }
        };

        loadChats();
    }, [currentUser.id]);

    // Проверяем, что chats является массивом перед использованием .find
    const selectedChat = Array.isArray(chats) && chats.length > 0
        ? chats.find((chat) => chat.id === id) || chats[0]
        : null;

    const setSelectedChat = (chat: ChatProps) => {
        navigate(`/chat?id=${chat.id}`);
    };

    // Логика активности пользователя
    React.useEffect(() => {
        const handleActivity = () => {
            console.log("User is active");
        };

        const handleInactivity = () => {
            console.log("User is inactive");
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
        <div>
            <header style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px'
            }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <LanguageSwitcher />
                    <ColorSchemeToggle />
                </div>
            </header>
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
                    {Array.isArray(chats) && chats.length > 0 ? (
                        <ChatsPane
                            chats={chats}
                            selectedChatId={selectedChat ? selectedChat.id : ''}
                            setSelectedChat={setSelectedChat}
                            currentUser={currentUser}
                        />
                    ) : (
                        <div>No chats available. Start communicating!</div>
                    )}
                </Sheet>

                <Sheet
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'background.level1',
                    }}
                >
                    {error ? (
                        <Typography sx={{ textAlign: 'center', color: 'red' }}>
                            {error}
                        </Typography>
                    ) : loading ? (
                        <Typography>Loading chats...</Typography>
                    ) : selectedChat ? (
                        <MessagesPane chat={selectedChat} currentUserId={currentUser.id} currentUser={currentUser} />
                    ) : (
                        <Typography>No messages yet.</Typography>
                    )}
                </Sheet>
            </Sheet>
        </div>
    );
}
