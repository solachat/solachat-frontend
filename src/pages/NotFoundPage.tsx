import React from 'react';
import { Box, Button, Typography, Stack, CssVarsProvider } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import CssBaseline from '@mui/joy/CssBaseline';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleGoHome = () => {
        navigate('/main');  // Перенаправление на главную
    };

    return (
        <CssVarsProvider>
            <Helmet>
                <title>404 {t('notFound.subtitle')}</title>
            </Helmet>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: 'background.level1',
                    textAlign: 'center',
                    padding: '16px',
                    animation: 'fadeIn 0.5s ease-in-out',
                    flexDirection: 'column',
                }}
            >
                <Stack
                    spacing={3}
                    sx={{
                        maxWidth: 600,
                        width: '100%',
                        padding: '16px',
                        animation: 'fadeInUp 0.7s ease-in-out',
                    }}
                >
                    <Typography
                        level="h1"
                        sx={{
                            fontSize: { xs: '3rem', md: '5rem' },
                            color: 'primary.main',
                            animation: 'fadeIn 1s ease-in-out',
                            fontWeight: 'bold',
                        }}
                    >
                        {t('notFound.title')}
                    </Typography>
                    <Typography
                        level="h2"
                        sx={{
                            fontSize: { xs: '1.8rem', md: '2.5rem' },
                            color: 'text.primary',
                            animation: 'fadeIn 1.2s ease-in-out',
                            marginBottom: '12px',
                        }}
                    >
                        {t('notFound.subtitle')}
                    </Typography>
                    <Typography
                        level="h3"
                        sx={{
                            fontSize: { xs: '1.5rem', md: '1.8rem' },
                            color: 'text.secondary',
                            marginBottom: '20px',
                            animation: 'fadeIn 1.4s ease-in-out',
                        }}
                    >
                        {t('notFound.description')}
                    </Typography>

                    {/* Кнопка Домой */}
                    <Button
                        variant="solid"
                        color="primary"
                        size="lg"
                        onClick={handleGoHome}  // Перенаправление на главную
                        sx={{
                            paddingX: '32px',
                            paddingY: '12px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            borderRadius: '50px',
                            transition: 'all 0.3s ease-in-out',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',  // Тень для кнопки
                            background: 'linear-gradient(135deg, #007BFF, #0056D2)',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                transform: 'scale(1.05)',  // Увеличение кнопки при наведении
                                boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.5)',  // Более сильная тень
                            },
                        }}
                    >
                        {t('notFound.button')}
                    </Button>
                </Stack>
            </Box>

            {/* CSS для анимаций */}
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </CssVarsProvider>
    );
};

export default NotFoundPage;
