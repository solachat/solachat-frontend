import React, { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectIcon from "./WalletConnectIcon";

interface WalletConnectButtonProps {
    onConnect: (walletAddress: string) => void;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ onConnect }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const connectWalletConnect = async () => {
        setLoading(true);
        setError(null);

        try {
            const connector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org",
                qrcodeModal: QRCodeModal,
            });

            if (!connector.connected) {
                await connector.createSession();
            }

            connector.on("connect", (error, payload) => {
                if (error) throw error;

                const { accounts } = payload.params[0];
                const walletAddress = accounts[0];
                setIsConnected(true);
                onConnect(walletAddress);
            });
        } catch (error) {
            console.error("Connection to WalletConnect failed:", error);
            setError(t('walletConnectFailed'));
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
                onClick={connectWalletConnect}
                fullWidth
                variant="soft"
                color="neutral"
                startDecorator={loading ? <CircularProgress size="sm" /> : <WalletConnectIcon />}
                disabled={loading || isConnected}
                sx={{
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                        backgroundColor: isConnected ? 'success.lightBg' : 'primary.lightBg',
                    },
                }}
            >
                {loading ? t('connecting') : isConnected ? t('walletConnectConnected') : t('connectWalletConnect')}
            </Button>
        </>
    );
};

export default WalletConnectButton;
