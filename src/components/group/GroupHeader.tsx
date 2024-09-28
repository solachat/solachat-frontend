import * as React from 'react';
import { Box, Avatar, Typography, Stack } from '@mui/joy';
import { useTranslation } from 'react-i18next';

type GroupHeaderProps = {
    groupName: string;
    groupAvatar: string;
    totalMembers: number;
    onlineMembers: number;
};

export default function GroupHeader({ groupName, groupAvatar, totalMembers, onlineMembers }: GroupHeaderProps) {
    const { t, i18n } = useTranslation();

    const getMemberText = (count: number) => {
        const textForms = [t('participant'), t('participants_two'), t('participants_many')];
        return count % 10 === 1 && count % 100 !== 11
            ? textForms[0]
            : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)
                ? textForms[1]
                : textForms[2];
    };

    return (
        <Box sx={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={groupAvatar} sx={{ width: 64, height: 64 }} />
            <Stack>
                <Typography fontWeight="lg" fontSize="lg">
                    {groupName}
                </Typography>
                <Typography level="body-sm">
                    {totalMembers} {getMemberText(totalMembers)}, {onlineMembers} {t('online')}
                </Typography>
            </Stack>
        </Box>
    );
}
