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

type ChatsPaneProps = {
    chats: ChatProps[];
    setSelectedChat: (chat: ChatProps) => void;
    selectedChatId: string;
    currentUser: { id: number };
};

export default function ChatsPane(props: ChatsPaneProps) {
    const { setSelectedChat, selectedChatId, currentUser } = props;
    const { t } = useTranslation();
    const [chats, setChats] = React.useState<ChatProps[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<UserProps[]>([]);
    const [loadingChats, setLoadingChats] = React.useState(true);

    React.useEffect(() => {
        const loadChats = async () => {
            try {
                const chatsFromServer = await fetchChatsFromServer(currentUser.id.toString());
                setChats(chatsFromServer);
                setLoadingChats(false);
            } catch (error) {
                console.error("Error fetching chats:", error);
                setLoadingChats(false);
            }
        };

        loadChats();
    }, [currentUser.id]);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim()) {
            const results = await searchUsers(e.target.value);
            console.log("Search results from API:", results);
            if (results.length === 0) {
                console.log("No users found matching the search term.");
            }
            setSearchResults(results);
        } else {
            console.log("Search term is empty, resetting search results.");
            setSearchResults([]);
        }
    };

    const handleUserSelect = async (user: UserProps) => {
        try {
            console.log("Creating chat with user:", user);
            const newChat = await createPrivateChat(currentUser.id, user.id);
            console.log("Chat created successfully:", newChat);

            if (newChat && newChat.id) {
                setChats(prevChats => [...prevChats, newChat]);
                setSelectedChat(newChat);
            } else {
                console.error('Ошибка при создании чата: данные чата отсутствуют');
                alert('Error creating chat: chat data is missing.');
            }
        } catch (error) {
            console.error('Ошибка при создании чата:', error);
            alert('Error creating chat. Please try again.');
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

                {/* Отображаем результаты поиска */}
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
                                sender={{
                                    id: user.id,
                                    realname: user.realname,
                                    username: user.username,
                                    avatar: user.avatar,
                                    online: user.online,
                                }}
                                messages={[]}
                                setSelectedChat={setSelectedChat}
                                onClick={() => {
                                    console.log("User clicked:", user);
                                    handleUserSelect(user);
                                }}
                            />
                        ))}
                    </List>
                ) : (
                    <>
                        {loadingChats ? (
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
                                            {...chat}
                                            setSelectedChat={setSelectedChat}
                                            selectedChatId={selectedChatId}
                                        />
                                    ))}
                                </List>
                            ) : (
                                <Typography sx={{ textAlign: 'center', mt: 3 }}>
                                    Start to communicate!
                                </Typography>
                            )
                        )}
                    </>
                )}
            </Sheet>
        </CssVarsProvider>
    );
}
