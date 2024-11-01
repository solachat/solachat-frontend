import * as React from 'react';
import { Box, Avatar, Typography, Button, Stack, Input } from '@mui/joy';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateChatSettings } from '../../api/api';

type ChatSettingsProps = {
    chatId: number;
    currentGroupName: string;
    currentAvatar: string;
    onCloseSettings: () => void;
};

export default function ChatSettings({ chatId, currentGroupName, currentAvatar, onCloseSettings }: ChatSettingsProps) {
    const { t } = useTranslation();
    const [groupName, setGroupName] = useState(currentGroupName);
    const [avatar, setAvatar] = useState<File | null>(null);

    const handleUpdateSettings = async () => {
        const isNameChanged = groupName.trim() !== currentGroupName.trim();
        const isAvatarChanged = avatar !== null;

        if (!isNameChanged && !isAvatarChanged) {
            console.log(t('chatSettings.noChanges'));
            return;
        }

        console.log(t('chatSettings.preparingUpdate'), {
            chatId,
            groupName: isNameChanged ? groupName : undefined,
            avatar: isAvatarChanged ? avatar : null,
        });

        try {
            await updateChatSettings(chatId, isNameChanged ? groupName : undefined, isAvatarChanged ? avatar : null);
            onCloseSettings();
        } catch (error) {
            console.error(t('chatSettings.updateFailed'), error);
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
                {t('chatSettings.title')}
            </Typography>

            <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={avatar ? URL.createObjectURL(avatar) : currentAvatar}
                        sx={{ width: 64, height: 64, cursor: 'pointer' }}
                        onClick={() => document.getElementById('avatar-input')?.click()}
                    />
                    <Stack sx={{ flex: 1 }}>
                        <Typography>{t('chatSettings.groupNameLabel')}</Typography>
                        <Input
                            value={groupName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
                            placeholder={t('chatSettings.groupNamePlaceholder')}
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
                    {t('chatSettings.saveChanges')}
                </Button>

                <Button onClick={onCloseSettings} variant="plain">
                    {t('chatSettings.back')}
                </Button>
            </Stack>
        </Box>
    );
}
