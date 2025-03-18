import * as React from 'react';
import { Box, Stack } from '@mui/joy';
import GroupUserItem from './GroupUserItem';
import { UserProps } from '../core/types';

type GroupMemberListProps = {
    users: UserProps[];
    currentUserRole: 'owner' | 'admin' | 'member';
    onRoleChange: (userId: number, newRole: 'owner' | 'admin' | 'member') => void;
    onRemoveUser: (userId: number) => void;
    chatId: number;
    token: string;
};

export default function GroupMemberList({ users, currentUserRole, onRoleChange, onRemoveUser, chatId, token }: GroupMemberListProps) {
    return (
        <Box sx={{ padding: '16px 24px', borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="column" spacing={2}>
                {users.map((user) => (
                    <GroupUserItem
                        key={user.id}
                        user={user}
                        currentUserRole={currentUserRole}
                        onRoleChange={onRoleChange}
                        onRemoveUser={onRemoveUser}
                        chatId={chatId}
                        token={token}
                    />
                ))}
            </Stack>
        </Box>
    );
}
