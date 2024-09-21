import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import { ChatProps, UserProps } from '../core/types';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchChatsFromServer } from '../../api/api';
import { Typography } from "@mui/joy";

export default function MyProfile() {
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const { id } = useParams<{ id: string }>(); // Получаем параметр id из URL
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

    // Сравниваем id из URL с id чатов, приводя id к числу
    const selectedChat = chats.find((chat) => chat.id.toString() === id) || chats[0];

    const setSelectedChat = (chat: ChatProps) => {
        navigate(`/chat?id=${chat.id}`);
    };

    React.useEffect(() => {
        // Следим за изменением id и обновляем выбранный чат
        if (id) {
            const selectedChat = chats.find((chat) => chat.id.toString() === id);
            if (selectedChat) {
                setSelectedChat(selectedChat);
            }
        }
    }, [id, chats]); // Добавили зависимость от id и списка чатов

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
                    transform: {
                        xs: 'translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))',
                        sm: 'none',
                    },
                    transition: 'transform 0.4s, width 0.4s',
                }}
            >
                <ChatsPane
                    chats={chats}
                    selectedChatId={selectedChat ? selectedChat.id.toString() : ''}
                    setSelectedChat={setSelectedChat}
                    currentUser={currentUser}
                />
            </Sheet>
            <Sheet
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
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
                    <MessagesPane chat={null} currentUserId={currentUser.id} currentUser={currentUser} />
                )}
            </Sheet>
        </Sheet>
    );
}
