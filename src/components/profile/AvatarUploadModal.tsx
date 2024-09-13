import React, { useState } from 'react';
import { Modal, Box, Button, Typography, IconButton, CircularProgress } from '@mui/joy';
import { Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface AvatarUploadModalProps {
    open: boolean;
    onClose: () => void;
}

export default function AvatarUploadModal({ open, onClose }: AvatarUploadModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = () => {
        setLoading(true);
        // Имитируем загрузку
        setTimeout(() => {
            setLoading(false);
            alert(t('uploadSuccess')); // Используем локализацию для успешного сообщения
            onClose();
        }, 2000);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setFile(file || null);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                animation: 'fadeIn 0.5s',
                '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                },
            }}
        >
            <Box
                sx={{
                    p: 4,
                    backgroundColor: 'background.level1',
                    borderRadius: 'md',
                    width: '400px',
                    mx: 'auto',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    animation: 'slideIn 0.5s ease-in-out',
                    '@keyframes slideIn': {
                        from: { transform: 'translateY(-50%)' },
                        to: { transform: 'translateY(0)' },
                    },
                }}
            >
                <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>

                <Typography level="h4" sx={{ mb: 2 }}>
                    {t('avatarUpload')}
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            marginBottom: '16px',
                        }}
                    />
                </Box>

                <Button
                    variant="solid"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!file || loading}
                    startDecorator={loading ? <CircularProgress size="sm" /> : <UploadIcon />}
                    sx={{ mt: 2, minWidth: '150px' }}
                >
                    {loading ? t('uploading') : t('upload')}
                </Button>
            </Box>
        </Modal>
    );
}
