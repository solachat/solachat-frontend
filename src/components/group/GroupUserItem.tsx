import * as React from 'react';
import { Box, Avatar, Typography, Stack, IconButton, Select, Option } from '@mui/joy';
import { UserProps } from '../core/types';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import { assignRoleInChat, removeUserFromChat } from '../../api/api';

type GroupUserItemProps = {
    user: UserProps;
    currentUserRole: 'owner' | 'admin' | 'member';
    onRoleChange: (userId: number, newRole: 'owner' | 'admin' | 'member') => void;
    onRemoveUser: (userId: number) => void;
    chatId: number;
    token: string;
};

function GroupUserItem({ user, currentUserRole, onRoleChange, onRemoveUser, chatId, token }: GroupUserItemProps) {
    const { t } = useTranslation();

    const userRole = user.role as 'owner' | 'admin' | 'member';

    const handleRoleChange = async (newRole: 'admin' | 'member') => {
        try {
            await assignRoleInChat(chatId, user.id, newRole, token);
            onRoleChange(user.id, newRole);
        } catch (error) {
            console.error('Error assigning role:', error);
        }
    };

    const handleRemoveUser = async () => {
        if (window.confirm(t('Are you sure you want to remove this user from the chat?'))) {
            try {
                await removeUserFromChat(chatId, user.id, token);
                onRemoveUser(user.id)
            } catch (error) {
                console.error('Error removing user:', error);
            }
        }
    };

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap={1}>
                <Avatar
                    src={user.avatar || 'path/to/default-group-avatar.jpg'}
                    sx={{ width: 40, height: 40 }}
                />
                <Box>
                    <Typography>{user.username}</Typography>
                    <Typography
                        level="body-sm"
                        sx={{
                            color: user.online ? 'green' : 'text.secondary',
                        }}
                    >
                        {user.online ? t('Online') : t('Offline')}
                    </Typography>
                </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
                {userRole === 'owner' ? (
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {t('Owner')}
                    </Typography>
                ) : (
                    currentUserRole === 'owner' && (
                        <Select
                            value={userRole}
                            onChange={(_, value) => handleRoleChange(value as 'admin' | 'member')}
                            sx={{ width: 120 }}
                        >
                            <Option value="member">{t('Member')}</Option>
                            <Option value="admin">{t('Admin')}</Option>
                        </Select>
                    )
                )}

                {(currentUserRole === 'owner' || currentUserRole === 'admin') && userRole !== 'owner' && (
                    <IconButton onClick={handleRemoveUser}>
                        <CloseIcon />
                    </IconButton>
                )}
            </Stack>
        </Stack>
    );
}

export default GroupUserItem;
