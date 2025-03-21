import * as React from 'react';
import { Modal, Box, Button, Stack, IconButton, Typography, Avatar, Input, CircularProgress } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import { UserProps } from '../core/types';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import { addUsersToGroupChat } from '../../api/api';
import { debounce } from 'lodash';

type AddUserModalProps = {
    open: boolean;
    onClose: () => void;
    chatId: number;
    token: string;
    searchUsers: (searchTerm: string) => Promise<UserProps[]>;
};

export default function AddUserModal({ open, onClose, chatId, token, searchUsers }: AddUserModalProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<UserProps[]>([]);
    const [selectedUsers, setSelectedUsers] = React.useState<UserProps[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [addingUsers, setAddingUsers] = React.useState(false);
    const { t } = useTranslation();

    const debouncedSearch = React.useCallback(
        debounce(async (searchTerm: string) => {
            if (searchTerm.trim()) {
                setLoading(true);
                const results = await searchUsers(searchTerm);
                setSearchResults(results);
                setLoading(false);
            } else {
                setSearchResults([]);
            }
        }, 300),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const toggleUserSelection = (user: UserProps) => {
        if (selectedUsers.some((u) => u.id === user.id)) {
            setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
        } else {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    const removeSelectedUser = (userId: number) => {
        setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const handleAddUsers = async () => {
        setAddingUsers(true);
        const userIds = selectedUsers.map(user => user.id);
        try {
            await addUsersToGroupChat(chatId, userIds, token);
            setSelectedUsers([]);
            setSearchTerm('');
            setSearchResults([]);
            onClose();
        } catch (error) {
            console.error('Ошибка при добавлении пользователей:', error);
        } finally {
            setAddingUsers(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    backgroundColor: 'background.body',
                    borderRadius: 'md',
                    boxShadow: 'lg',
                    padding: '16px',
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 10,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography textAlign="center" mb={2}>
                    {t('Добавить участников')}
                </Typography>
                <Stack spacing={2}>
                    <Stack direction="row" flexWrap="wrap" spacing={1}>
                        {selectedUsers.map((user) => (
                            <Chip
                                key={user.id}
                                variant="outlined"
                                color="primary"
                                onDelete={() => removeSelectedUser(user.id)}
                                avatar={<Avatar src={user.avatar} alt={user.username} />}
                                label={user.username}
                            />
                        ))}
                    </Stack>

                    <Input
                        startDecorator={<SearchIcon />}
                        placeholder={t('Поиск пользователей')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ padding: '8px', borderRadius: 'md', backgroundColor: 'background.surface' }}
                    />

                    <Stack sx={{ maxHeight: '200px', overflowY: 'auto', marginTop: 2 }}>
                        {loading ? (
                            <Stack justifyContent="center" alignItems="center">
                                <CircularProgress />
                            </Stack>
                        ) : (
                            searchResults.map((user) => (
                                <Box
                                    key={user.id}
                                    onClick={() => toggleUserSelection(user)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedUsers.some((u) => u.id === user.id) ? 'grey.200' : 'transparent',
                                        borderRadius: 'md',
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'grey.100',
                                        },
                                    }}
                                >
                                    <Avatar src={user.avatar} alt={user.username} sx={{ marginRight: '8px' }} />
                                    <Typography>{user.username}</Typography>
                                </Box>
                            ))
                        )}
                    </Stack>

                    <Button onClick={handleAddUsers} variant="solid" disabled={!selectedUsers.length || addingUsers}>
                        {addingUsers ? <CircularProgress /> : t('Добавить')}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}
