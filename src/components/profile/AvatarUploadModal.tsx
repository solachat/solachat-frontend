import React, { useState } from 'react';
import { Modal, Box, Button, Typography, IconButton, CircularProgress, Alert } from '@mui/joy';
import { Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface AvatarUploadModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (avatarUrl: string) => void;
}

export default function AvatarUploadModal({ open, onClose, onSuccess }: AvatarUploadModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.put(`${API_URL}/api/users/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    } else {
                    }
                },
            });

            const avatarUrl = response.data.avatar;
            setLoading(false);
            onSuccess(avatarUrl);
            onClose();
        } catch (error: any) {
            setLoading(false);
            setError(t('uploadFailed'));
            console.error(error);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        setFile(selectedFile || null);
        setError(null);
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

                {error && (
                    <Alert color="danger" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

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
