import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Chip, Input, List, IconButton } from '@mui/joy'; // Убираем Drawer, так как Sidebar будет фиксированным
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddIcon from '@mui/icons-material/Add';
import ChatListItem from './ChatListItem';
import { ChatProps, UserProps } from '../core/types';
import { searchUsers, fetchChatsFromServer } from '../../api/api';
import LanguageSwitcher from '../core/LanguageSwitcher';
import { ColorSchemeToggle } from '../core/ColorSchemeToggle';
import { CssVarsProvider } from '@mui/joy/styles';
import GroupChatModal from './GroupChatModal'; // Импортируем модальное окно
import Sidebar from '../core/Sidebar'; // Импортируем Sidebar

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
    const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false); // Управление состоянием модального окна

    // Загрузка чатов из сервера
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

    // Обработка поиска
    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim()) {
            const results = await searchUsers(e.target.value);
            setSearchResults(results || []);
        } else {
            setSearchResults([]);
        }
    };

    // Открытие и закрытие модального окна для создания группы
    const handleCreateGroupClick = () => {
        setIsGroupModalOpen(true);
    };

    const handleCloseGroupModal = () => {
        setIsGroupModalOpen(false);
    };

    const handleCreateGroup = (groupName: string) => {
        console.log('Group created with name:', groupName);
        setIsGroupModalOpen(false);
    };

    return (
        <CssVarsProvider>
            <Box sx={{ display: 'flex', height: 'auto' }}>
                {/* Sidebar всегда видим слева */}
                <Sidebar />

                {/* Основное содержимое чатов */}
                <Sheet
                    sx={{
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        height: '100%',
                        width: 'calc(100% - 140px)',
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
                        sx={{
                            flexDirection: { xs: 'column', sm: 'row' },
                        }}
                    >
                        <Typography
                            fontSize={{ xs: 'md', sm: 'lg' }}
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
                                maxWidth: '95%',
                                fontSize: '14px',
                            }}
                        />
                        <IconButton
                            onClick={handleCreateGroupClick}
                            size="sm"
                            color="primary"
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>

                    {searchResults.length > 0 ? (
                        <List>
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
                        <>
                            {loadingChats ? (
                                <Typography>Loading chats...</Typography>
                            ) : (
                                chats.length > 0 ? (
                                    <List>
                                        {chats.map((chat) => (
                                            <ChatListItem
                                                key={chat.id.toString()}
                                                id={chat.id.toString()}
                                                sender={chat.users.find(user => user.id !== currentUser.id)}
                                                messages={chat.messages}
                                                setSelectedChat={setSelectedChat}
                                                currentUserId={currentUser.id}
                                                chats={chats}
                                            />
                                        ))}
                                    </List>
                                ) : (
                                    <Typography sx={{ textAlign: 'center', mt: 3 }}>
                                        {t('startcommunicate')}
                                    </Typography>
                                )
                            )}
                        </>
                    )}

                    {/* Модальное окно для создания группового чата */}
                    <GroupChatModal
                        open={isGroupModalOpen}
                        onClose={handleCloseGroupModal}
                        onCreateGroup={handleCreateGroup}
                    />
                </Sheet>
            </Box>
        </CssVarsProvider>
    );
}
