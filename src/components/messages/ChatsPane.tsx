import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Chip, Input, List } from '@mui/joy';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChatListItem from './ChatListItem';
import { ChatProps, UserProps } from '../core/types';
import { searchUsers, createPrivateChat } from '../../api/api';
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
    const { chats, setSelectedChat, selectedChatId, currentUser } = props;
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<UserProps[]>([]);

    // Обработка изменений в поисковой строке
    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim()) {
            const results = await searchUsers(e.target.value); // выполняем поиск пользователей
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    // Обработка клика по пользователю для начала чата
    const handleUserSelect = async (user: UserProps) => {
        try {
            // Создаем новый чат с текущим пользователем и выбранным пользователем
            const newChat = await createPrivateChat(currentUser.id, user.id);
            setSelectedChat(newChat); // Устанавливаем новый чат как выбранный
        } catch (error) {
            console.error('Ошибка при создании чата:', error);
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
                                    name: user.name,
                                    username: user.username,
                                    avatar: user.avatar,
                                    online: user.online,
                                }}
                                messages={[]}
                                setSelectedChat={setSelectedChat}
                                onClick={() => handleUserSelect(user)}
                            />
                        ))}
                    </List>
                ) : (
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
                )}
            </Sheet>
        </CssVarsProvider>
    );
}
