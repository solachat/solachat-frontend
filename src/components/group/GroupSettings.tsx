import * as React from 'react';
import { Box, Stack, Typography, Switch } from '@mui/joy';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function GroupSettings() {
    return (
        <Box sx={{ padding: '16px 24px', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={1}>
                    <NotificationsIcon />
                    <Typography fontWeight="md">Уведомления</Typography>
                </Stack>
                <Switch />
            </Stack>
        </Box>
    );
}
