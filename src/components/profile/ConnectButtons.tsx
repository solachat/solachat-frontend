import React, { useState } from 'react';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import { useTranslation } from 'react-i18next';
import GoogleIcon from '../core/GoogleIcon';
import TelegramIcon from '../core/TelegramIcon';
import { useNavigate } from 'react-router-dom';
import PhantomConnectButton from '../core/PhantomConnectButton'; // Импортируем компонент PhantomConnectButton
import axios from 'axios';

const ConnectButtons: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState<string | null>(null); // Храним адрес кошелька

    const connectTelegram = () => {
        navigate('/connect/telegram');
    };

    const connectGoogle = () => {
        navigate('/connect/google');
    };

    // Функция для обработки подключения Phantom
    const handlePhantomConnect = async (walletAddress: string) => {
        console.log('Connected to Phantom with wallet address:', walletAddress);
        setWalletAddress(walletAddress);

        // Здесь выполняем запрос на сервер для привязки кошелька к пользователю
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/users/attach-public-key`,
                { publicKey: walletAddress },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Wallet successfully connected:', response.data);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    };

    return (
        <Stack gap={2} sx={{ mb: 2 }}>
            {/* Используем PhantomConnectButton */}
            <PhantomConnectButton onConnect={handlePhantomConnect} />

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
