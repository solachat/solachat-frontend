import * as React from 'react';
import { Box, Button, Modal, Input, Stack, IconButton, Typography, Avatar } from '@mui/joy';
import { Chip, createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { searchUsers } from '../../api/api';
import { UserProps } from '../core/types';
import { ThemeProvider, useTheme } from '../../theme/ThemeContext';
import CloseIcon from "@mui/icons-material/Close";

const muiTheme = createTheme({
    components: {
        MuiChip: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: 'transparent',  // Убираем ненужные стили для selected
                        '&:hover': {
                            backgroundColor: 'transparent', // Убираем стили при наведении на selected
                        },
                    },
                },
            },
        },
    },
});


type GroupChatModalProps = {
    open: boolean;
    onClose: () => void;
    onCreateGroup: (groupName: string, avatar?: File | null, selectedUsers?: UserProps[]) => void;
};

export default function GroupChatModal({ open, onClose, onCreateGroup }: GroupChatModalProps) {
    const [groupName, setGroupName] = React.useState(''); // Название группы
    const [avatar, setAvatar] = React.useState<File | null>(null); // Сохраняем аватар
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null); // Для предварительного просмотра аватара
    const [error, setError] = React.useState(''); // Для отображения ошибок
    const [isAddingUsers, setIsAddingUsers] = React.useState(false); // Шаг добавления участников
    const [searchTerm, setSearchTerm] = React.useState(''); // Поисковый запрос для участников
    const [searchResults, setSearchResults] = React.useState<UserProps[]>([]); // Результаты поиска пользователей
    const [selectedUsers, setSelectedUsers] = React.useState<UserProps[]>([]); // Выбранные пользователи

    // Функция сброса состояния
    const resetState = () => {
        setGroupName('');
        setAvatar(null);
        setAvatarPreview(null);
        setSelectedUsers([]);
        setSearchTerm('');
        setSearchResults([]);
        setIsAddingUsers(false);
        setError('');
    };

    // Обработка закрытия и сброса
    const handleClose = () => {
        resetState(); // Сбрасываем состояние
        onClose(); // Закрываем модальное окно
    };

    // Обработка загрузки аватара
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setAvatar(file); // Сохраняем загруженный файл
            setAvatarPreview(URL.createObjectURL(file)); // Создаем ссылку для предварительного просмотра
        }
    };

    // Переход к шагу добавления участников
    const handleNextStep = () => {
        if (groupName.trim() === '') {
            setError('Название группы не может быть пустым или состоять только из пробелов');
        } else {
            setError('');
            setIsAddingUsers(true); // Переходим к добавлению участников
        }
    };

    // Обработка завершения создания группы с участниками
    const handleFinish = () => {
        onCreateGroup(groupName, avatar, selectedUsers); // Передаем название группы, аватар и выбранных участников
        handleClose(); // Сбрасываем состояние и закрываем модальное окно
    };

    // Обработка поиска пользователей
    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setSearchTerm(searchTerm);

        if (searchTerm.trim()) {
            const results = await searchUsers(searchTerm); // Запрос на сервер для поиска пользователей
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    // Добавление или удаление пользователя из выбранных
    const toggleUserSelection = (user: UserProps) => {
        if (selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
        } else {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    // Удаление выбранного пользователя
    const handleRemoveUser = (userId: number) => {
        setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
    };

    return (
        <MuiThemeProvider theme={muiTheme}>
            <Modal open={open} onClose={handleClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {!isAddingUsers ? (
                    // Первый шаг: ввод информации о группе
                    <Box sx={{ width: '400px', p: 3, borderRadius: '12px', boxShadow: 'lg', bgcolor: 'background.level2' }}>
                        <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ position: 'relative' }}>
                                    <input
                                        accept="image/*"
                                        id="avatar-upload"
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <label htmlFor="avatar-upload">
                                        <IconButton component="span" sx={{ width: 64, height: 64 }}>
                                            {avatarPreview ? (
                                                <Avatar src={avatarPreview} sx={{ width: 64, height: 64 }} />
                                            ) : (
                                                <PhotoCameraIcon fontSize="large" />
                                            )}
                                        </IconButton>
                                    </label>
                                </Box>

                                <Input
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Название группы"
                                    sx={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                    }}
                                />
                            </Stack>

                            {error && (
                                <Typography color="danger" fontSize="sm" textAlign="center">
                                    {error}
                                </Typography>
                            )}

                            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                <Button variant="plain" onClick={handleClose}>
                                    Отмена
                                </Button>
                                <Button variant="solid" onClick={handleNextStep}>
                                    Далее
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                ) : (
                    // Второй шаг: добавление участников
                    <Box sx={{ width: '400px', p: 3, borderRadius: '12px', boxShadow: 'lg', bgcolor: 'background.level2' }}>
                        <Typography mb={2} sx={{ color: 'text.primary' }}>Добавить участников</Typography>

                        <Input
                            startDecorator={<SearchRoundedIcon />}
                            placeholder="Поиск пользователей"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            autoFocus={false}
                            sx={{
                                mb: 2,
                                color: 'text.primary', // Цвет текста для input
                            }}
                        />

                        <Stack direction="row" spacing={1} mb={2}>
                            {selectedUsers.map((user) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: '1px solid gray',
                                        borderRadius: '16px',
                                        padding: '4px',
                                        marginRight: '8px',
                                        minWidth: '60px',
                                        maxWidth: '100px',
                                        overflow: 'hidden',
                                        color: 'text.primary', // Цвет текста для блока
                                    }}
                                >
                                    <Avatar
                                        src={user.avatar}
                                        alt={user.username}
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            marginRight: '4px',
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color: 'text.primary', // Цвет текста для имени пользователя
                                        }}
                                    >
                                        {user.username}
                                    </Typography>
                                    <IconButton
                                        onClick={() => handleRemoveUser(user.id)}
                                        sx={{
                                            marginLeft: '4px',
                                            padding: '4px',
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: '16px' }} />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>

                        <Stack sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {searchResults.map((user: UserProps) => (
                                <Box
                                    key={user.id}
                                    onClick={() => toggleUserSelection(user)}
                                    sx={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 1,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Avatar src={user.avatar} alt={user.username} sx={{ width: 32, height: 32 }} />
                                    <Typography sx={{ ml: 2 }}>{user.username}</Typography>
                                </Box>
                            ))}
                        </Stack>

                        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
                            <Button variant="plain" onClick={handleClose}>
                                Отмена
                            </Button>
                            <Button variant="solid" onClick={handleFinish}>
                                Готово
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Modal>
        </MuiThemeProvider>
    );
}

