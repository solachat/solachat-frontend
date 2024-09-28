import * as React from 'react';
import { Modal, Box, IconButton, Stack, Typography, Divider } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupHeader from './GroupHeader';
import GroupMemberList from './GroupMemberList';
import GroupStats from './GroupStats';
import ChatSettings from './ChatSetitngs';
import { UserProps } from '../core/types';
import { useTranslation } from 'react-i18next';
import AddUserModal from './AddUserModal'; // Импортируем компонент
import { searchUsers } from '../../api/api'; // Импортируем функцию поиска пользователей

type GroupInfoModalProps = {
    open: boolean;
    onClose: () => void;
    groupName: string;
    groupAvatar: string;
    users: UserProps[];
    currentUserId: number;
    chatId: number;
    token: string;
};

const getMemberLabel = (count: number, locale: string = 'en') => {
    if (locale === 'ru') {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'участник';
        } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'участника';
        } else {
            return 'участников';
        }
    } else {
        return count === 1 ? 'member' : 'members';
    }
};

export default function GroupInfoModal({ open, onClose, groupName, groupAvatar, users, currentUserId, chatId, token }: GroupInfoModalProps) {
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
    const { i18n } = useTranslation();
    const currentUser = users.find(user => user.id === currentUserId);
    const currentUserRole = currentUser?.role as 'owner' | 'admin' | 'member' || 'member';

    const handleToggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const handleAddUser = (selectedUsers: UserProps[]) => {
        console.log('Добавлены пользователи:', selectedUsers);
        // Логика для обработки добавления выбранных пользователей
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box> {/* Оборачиваем весь контент модального окна в Box */}
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
                            <Box>
                                <GroupHeader
                                    groupName={groupName}
                                    groupAvatar={groupAvatar}
                                    totalMembers={users.length}
                                    onlineMembers={users.filter(user => user.online).length}
                                />

                                <GroupStats />

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ padding: '3px 30px', borderBottom: 'none' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <GroupsIcon />
                                            <Typography>
                                                {users.length} {getMemberLabel(users.length, i18n.language)}
                                            </Typography>
                                        </Stack>
                                        <IconButton onClick={() => setIsAddUserModalOpen(true)}>
                                            <PersonAddIcon />
                                        </IconButton>
                                    </Stack>
                                </Box>
                                <GroupMemberList
                                    users={users}
                                    currentUserRole={currentUserRole}
                                    onRoleChange={() => {}}
                                    onRemoveUser={() => {}}
                                    chatId={chatId}
                                    token={token}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>

                <AddUserModal
                    open={isAddUserModalOpen}
                    onClose={() => setIsAddUserModalOpen(false)}
                    chatId={chatId}
                    token={token}
                    searchUsers={searchUsers}
                />
            </Box>
        </Modal>
    );
}
