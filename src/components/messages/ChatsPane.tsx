import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import {Box, CircularProgress, Input, List, Skeleton} from '@mui/joy';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChatListItem from './ChatListItem';
import { ChatProps, UserProps } from '../core/types';
import { searchUsers, fetchChatsFromServer } from '../../api/api';
import { CssVarsProvider } from '@mui/joy/styles';
import Sidebar from '../core/Sidebar';
import { useWebSocket } from '../../api/useWebSocket';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

type ChatsPaneProps = {
    chats: ChatProps[];
    setSelectedChat: (chat: ChatProps) => void;
    selectedChatId: string;
    currentUser: { id: number };
};

export default function ChatsPane({ chats: initialChats, setSelectedChat, selectedChatId, currentUser }: ChatsPaneProps) {
    const { t } = useTranslation();
    const [chats, setChats] = React.useState<ChatProps[]>(initialChats);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<UserProps[]>([]);
    const [loadingChats, setLoadingChats] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const navigate = useNavigate();

    const { wsRef, isConnecting } = useWebSocket((data) => {
        if (data.type === 'chatCreated' || data.type === 'groupChatCreated') {
            const newChat = data.chat;
            setChats((prevChats) => {
                if (prevChats.some((chat) => chat.id === newChat.id)) return prevChats;
                return [...prevChats, newChat].sort((a, b) => b.id - a.id);
            });
        }

        if (data.type === 'chatDeleted') {
            setChats((prevChats) => prevChats.filter((chat) => chat.id !== data.chatId));
            navigate('/chat');
        }

        if (data.type === 'newMessage') {
            const newMessage = data.message;
            setChats((prevChats) => {
                return [
                    ...prevChats
                        .map((chat) =>
                            chat.id === newMessage.chatId
                                ? {
                                    ...chat,
                                    messages: [...(chat.messages || []), newMessage],
                                    lastMessage: newMessage,
                                }
                                : chat
                        )
                        .sort((a, b) => {
                            if (a.id === newMessage.chatId) return -1;
                            if (b.id === newMessage.chatId) return 1;
                            return 0;
                        })
                ];
            });
        }

        if (data.type === 'messageRead' && data.messageId) {
            const messageId = data.messageId;
            setChats((prevChats) =>
                prevChats.map((chat) => ({
                    ...chat,
                    messages: (chat.messages || []).map((msg) =>
                        msg.id === messageId ? { ...msg, isRead: true } : msg
                    ),
                    lastMessage:
                        chat.lastMessage && chat.lastMessage.id === messageId
                            ? { ...chat.lastMessage, isRead: true }
                            : chat.lastMessage,
                }))
            );
        }

        if (data.type === 'USER_CONNECTED' && 'userId' in data) {
            const userId = data.userId;
            setChats((prevChats) =>
                prevChats.map((chat) => ({
                    ...chat,
                    users: (chat.users || []).map((user) =>
                        user.id === userId ? { ...user, online: true } : user
                    ),
                }))
            );
        }

        if (data.type === 'USER_DISCONNECTED' && 'userId' in data) {
            const userId = data.userId;
            setChats((prevChats) =>
                prevChats.map((chat) => ({
                    ...chat,
                    users: (chat.users || []).map((user) =>
                        user.id === userId ? { ...user, online: false } : user
                    ),
                }))
            );
        }

    }, []);

    React.useEffect(() => {
        const loadChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authorization token is missing');

                const chatsFromServer: ChatProps[] = await fetchChatsFromServer(currentUser.id, token);
                setChats(chatsFromServer || []);
            } catch (error) {
                console.error(error);
                setError('Failed to fetch chats');
            } finally {
                setLoadingChats(false);
            }
        };
        loadChats();
    }, [currentUser.id]);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.trim()) {
            const results = await searchUsers(term);
            setSearchResults(results || []);
        } else {
            setSearchResults([]);
        }
    };

    return (
        <CssVarsProvider>
            <Box sx={{ display: 'flex', maxWidth: '100%' }}>
                {!selectedChatId && (
                    <IconButton
                        sx={{ display: { xs: 'block', sm: 'none' }, position: 'absolute', zIndex: 10, left: '16px', top: '16px' }}
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <Sheet
                    sx={{
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        height: '100vh',
                        width: { xs: selectedChatId ? '0' : '100%', sm: 'calc(100% - 198px)' },
                        overflowY: 'auto',
                        display: { xs: selectedChatId ? 'none' : 'block', sm: 'block' },
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                        p={2}
                        sx={{
                            flexDirection: { xs: 'column', sm: 'row' },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <Input
                                size="sm"
                                startDecorator={isConnecting ? <CircularProgress size="sm" /> : <SearchRoundedIcon />}
                                placeholder={t('Search')}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                aria-label="Search"
                                sx={{
                                    flex: 1,
                                    fontSize: '14px',
                                    maxWidth: { xs: '80%', sm: '100%' },
                                    ml: 1,
                                }}
                            />
                        </Box>
                    </Stack>

                    {searchResults.length > 0 ? (
                        <List>
                            {searchResults
                                .filter((user) => user.id !== currentUser.id)
                                .map((user) => (
                                    <ChatListItem
                                        key={user.id}
                                        id={user.id.toString()}
                                        sender={user}
                                        messages={[]}
                                        setSelectedChat={setSelectedChat}
                                        currentUserId={currentUser.id}
                                        chats={chats}
                                        setChats={setChats}
                                    />
                                ))}
                        </List>
                    ) : (
                        <>
                            {loadingChats ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                                    {[1, 2, 3].map((index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <Skeleton variant="circular" width={48} height={48} sx={{ ml: 1, mr: 1 }} />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
                                                <Skeleton variant="text" width="80%" />
                                            </Box>
                                            <Skeleton variant="text" width={35} sx={{ mr: 1, mt: 0.5 }} />
                                        </Box>
                                    ))}
                                </Box>
                            ) : chats.length > 0 ? (
                                <List>
                                    {chats.map((chat) => (
                                        <ChatListItem
                                            key={chat.id}
                                            id={chat.id.toString()}
                                            sender={
                                                chat.isGroup
                                                    ? undefined
                                                    : chat.users.find((user) => user.id !== currentUser.id)
                                            }
                                            messages={chat.messages || []}
                                            setSelectedChat={setSelectedChat}
                                            currentUserId={currentUser.id}
                                            chats={chats}
                                            setChats={setChats}
                                            selectedChatId={selectedChatId}
                                            isGroup={chat.isGroup}
                                        />
                                    ))}
                                </List>
                            ) : (
                                <Typography sx={{ textAlign: 'center', mt: 3 }}>
                                    {t('')}
                                </Typography>
                            )}
                        </>
                    )}
                </Sheet>
            </Box>
        </CssVarsProvider>
    );
}
