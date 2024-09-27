import * as React from 'react';
import { Box, Typography, Button, Stack } from '@mui/joy';

type ChatSettingsProps = {
    onCloseSettings: () => void;
};

export default function ChatSettings({ onCloseSettings }: ChatSettingsProps) {
    return (
        <Box sx={{ padding: '16px 24px' }}>
            <Typography fontSize="lg" fontWeight="lg">
                Настройки чата
            </Typography>

            <Stack spacing={2} mt={2}>
                <Box>
                    <Typography>Изменить название группы</Typography>
                    <Button variant="outlined">Изменить</Button>
                </Box>

                <Box>
                    <Typography>Удалить чат</Typography>
                    <Button variant="outlined" color="danger">
                        Удалить
                    </Button>
                </Box>

                <Button onClick={onCloseSettings} variant="plain">
                    Назад
                </Button>
            </Stack>
        </Box>
    );
}
