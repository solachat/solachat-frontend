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
};

export default function GroupInfoModal({ open, onClose, groupName, groupAvatar, users }: GroupInfoModalProps) {
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const currentUserRole = 'owner';

    const handleToggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const handleRoleChange = (userId: number, newRole: 'owner' | 'admin' | 'member') => {
        console.log(`Change role of user ${userId} to ${newRole}`);
        // Добавьте логику изменения роли
    };

    const handleRemoveUser = (userId: number) => {
        console.log(`Remove user with id ${userId}`);
        // Добавьте логику удаления пользователя
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
                            />
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    );
}
