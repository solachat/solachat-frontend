import * as React from 'react';
import {useSearchParams} from 'react-router-dom'; // Добавляем для работы с параметрами URL
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import {ChatProps, UserProps} from '../core/types';
import {fetchChatsFromServer} from '../../api/api';
import {Typography} from '@mui/joy';
import {useTranslation} from "react-i18next";
import {JwtPayload} from "jsonwebtoken";
import {jwtDecode} from 'jwt-decode';
import {Helmet} from "react-helmet-async"; // Правильный импорт

export default function MyProfile() {
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<ChatProps | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [currentUser, setCurrentUser] = React.useState<UserProps | null>(null);
    const {t} = useTranslation();
    const [searchParams] = useSearchParams();

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
                    pt: {xs: 'var(--Header-height)', sm: 0},
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
                                <Typography sx={{textAlign: 'center', color: 'red'}}>{error}</Typography>
                            ) : loading ? (
                                <Typography>Loading chats...</Typography>
                            ) : selectedChat ? (
                                <MessagesPane chat={selectedChat}/>
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
