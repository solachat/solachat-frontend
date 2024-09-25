import React, { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/joy';
import PhantomIconPurple from './PhantomIconPurple';
import { useTranslation } from 'react-i18next';

interface PhantomConnectButtonProps {
    onConnect: (walletAddress: string) => void;
}

const PhantomConnectButton: React.FC<PhantomConnectButtonProps> = ({ onConnect }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const connectPhantom = async () => {
        setLoading(true);
        setError(null);

        try {
            const { solana } = window;
            if (solana && solana.isPhantom) {
                const response = await solana.connect();
                const walletAddress = response.publicKey.toString();
                setIsConnected(true);
                onConnect(walletAddress);
            } else {
                setError(t('phantomNotFound'));
            }
        } catch (error) {
            console.error('Connection to Phantom failed:', error);
            setError(t('phantomConnectFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && (
                <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Button
                onClick={connectPhantom}
                fullWidth
                variant="soft"
                color="neutral"
                startDecorator={loading ? <CircularProgress size="sm" /> : <PhantomIconPurple />}
                disabled={loading || isConnected}
                sx={{
                    mt: 2,
                    mb: 2,
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                        backgroundColor: isConnected ? 'success.lightBg' : 'primary.lightBg',
                    },
                }}
            >
                {loading ? t('connecting') : isConnected ? t('phantomConnected') : t('connectPhantom')}
            </Button>
        </>
    );
};

export default PhantomConnectButton;
