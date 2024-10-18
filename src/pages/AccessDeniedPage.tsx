import React from 'react';
import { Box, Button, Typography, Stack, CssVarsProvider } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import CssBaseline from '@mui/joy/CssBaseline';
import { Helmet } from 'react-helmet-async';

const AccessDeniedPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGoLogin = () => {
        navigate('/login');
    };

    return (
        <CssVarsProvider defaultMode="dark">
            <Helmet>
                <title>Доступ запрещён</title>
            </Helmet>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '16px',
                }}
            >
                {/* Анимация фона */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #76baff, #4778e2)',
                        animation: 'backgroundAnimation 5s ease infinite',
                        zIndex: 0, // Задний план для анимации
                    }}
                />

                <Stack
                    spacing={3}
                    sx={{
                        maxWidth: 600,
                        width: '100%',
                        padding: '16px',
                        position: 'relative',
                        zIndex: 1, // Передний план для текста
                        background: 'rgba(0, 0, 0, 0.7)', // Полупрозрачный фон для текста
                        borderRadius: '16px',
                    }}
                >
                    <Typography
                        level="h1"
                        sx={{
                            fontSize: { xs: '2rem', md: '3rem' },
                            color: 'primary.main',
                            marginBottom: '16px',
                        }}
                    >
                        Доступ запрещён
                    </Typography>
                    <Typography
                        level="h2"
                        sx={{
                            fontSize: { xs: '1.2rem', md: '1.8rem' },
                            color: 'text.primary',
                            marginBottom: '12px',
                        }}
                    >
                        У вас нет доступа к этой странице.
                    </Typography>

                    <Button
                        variant="solid"
                        color="primary"
                        size="lg"
                        onClick={handleGoLogin}
                        sx={{
                            marginTop: '20px',
                            paddingX: '32px',
                            paddingY: '12px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                transform: 'translateY(-3px)',
                            },
                        }}
                    >
                        Войти
                    </Button>
                </Stack>
            </Box>

            {/* CSS для анимации фона */}
            <style>
                {`
                    @keyframes backgroundAnimation {
                        0% { transform: scale(1) rotate(0deg); }
                        50% { transform: scale(1.2) rotate(180deg); }
                        100% { transform: scale(1) rotate(360deg); }
                    }
                `}
            </style>
        </CssVarsProvider>
    );
};

export default AccessDeniedPage;
