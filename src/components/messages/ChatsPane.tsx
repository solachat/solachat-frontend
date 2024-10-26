import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Input, List, Skeleton } from '@mui/joy';
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

    // WebSocket для обработки событий (создание, удаление чатов и получение новых сообщений)
    useWebSocket((data) => {
        if (data.type === 'chatCreated' || data.type === 'groupChatCreated') {
            const newChat = data.chat;
            setChats((prevChats) => prevChats.some((chat) => chat.id === newChat.id) ? prevChats : [...prevChats, newChat]);
        }

        if (data.type === 'chatDeleted') {
            setChats((prevChats) => prevChats.filter((chat) => chat.id !== data.chatId));
            navigate('/chat');
        }

        if (data.type === 'newMessage') {
            const { chatId, message } = data;
            setChats((prevChats) =>
                prevChats.map((chat) => (chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat))
            );
        }
    }, []);

    // Загрузка чатов при инициализации компонента
    React.useEffect(() => {
        const loadChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authorization token is missing');

                const chatsFromServer = await fetchChatsFromServer(currentUser.id, token);
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

    // Обработчик изменения строки поиска
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

    // Закрытие сайдбара при клике вне его
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!document.querySelector('.Sidebar')?.contains(event.target as Node)) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <CssVarsProvider>
            <Box sx={{ display: 'flex', maxWidth: '100%' }}>
                {/* Кнопка меню для мобильных устройств */}
                {!selectedChatId && (
                    <IconButton
                        sx={{ display: { xs: 'block', sm: 'none' }, position: 'absolute', zIndex: 10, left: '16px', top: '16px' }}
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                {/* Сайдбар */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Лист чатов */}
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
                            <IconButton sx={{ display: { xs: 'block', sm: 'none' } }}>
                                <MenuIcon />
                            </IconButton>
                            <Input
                                size="sm"
                                startDecorator={<SearchRoundedIcon />}
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


                    {/* Список результатов поиска или список чатов */}
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
