import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Chip, Input, List } from '@mui/joy';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChatListItem from './ChatListItem';
import { ChatProps, UserProps } from '../core/types';
import { searchUsers, createPrivateChat, fetchChatsFromServer } from '../../api/api';
import LanguageSwitcher from '../core/LanguageSwitcher';
import { ColorSchemeToggle } from '../core/ColorSchemeToggle';
import { CssVarsProvider } from '@mui/joy/styles';
import { useParams } from 'react-router-dom';

type ChatsPaneProps = {
    chats: ChatProps[];
    setSelectedChat: (chat: ChatProps) => void;
    selectedChatId: string;
    currentUser: { id: number }; // currentUser передается, как и раньше
};

export default function ChatsPane(props: ChatsPaneProps) {
    const { setSelectedChat, selectedChatId, currentUser } = props;
    const { id } = useParams<{ id: string }>(); // Получаем ID чата из URL
    const { t } = useTranslation();
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<UserProps[]>([]);
    const [loadingChats, setLoadingChats] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

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
                    setChats([]);
                }
            } catch (error) {
                console.error('Error loading chats:', error);
                setError('Failed to load chats.');
                setChats([]);
            } finally {
                setLoadingChats(false);
            }
        };

        loadChats();
    }, [currentUser.id]);

    React.useEffect(() => {
        if (id) {
            const selectedChat = chats.find((chat) => chat.id.toString() === id);
            if (selectedChat) {
                setSelectedChat(selectedChat);
            }
        }
    }, [id, chats]);


    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim()) {
            const results = await searchUsers(e.target.value);
            setSearchResults(results || []);
        } else {
            setSearchResults([]);
        }
    };

    const handleUserSelect = async (user: UserProps) => {
        const token = localStorage.getItem('token'); // Получаем токен
        if (token) {
            try {
                const newChat = await createPrivateChat(currentUser.id, user.id, token);

                // После создания чата, обновляем список чатов и выбираем этот чат
                if (newChat && newChat.id) {
                    setChats((prevChats) => [...prevChats, newChat]); // Добавляем чат в список
                    setSelectedChat(newChat); // Выбираем новый чат
                }
            } catch (error) {
                console.error('Error creating chat:', error);
            }
        }
    };

    return (
        <CssVarsProvider>
            <Sheet
                sx={{
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    height: 'calc(100dvh - var(--Header-height))',
                    overflowY: 'auto',
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    pb={1.5}
                >
                    <Typography
                        fontSize={{ xs: 'md', md: 'lg' }}
                        component="h1"
                        fontWeight="lg"
                        endDecorator={
                            <Chip
                                variant="soft"
                                color="primary"
                                size="md"
                                slotProps={{ root: { component: 'span' } }}
                            >
                                {chats.length}
                            </Chip>
                        }
                        sx={{ mr: 'auto' }}
                    >
                        {t('Messages')}
                    </Typography>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <LanguageSwitcher />
                        <ColorSchemeToggle />
                    </div>
                </Stack>

                <Box sx={{ px: 2, pb: 1.5 }}>
                    <Input
                        size="sm"
                        startDecorator={<SearchRoundedIcon />}
                        placeholder={t('Search')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        aria-label="Search"
                    />
                </Box>

                {searchResults.length > 0 ? (
                    <List
                        sx={{
                            py: 0,
                            '--ListItem-paddingY': '0.75rem',
                            '--ListItem-paddingX': '1rem',
                        }}
                    >
                        {searchResults.map((user) => (
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
                    loadingChats ? (
                        <Typography>Loading chats...</Typography>
                    ) : (
                        chats.length > 0 ? (
                            <List
                                sx={{
                                    py: 0,
                                    '--ListItem-paddingY': '0.75rem',
                                    '--ListItem-paddingX': '1rem',
                                }}
                            >
                                {chats.map((chat) => (
                                    <ChatListItem
                                        key={chat.id.toString()}
                                        id={chat.id.toString()}
                                        sender={chat.users.find(u => u.id !== currentUser.id) || chat.users[0]}
                                        messages={chat.messages}
                                        setSelectedChat={setSelectedChat}
                                        currentUserId={currentUser.id}
                                        chats={chats}
                                    />
                                ))}
                            </List>
                        ) : (
                            <Typography sx={{ textAlign: 'center', mt: 3 }}>
                                Start to communicate!
                            </Typography>
                        )
                    )
                )}
            </Sheet>
        </CssVarsProvider>
    );
}
