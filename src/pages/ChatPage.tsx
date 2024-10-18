import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from '../components/messages/MessagesPane';
import ChatsPane from '../components/messages/ChatsPane';
import { ChatProps } from '../components/core/types';
import { fetchChatsFromServer } from '../api/api';
import LanguageSwitcher from '../components/core/LanguageSwitcher';
import { ColorSchemeToggle } from '../components/core/ColorSchemeToggle';
import Sidebar from '../components/core/Sidebar';
import { Typography } from "@mui/joy";
import { useTranslation } from "react-i18next";

export default function MyProfile() {
    const currentUser = { id: 1, username: 'current_user' };

    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<ChatProps | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    React.useEffect(() => {
        const loadChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authorization token is missing');
                }

                const fetchedChats = await fetchChatsFromServer(currentUser.id, token);

                if (Array.isArray(fetchedChats)) {
                    setChats(fetchedChats);
                } else {
                    setError('No chats available.');
                    setChats([]);
                }
            } catch (error) {
                console.error('Error loading chats:', error);
                setError('Failed to load chats.');
                setChats([]);
            } finally {
                setLoading(false);
            }
        };

        loadChats();
    }, [currentUser.id]);

    React.useEffect(() => {
        if (chats.length > 0) {
            if (id) {
                const numericId = Number(id);
                if (!isNaN(numericId)) {
                    const chatById = chats.find(chat => chat.id === numericId);
                    if (chatById) {
                        setSelectedChat(chatById);
                    } else {
                        setSelectedChat(chats[0]);
                    }
                } else {
                    console.error('Параметр id не является числом');
                    setSelectedChat(chats[0]);
                }
            } else {
                setSelectedChat(chats[0]);
            }
        }

    }, [chats, id, selectedChat, navigate]);

    return (
        <div>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                width: '100%',
                position: 'relative'
            }}>
                <div style={{display: 'flex', gap: '20px'}}>
                    <LanguageSwitcher/>
                    <ColorSchemeToggle/>
                </div>
            </header>
            <Sheet
                sx={{
                    flex: 1,
                    width: '100%',
                    mx: 'auto',
                    pt: {xs: 'var(--Header-height)', sm: 0},
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
                            selectedChatId={selectedChat ? String(selectedChat.id) : ''}
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
                        <Typography sx={{textAlign: 'center', color: 'red'}}>
                            {error}
                        </Typography>
                    ) : loading ? (
                        <Typography>Loading chats...</Typography>
                    ) : selectedChat ? (
                        <MessagesPane chat={selectedChat}/>
                    ) : (
                        <Typography>No messages yet.</Typography>
                    )}
                </Sheet>
            </Sheet>
        </div>
    );
}
