import React, { useState } from 'react';
import { Modal, Box, Button, Typography, IconButton, CircularProgress, Textarea, Stack } from '@mui/joy';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ReportModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (reportText: string) => void;
    loading: boolean;
    username: string;
}

export default function ReportModal({ open, onClose, onSubmit, loading, username }: ReportModalProps) {
    const { t } = useTranslation();
    const [reportText, setReportText] = useState('');

    const handleReportSubmit = () => {
        if (reportText) {
            onSubmit(reportText);
        }
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
                    {t('reportTitle', { username })}
                </Typography>

                <Typography sx={{ mb: 2 }}>
                    {t('reportDescription')}
                </Typography>

                <Textarea
                    placeholder={t('describeViolation')}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    sx={{
                        width: '100%',
                        mb: 2,
                        minHeight: '100px',
                    }}
                />

                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" color="danger" onClick={onClose}>
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        color="success"
                        onClick={handleReportSubmit}
                        disabled={loading}
                        startDecorator={loading ? <CircularProgress size="sm" /> : null}
                    >
                        {t('send')}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}
