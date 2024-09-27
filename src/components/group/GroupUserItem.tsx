import * as React from 'react';
import { Box, Avatar, Typography, Stack, IconButton, Select, Option } from '@mui/joy';
import { UserProps } from '../core/types';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';

type GroupUserItemProps = {
    user: UserProps;
    currentUserRole: 'owner' | 'admin' | 'member';
    onRoleChange: (userId: number, newRole: 'owner' | 'admin' | 'member') => void;
    onRemoveUser: (userId: number) => void;
};

function GroupUserItem({ user, currentUserRole, onRoleChange, onRemoveUser }: GroupUserItemProps) {
    const { t } = useTranslation();

    const roleTranslation: Record<'owner' | 'admin' | 'member', string> = {
        owner: t('Owner'),
        admin: t('Admin'),
        member: t('Member'),
    };

    const userRole = user.role as 'owner' | 'admin' | 'member';

    const handleRemoveUser = () => {
        if (window.confirm(t('Are you sure you want to remove this user from the chat?'))) {
            onRemoveUser(user.id);
        }
    };

    const handleRoleChange = (value: 'owner' | 'admin' | 'member') => {
        onRoleChange(user.id, value);
    };

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap={1}>
                <Avatar
                    src={user.avatar || 'https://via.placeholder.com/40'}
                    sx={{ width: 40, height: 40 }}
                />
                <Box>
                    <Typography>{user.realname || user.username}</Typography>
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
                {(userRole === 'admin' || userRole === 'member') && currentUserRole === 'owner' ? (
                    <Select
                        value={userRole}
                        onChange={(_, value) => handleRoleChange(value as 'owner' | 'admin' | 'member')}
                        sx={{ width: 120 }}
                    >
                        <Option value="member">{t('Member')}</Option>
                        <Option value="admin">{t('Admin')}</Option>
                    </Select>
                ) : (
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {roleTranslation[userRole]}
                    </Typography>
                )}

                {currentUserRole === 'owner' && (
                    <IconButton onClick={handleRemoveUser}>
                        <CloseIcon />
                    </IconButton>
                )}
            </Stack>
        </Stack>
    );
}

export default GroupUserItem;
