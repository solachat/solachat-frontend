import React, { useEffect } from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Box } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import EmailIcon from '@mui/icons-material/Email';

interface AboutModalProps {
    open: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
    const { t } = useTranslation();

    useEffect(() => {
        let scrollPosition = 0;
        if (open) {
            scrollPosition = window.pageYOffset;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPosition}px`;
            document.body.style.width = '100%';
        } else {
            document.body.style.position = '';
            document.body.style.top = '';
            window.scrollTo(0, scrollPosition);
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            window.scrollTo(0, scrollPosition);
        };
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                backdropFilter: 'blur(4px)',
                '& .MuiBackdrop-root': { bgcolor: 'rgba(10, 25, 47, 0.7)' }
            }}
        >
            <ModalDialog
                sx={{
                    maxWidth: '600px',
                    bgcolor: '#0a192f',
                    border: '1px solid rgba(0, 168, 255, 0.3)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 168, 255, 0.2)',
                    overflow: 'hidden'
                }}
            >
                <ModalClose
                    sx={{
                        color: '#00a8ff',
                        '&:hover': { bgcolor: 'rgba(0, 168, 255, 0.1)' }
                    }}
                />
                <Typography
                    level="h4"
                    sx={{
                        mb: 3,
                        color: '#00a8ff',
                        fontWeight: 'bold',
                        pb: 2,
                        borderBottom: '1px solid rgba(0, 168, 255, 0.2)'
                    }}
                >
                    {t('aboutSolacoinTitle')}
                </Typography>

                <Box
                    sx={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        pr: 2,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'rgba(0, 168, 255, 0.3)',
                            borderRadius: '3px'
                        }
                    }}
                >
                    {/* Welcome Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#00a8ff', fontWeight: 'bold', mb: 1 }}>
                            {t('welcome')}
                        </Typography>
                        <Typography sx={{ color: '#a0d4ff', lineHeight: 1.7 }}>
                            {t('description')}
                        </Typography>
                    </Box>

                    {/* Mission Section */}
                    <Box sx={{ mb: 3, pb: 3, borderBottom: '1px solid rgba(0, 168, 255, 0.1)' }}>
                        <Typography sx={{ color: '#00a8ff', fontWeight: 'bold', mb: 1 }}>
                            {t('mission')}
                        </Typography>
                        <Typography sx={{ color: '#a0d4ff', lineHeight: 1.7 }}>
                            {t('missionDescription')}
                        </Typography>
                    </Box>

                    {/* Projects Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#00a8ff', fontWeight: 'bold', mb: 2 }}>
                            {t('projects')}
                        </Typography>
                        <Typography sx={{ color: '#a0d4ff', mb: 3, lineHeight: 1.7 }}>
                            {t('projectsDescription')}
                        </Typography>

                        {[1, 2, 3].map((num) => (
                            <Box
                                key={num}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    bgcolor: 'rgba(0, 168, 255, 0.05)',
                                    borderRadius: '6px',
                                    borderLeft: '3px solid #00a8ff'
                                }}
                            >
                                <Typography sx={{ color: '#00a8ff', fontWeight: 'bold', mb: 1 }}>
                                    {num}. {t(`project${num}Title`)}
                                </Typography>
                                <Typography sx={{ color: '#a0d4ff', mb: 2, lineHeight: 1.6 }}>
                                    {t(`project${num}Description`)}
                                </Typography>
                                <Typography
                                    sx={{
                                        display: 'inline-block',
                                        fontSize: '0.9rem',
                                        color: '#00a8ff',
                                        p: '4px 12px',
                                        bgcolor: 'rgba(0, 168, 255, 0.1)',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(0, 168, 255, 0.3)'
                                    }}
                                >
                                    <strong>{t('technology')}:</strong> {t(`project${num}Tech`)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Contributing Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#00a8ff', fontWeight: 'bold', mb: 1 }}>
                            {t('contributing')}
                        </Typography>
                        <Typography sx={{ color: '#a0d4ff', mb: 2, lineHeight: 1.7 }}>
                            {t('contributingDescription')}
                        </Typography>
                        <Box
                            component="ul"
                            sx={{
                                pl: 2,
                                '& li': {
                                    position: 'relative',
                                    pl: 2,
                                    mb: 1.5,
                                    '&:before': {
                                        content: '"•"',
                                        position: 'absolute',
                                        left: 0,
                                        color: '#00a8ff'
                                    }
                                }
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <li key={num}>
                                    <Typography sx={{ color: '#a0d4ff' }}>
                                        {t(`step${num}`)}
                                    </Typography>
                                </li>
                            ))}
                        </Box>
                    </Box>

                    {/* Contact Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#00a8ff', fontWeight: 'bold', mb: 1 }}>
                            {t('contact')}
                        </Typography>
                        <Typography sx={{ color: '#a0d4ff', mb: 1, lineHeight: 1.7 }}>
                            {t('contactDescription')}
                        </Typography>
                        <Box
                            component="a"
                            href="mailto:contact@solacoin.org"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#00a8ff !important',
                                textDecoration: 'none',
                                transition: '0.3s',
                                '&:hover': { opacity: 0.8 }
                            }}
                        >
                            <EmailIcon sx={{ fontSize: 18 }} />
                            {t('email')}: contact@solacoin.org
                        </Box>
                    </Box>

                    {/* License Section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ color: '#00a8ff', fontWeight: 'bold', mb: 1 }}>
                            {t('license')}
                        </Typography>
                        <Typography sx={{ color: '#a0d4ff', lineHeight: 1.7 }}>
                            {t('licenseDescription')}
                        </Typography>
                    </Box>

                    {/* Final Note */}
                    <Typography
                        sx={{
                            color: '#a0d4ff',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            opacity: 0.8,
                            mt: 3
                        }}
                    >
                        {t('finalNote')}
                    </Typography>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default AboutModal;
