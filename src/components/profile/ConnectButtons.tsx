import React from 'react';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import { useTranslation } from 'react-i18next';
import GoogleIcon from '../core/GoogleIcon';
import TelegramIcon from '../core/TelegramIcon';
import { useNavigate } from 'react-router-dom';

const ConnectButtons: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const connectTelegram = () => {
        navigate('/connect/telegram');
    };

    const connectGoogle = () => {
        navigate('/connect/google');
    };

    return (
        <Stack gap={4} sx={{ mb: 2 }}>
            <Button
                variant="soft"
                color="neutral"
                fullWidth
                startDecorator={<TelegramIcon />}
                onClick={connectTelegram}
            >
                {t('Connect Telegram')}
            </Button>
            <Button
                variant="soft"
                color="neutral"
                fullWidth
                startDecorator={<GoogleIcon />}
                onClick={connectGoogle}
            >
                {t('Connect Google')}
            </Button>
        </Stack>
    );
};

export default ConnectButtons;
