import * as React from 'react';
import {jwtDecode} from 'jwt-decode'; // Правильный импорт
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import { ChatProps, UserProps } from '../core/types';
import { fetchChatsFromServer } from '../../api/api';
import { Typography } from '@mui/joy';

type JwtPayload = {
    id: number;
    username: string;
};

export default function MyProfile() {
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<ChatProps | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [currentUser, setCurrentUser] = React.useState<UserProps | null>(null);

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
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

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
                    setSelectedChat(fetchedChats[0]);
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
    }, [currentUser]);

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
            {currentUser ? (
                <>
                    <ChatsPane
                        chats={chats}
                        selectedChatId={selectedChat ? selectedChat.id : ''}
                        setSelectedChat={(chat: ChatProps) => {
                            console.log('Selected chat set in MyProfile:', chat);
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
                            <Typography>Loading chats...</Typography>
                        ) : selectedChat ? (
                            <MessagesPane chat={selectedChat} />
                        ) : (
                            <MessagesPane chat={null} />
                        )}
                    </Sheet>
                </>
            ) : (
                <Typography>Loading user information...</Typography>
            )}
        </Sheet>
    );
}
