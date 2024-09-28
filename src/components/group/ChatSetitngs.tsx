import * as React from 'react';
import { Box, Avatar, Typography, Button, Stack, Input } from '@mui/joy';
import { useState } from 'react';
import { updateChatSettings } from '../../api/api';

type ChatSettingsProps = {
    chatId: number;
    currentGroupName: string;
    currentAvatar: string;
    onCloseSettings: () => void;
};

export default function ChatSettings({ chatId, currentGroupName, currentAvatar, onCloseSettings }: ChatSettingsProps) {
    const [groupName, setGroupName] = useState(currentGroupName);
    const [avatar, setAvatar] = useState<File | null>(null);

    const handleUpdateSettings = async () => {
        // Проверяем, были ли изменения
        const isNameChanged = groupName.trim() !== currentGroupName.trim();
        const isAvatarChanged = avatar !== null;

        // Если ничего не изменилось, просто выходим
        if (!isNameChanged && !isAvatarChanged) {
            console.log('No changes made.');
            return;
        }

        console.log('Preparing to update settings:', {
            chatId,
            groupName: isNameChanged ? groupName : undefined,
            avatar: isAvatarChanged ? avatar : null,
        });

        try {
            await updateChatSettings(chatId, isNameChanged ? groupName : undefined, isAvatarChanged ? avatar : null);
            onCloseSettings();
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAvatar(e.target.files[0]);
        }
    };

    return (
        <Box sx={{ padding: '16px 24px' }}>
            <Typography fontSize="lg" fontWeight="lg" mb={2}>
                Настройки чата
            </Typography>

            <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={avatar ? URL.createObjectURL(avatar) : currentAvatar}
                        sx={{ width: 64, height: 64, cursor: 'pointer' }}
                        onClick={() => document.getElementById('avatar-input')?.click()} // Обработчик клика
                    />
                    <Stack sx={{ flex: 1 }}>
                        <Typography>Название группы</Typography>
                        <Input
                            value={groupName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
                            placeholder="Введите новое название"
                        />
                    </Stack>
                </Box>

                <input
                    type="file"
                    id="avatar-input"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                />

                <Button onClick={handleUpdateSettings} variant="outlined">
                    Сохранить изменения
                </Button>

                <Button onClick={onCloseSettings} variant="plain">
                    Назад
                </Button>
            </Stack>
        </Box>
    );
}
