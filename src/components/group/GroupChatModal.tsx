import * as React from 'react';
import { Box, Button, Modal, Input, Stack, IconButton, Typography, Avatar } from '@mui/joy';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { searchUsers, createGroupChat } from '../../api/api'; // вызов API для создания группы
import { UserProps } from '../core/types';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const muiTheme = createTheme();

type GroupChatModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function GroupChatModal({ open, onClose }: GroupChatModalProps) {
    const { t } = useTranslation(); // Инициализация перевода
    const [groupName, setGroupName] = React.useState('');
    const [avatar, setAvatar] = React.useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
    const [error, setError] = React.useState('');
    const [isAddingUsers, setIsAddingUsers] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<UserProps[]>([]);
    const [selectedUsers, setSelectedUsers] = React.useState<UserProps[]>([]);

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

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleNextStep = () => {
        if (groupName.trim() === '') {
            setError(t('Group name cannot be empty'));
        } else {
            setError('');
            setIsAddingUsers(true);
        }
    };

    const handleFinish = async () => {
        if (!selectedUsers || selectedUsers.length === 0) {
            setError(t('You must select at least one user to create a group chat.'));
            return;
        }

        try {
            const userIds = selectedUsers.map(user => user.id);
            await createGroupChat(groupName, avatar, userIds);

            toast.success(t('Group chat created successfully!'));
            resetState();
            onClose();
        } catch (error) {
            console.error('Ошибка при создании группы:', error);
            setError(t('Failed to create group'));
        }
    };

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setSearchTerm(searchTerm);

        if (searchTerm.trim()) {
            const results = await searchUsers(searchTerm);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const toggleUserSelection = (user: UserProps) => {
        if (selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
        } else {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    const handleRemoveUser = (userId: number) => {
        setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
    };

    return (
        <MuiThemeProvider theme={muiTheme}>
            <Modal open={open} onClose={handleClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {!isAddingUsers ? (
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
                                    placeholder={t('Group Name')}
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
                                    {t('Cancel')}
                                </Button>
                                <Button variant="solid" onClick={handleNextStep}>
                                    {t('Next')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                ) : (
                    <Box sx={{ width: '400px', p: 3, borderRadius: '12px', boxShadow: 'lg', bgcolor: 'background.level2' }}>
                        <Typography mb={2} sx={{ color: 'text.primary' }}>{t('Add participants')}</Typography>

                        <Input
                            startDecorator={<SearchRoundedIcon />}
                            placeholder={t('Search users')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            autoFocus={false}
                            sx={{
                                mb: 2,
                                color: 'text.primary',
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
                                        color: 'text.primary',
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
                                            color: 'text.primary',
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
                                {t('Cancel')}
                            </Button>
                            <Button variant="solid" onClick={handleFinish}>
                                {t('Done')}
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Modal>
        </MuiThemeProvider>
    );
}
