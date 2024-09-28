import * as React from 'react';
import { Modal, Box, IconButton } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupHeader from './GroupHeader';
import GroupSettings from './GroupSettings';
import GroupStats from './GroupStats';
import GroupMemberList from './GroupMemberList';
import ChatSettings from './ChatSetitngs';
import { UserProps } from '../core/types';

type GroupInfoModalProps = {
    open: boolean;
    onClose: () => void;
    groupName: string;
    groupAvatar: string;
    users: UserProps[];
    currentUserId: number;
    chatId: number;  // Добавляем chatId
    token: string;   // Добавляем token
};

export default function GroupInfoModal({ open, onClose, groupName, groupAvatar, users, currentUserId, chatId, token }: GroupInfoModalProps) {
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    const currentUser = users.find(user => user.id === currentUserId);
    const currentUserRole = currentUser?.role as 'owner' | 'admin' | 'member' || 'member';

    const handleToggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const handleRoleChange = (userId: number, newRole: 'owner' | 'admin' | 'member') => {
        console.log(`Change role of user ${userId} to ${newRole}`);
        // Добавьте логику для API вызова изменения роли
    };

    const handleRemoveUser = (userId: number) => {
        console.log(`Remove user with id ${userId}`);
        // Добавьте логику для API вызова удаления пользователя
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '400px',
                        backgroundColor: 'background.body',
                        borderRadius: 'md',
                        boxShadow: 'lg',
                        overflow: 'hidden',
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

                    {currentUserRole === 'owner' && (
                        <IconButton
                            onClick={handleToggleSettings}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 48,
                                zIndex: 10,
                            }}
                        >
                            <SettingsIcon />
                        </IconButton>
                    )}

                    {isSettingsOpen ? (
                        <ChatSettings onCloseSettings={handleToggleSettings} />
                    ) : (
                        <>
                            <GroupHeader
                                groupName={groupName}
                                groupAvatar={groupAvatar}
                                totalMembers={users.length}
                                onlineMembers={users.filter(user => user.online).length}
                            />
                            <GroupSettings />
                            <GroupStats />
                            <GroupMemberList
                                users={users}
                                currentUserRole={currentUserRole}
                                onRoleChange={handleRoleChange}
                                onRemoveUser={handleRemoveUser}
                                chatId={chatId}
                                token={token}
                            />
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    );
}
