import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { setupTotp, verifyTotp } from '../../api/api';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Input from '@mui/joy/Input';
import Alert from '@mui/joy/Alert';
import { useTranslation } from 'react-i18next';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Stack from '@mui/joy/Stack';

interface SecurityModalProps {
    open: boolean;
    onClose: () => void;
    username: string;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ open, onClose, username }) => {
    const { t } = useTranslation();
    const [confirmationOpen, setConfirmationOpen] = useState(true);
    const [totpModalOpen, setTotpModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [secret, setSecret] = useState<string>('');
    const [totpCode, setTotpCode] = useState<string>('');
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (totpModalOpen) {
            const token = localStorage.getItem('token');
            if (token) {
                setupTotp(token)
                    .then((data) => {
                        setSecret(data.secret);
                        return QRCode.toDataURL(data.otpauthUrl);
                    })
                    .then((url) => {
                        setQrCodeUrl(url);
                    })
                    .catch((error) => {
                        console.error('Error setting up TOTP:', error);
                    });
            }
        }
    }, [totpModalOpen]);

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTotpSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await verifyTotp(totpCode, token);
            if (response.success) {
                setValidationMessage(t('Authenticator linked successfully!'));
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                setValidationMessage(t('Invalid code. Please try again.'));
            }
        } catch (error) {
            setValidationMessage(t('Error validating code. Please try again later.'));
            console.error('TOTP verification error:', error);
        }
    };

    return (
        <>
            <Modal open={confirmationOpen && open} onClose={onClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card variant="outlined" sx={{ width: '100%', maxWidth: 400, boxShadow: 3, borderRadius: 2, p: 3 }}>
                    <Typography component="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center'}}>
                        {t('Enable Two-Factor Authentication')}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography id="confirmation-title" sx={{ fontSize: '1rem', mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                        {t('Are you sure you want to start the procedure?')}
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button onClick={() => { setConfirmationOpen(false); setTotpModalOpen(true); }} variant="solid" color="primary" sx={{ width: '100%' }}>
                            {t('Yes, Continue')}
                        </Button>
                        <Button onClick={onClose} variant="outlined" color="neutral" sx={{ width: '100%' }}>
                            {t('No')}
                        </Button>
                    </Stack>
                </Card>
            </Modal>


            <Modal open={totpModalOpen && open} onClose={onClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card variant="outlined" sx={{ width: '100%', maxWidth: 400, boxShadow: 3, borderRadius: 2, p: 3, backgroundColor: 'background.paper' }}>
                    <Typography component="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1, textAlign: 'center' }}>
                        {t('Enable Two-Factor Authentication')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        {qrCodeUrl && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                                <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', maxWidth: 180, borderRadius: 8 }} />
                            </Box>
                        )}

                        <Alert sx={{ mb: 2, fontSize: '0.9rem', px: 2 }}>
                            {t('Scan this QR code with Authy or any TOTP app')}
                        </Alert>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {t('Secret Key')}:
                            </Typography>
                            <Typography sx={{ fontWeight: 'bold', color: 'primary.500', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                                {secret}
                            </Typography>
                            <IconButton size="sm" onClick={handleCopySecret} sx={{ ml: 1 }}>
                                {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                            </IconButton>
                        </Box>

                        <Input
                            placeholder={t('Enter the code from your authenticator')}
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value)}
                            sx={{ my: 2, width: '100%' }}
                        />

                        {validationMessage && (
                            <Typography color={validationMessage.includes('successfully') ? 'success' : 'danger'} sx={{ mb: 1 }}>
                                {validationMessage}
                            </Typography>
                        )}

                        <Button onClick={handleTotpSubmit} variant="solid" color="primary" fullWidth sx={{ mb: 1 }}>
                            {t('Verify and Link')}
                        </Button>
                        <Button onClick={onClose} variant="outlined" color="neutral" fullWidth>
                            {t('Close')}
                        </Button>
                    </CardContent>
                </Card>
            </Modal>
        </>
    );
};

export default SecurityModal;
