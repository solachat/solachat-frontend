import * as React from 'react';
import { Box, Button, Typography, Stack, CssVarsProvider } from '@mui/joy';
import CssBaseline from '@mui/joy/CssBaseline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const UnderConstruction: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <CssVarsProvider defaultMode="dark">
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
                }}
            >
                <Stack
                    spacing={3}
                    sx={{
                        maxWidth: 600,
                        width: '100%',
                        padding: '16px',
                    }}
                >
                    <Typography
                        level="h1"
                        sx={{
                            fontSize: { xs: '2rem', md: '4rem' },
                            color: 'primary.main',
                        }}
                    >
                        {t('underConstruction.title')}
                    </Typography>
                    <Typography
                        level="h2"
                        sx={{
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            color: 'text.primary',
                        }}
                    >
                        {t('underConstruction.subtitle')}
                    </Typography>
                    <Typography
                        level="h3"
                        sx={{ color: 'text.secondary' }}
                    >
                        {t('underConstruction.description')}
                    </Typography>
                    <Button variant="solid" color="primary" size="lg" onClick={handleGoHome}>
                        {t('underConstruction.button')}
                    </Button>
                </Stack>
            </Box>
        </CssVarsProvider>
    );
};

export default UnderConstruction;
