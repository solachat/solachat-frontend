import * as React from 'react';
import { Button } from '@mui/joy';
import PhantomIconPurple from './PhantomIconPurple';
import { useTranslation } from 'react-i18next';

const PhantomConnectButton = ({ onConnect }: { onConnect: (walletAddress: string) => void }) => {
    const [isConnected, setIsConnected] = React.useState(false);
    const { t } = useTranslation();

    const connectPhantom = async () => {
        try {
            const { solana } = window;
            if (solana && solana.isPhantom) {
                const response = await solana.connect();
                const walletAddress = response.publicKey.toString();
                setIsConnected(true);
                onConnect(walletAddress);
            } else {
                alert(t('phantomNotFound'));
            }
        } catch (error) {
            console.error('Connection to Phantom failed:', error);
            alert(t('phantomConnectFailed'));
        }
    };

    return (
        <Button
            onClick={connectPhantom}
            fullWidth
            variant="soft"
            color="neutral"
            startDecorator={<PhantomIconPurple />}
            sx={{ mt: 2, mb: 2 }}
        >
            {isConnected ? t('phantomConnected') : t('connectPhantom')}
        </Button>
    );
};

export default PhantomConnectButton;
