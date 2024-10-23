import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Input, List } from '@mui/joy';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChatListItem from './ChatListItem';
import { ChatProps, UserProps } from '../core/types';
import { searchUsers, fetchChatsFromServer } from '../../api/api';
import { CssVarsProvider } from '@mui/joy/styles';
import Sidebar from '../core/Sidebar';
import CircularProgress from '@mui/joy/CircularProgress';
import { useWebSocket } from '../../api/useWebSocket';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

type ChatsPaneProps = {
    chats: ChatProps[];
    setSelectedChat: (chat: ChatProps) => void;
    selectedChatId: string;
    currentUser: { id: number };
};

export default function ChatsPane(props: ChatsPaneProps) {
    const { setSelectedChat, selectedChatId, currentUser } = props;
    const { t } = useTranslation();
    const [chats, setChats] = React.useState<ChatProps[]>(props.chats);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<UserProps[]>([]);
    const [loadingChats, setLoadingChats] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false); // состояние для Sidebar

    useWebSocket((message) => {
        if (message.type === 'chatCreated') {
            const newChat = message.chat;
            setChats((prevChats) => {
                const chatExists = prevChats.some((chat) => chat.id === newChat.id);
                if (!chatExists) {
                    return [...prevChats, newChat];
                }
                return prevChats;
            });
        }
    }, []);

    React.useEffect(() => {
        const loadChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Authorization token is missing');
                    setError('Authorization token is missing');
                    return;
                }

                const chatsFromServer = await fetchChatsFromServer(currentUser.id, token);
                setChats(chatsFromServer || []);
                setLoadingChats(false);
            } catch (error) {
                console.error('Error fetching chats:', error);
                setError('Failed to fetch chats');
                setLoadingChats(false);
            }
        };

        loadChats();
    }, [currentUser.id]);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim()) {
            const results = await searchUsers(e.target.value);
            setSearchResults(results || []);
        } else {
            setSearchResults([]);
        }
    };

    // Закрытие Sidebar при клике вне его области
    const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.querySelector('.Sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
            setIsSidebarOpen(false);
        }
    };

    React.useEffect(() => {
        // Добавление обработчика события клика
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Удаление обработчика при размонтировании компонента
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <CssVarsProvider>
            <Box sx={{ display: 'flex', height: 'auto', maxWidth: '100%' }}>
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
                        width: { xs: selectedChatId ? '0' : '100%', sm: 'calc(100% - 199px)' },
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
                        pb={1.5}
                        sx={{
                            flexDirection: { xs: 'column', sm: 'row' },
                        }}
                    >
                        <Typography
                            fontSize={{ xs: 'md', sm: 'lg' }}
                            component="h1"
                            fontWeight="lg"
                            sx={{ mr: 'auto', ml: { xs: 2, sm: 0 } }}
                        >
                            {t('Messages')}
                        </Typography>
                    </Stack>

                    <Box sx={{ px: 2, pb: 1.5, display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Input
                            size="sm"
                            startDecorator={<SearchRoundedIcon />}
                            placeholder={t('Search')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            aria-label="Search"
                            sx={{
                                flex: 1,
                                maxWidth: '100%',
                                fontSize: '14px',
                            }}
                        />
                    </Box>

                    {searchResults.length > 0 ? (
                        <List>
                            {searchResults
                                .filter((user) => user.id !== currentUser.id)
                                .map((user) => (
                                    <ChatListItem
                                        key={user.id.toString()}
                                        id={user.id.toString()}
                                        sender={user}
                                        messages={[]}
                                        setSelectedChat={setSelectedChat}
                                        currentUserId={currentUser.id}
                                        chats={chats}
                                    />
                                ))}
                        </List>
                    ) : (
                        <>
                            {loadingChats ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mt: 2,
                                    }}
                                >
                                    <CircularProgress color="primary" />
                                    <Typography fontSize="lg" sx={{ mt: 2, color: 'text.secondary' }}>
                                        {t('Loading chats...')}
                                    </Typography>
                                </Box>
                            ) : chats && chats.length > 0 ? (
                                <List>
                                    {chats.map((chat) => (
                                        <ChatListItem
                                            key={chat.id.toString()}
                                            id={chat.id.toString()}
                                            sender={
                                                chat.isGroup
                                                    ? undefined
                                                    : chat.users && chat.users.find((user) => user.id !== currentUser.id)
                                            }
                                            messages={chat.messages}
                                            setSelectedChat={setSelectedChat}
                                            currentUserId={currentUser.id}
                                            chats={chats}
                                            selectedChatId={selectedChatId}
                                            isGroup={chat.isGroup}
                                        />
                                    ))}
                                </List>
                            ) : (
                                <Typography sx={{ textAlign: 'center', mt: 3 }}>
                                    {t('startcommunicate')}
                                </Typography>
                            )}
                        </>
                    )}
                </Sheet>
            </Box>
        </CssVarsProvider>
    );
}
