import * as React from 'react';
import { Box, Stack } from '@mui/joy';
import GroupUserItem from './GroupUserItem';
import { UserProps } from '../core/types';

type GroupMemberListProps = {
    users: UserProps[];
    currentUserRole: 'owner' | 'admin' | 'member';
    onRoleChange: (userId: number, newRole: 'owner' | 'admin' | 'member') => void;
    onRemoveUser: (userId: number) => void;
    chatId: number; // Добавляем chatId
    token: string;  // Добавляем token для API запросов
    onUserAdded: (user: UserProps) => void; // Добавление новой функции для добавления пользователя
    onUserRemoved: (userId: number) => void; // Для удаления пользователя
};

export default function GroupMemberList({ users, currentUserRole, onRoleChange, onRemoveUser, chatId, token, onUserAdded, onUserRemoved }: GroupMemberListProps) {
    React.useEffect(() => {
        // Подключение к WebSocket для обновлений пользователей в реальном времени
        const ws = new WebSocket(`${WS_URL.replace(/^http/, 'ws')}/ws?token=${token}`);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'userAdded') {
                onUserAdded(message.user);
            }

            if (message.type === 'userRemoved') {
                onUserRemoved(message.userId);
            }
        };

        return () => {
            ws.close();
        };
    }, [token, chatId, onUserAdded, onUserRemoved]);

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
