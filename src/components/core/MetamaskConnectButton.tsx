import React, { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import MetamaskIcon from "./MetamaskIcon";

interface MetamaskConnectButtonProps {
    onConnect: (walletAddress: string) => void;
}

const MetamaskConnectButton: React.FC<MetamaskConnectButtonProps> = ({ onConnect }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const connectMetaMask = async () => {
        setLoading(true);
        setError(null);

        try {
            const { ethereum } = window as any;
            if (ethereum && ethereum.isMetaMask) {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const walletAddress = accounts[0];
                setIsConnected(true);
                onConnect(walletAddress);
            } else {
                setError(t('metaMaskNotFound'));
            }
        } catch (error) {
            console.error('Connection to MetaMask failed:', error);
            setError(t('metaMaskConnectFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && (
                <Alert color="danger" variant="soft">
                    {error}
                </Alert>
            )}
            <Button
                onClick={connectMetaMask}
                fullWidth
                variant="soft"
                color="neutral"
                startDecorator={loading ? <CircularProgress size="sm" /> : <MetamaskIcon />}
                disabled={loading || isConnected}
                sx={{

                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                        backgroundColor: isConnected ? 'success.lightBg' : 'primary.lightBg',
                    },
                }}
            >
                {loading ? t('connecting') : isConnected ? t('metaMaskConnected') : t('connectMetaMask')}
            </Button>
        </>
    );
};

export default MetamaskConnectButton;
