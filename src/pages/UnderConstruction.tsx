import * as React from 'react';
import { Box, Button, Typography, Stack, CssVarsProvider } from '@mui/joy';
import CssBaseline from '@mui/joy/CssBaseline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const UnderConstruction: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const currentDate = new Date().toLocaleString();

    const handleGoHome = () => {
        navigate('/main');
    };

    return (
        <CssVarsProvider>
            <Helmet>
                <title>{t('underConstruction.title')}</title>
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
                        animation: 'fadeInUp 0.7s ease-in-out',  // Плавная анимация
                    }}
                >
                    <Typography
                        level="h1"
                        sx={{
                            fontSize: { xs: '2rem', md: '3.5rem' },
                            color: 'primary.main',
                            animation: 'fadeIn 1s ease-in-out',
                            marginBottom: '16px',
                        }}
                    >
                        {t('underConstruction.title')}
                    </Typography>
                    <Typography
                        level="h2"
                        sx={{
                            fontSize: { xs: '1.2rem', md: '1.8rem' },
                            color: 'text.primary',
                            animation: 'fadeIn 1.2s ease-in-out',
                            marginBottom: '12px',
                        }}
                    >
                        {t('underConstruction.subtitle')}
                    </Typography>

                    <Typography
                        level="h3"
                        sx={{
                            fontSize: { xs: '1rem', md: '1.4rem' },
                            color: 'primary.dark',
                            marginBottom: '20px',
                            animation: 'fadeIn 1.4s ease-in-out',
                        }}
                    >
                        {`${t('underConstruction.lastUpdated')}: ${currentDate}`}  {/* Статическое время с переводом */}
                    </Typography>

                    <Typography
                        level="h3"
                        sx={{
                            color: 'text.secondary',
                            animation: 'fadeIn 1.6s ease-in-out',
                            marginBottom: '40px',
                            fontSize: { xs: '0.9rem', md: '1.2rem' },
                        }}
                    >
                        {t('underConstruction.description')}
                    </Typography>

                    {/* Кнопка Домой */}
                    <Button
                        variant="solid"
                        color="primary"
                        size="lg"
                        onClick={handleGoHome}
                        sx={{
                            marginTop: '20px',
                            paddingX: '32px',
                            paddingY: '12px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            borderRadius: '50px',
                            transition: 'all 0.3s ease-in-out',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                transform: 'translateY(-3px)',
                            },
                        }}
                    >
                        {t('underConstruction.button')}
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

export default UnderConstruction;
