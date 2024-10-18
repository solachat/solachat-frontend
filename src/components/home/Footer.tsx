import React from 'react';
import { Box, Typography, Link, Stack, Divider, Avatar } from '@mui/joy';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Box
            component="footer"
            sx={{
                padding: '2rem 3rem',
                marginTop: 'auto',
                boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
                borderTop: '1px solid',
                borderColor: 'divider',
                position: 'relative',
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ flexWrap: 'wrap', textAlign: { xs: 'center', sm: 'initial' } }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src="/img/solana.svg"
                        alt="SolaCoin"
                        sx={{ width: 40, height: 40 }}
                    />
                    <Box>
                        <Typography fontWeight="bold" fontSize="lg" color="primary">
                            {t('footer.companyName')}
                        </Typography>
                        <Typography fontSize="sm" textColor="text.secondary" sx={{ mt: 0.5 }}>
                            {t('footer.companySlogan')}
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={4} sx={{ textAlign: { xs: 'center' }, marginTop: '1rem' }}>
                    <Link href="/about" underline="none" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                        {t('footer.about')}
                    </Link>
                    <Link href="/terms" underline="none" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                        {t('footer.terms')}
                    </Link>
                    <Link href="/privacy" underline="none" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                        {t('footer.privacy')}
                    </Link>
                    <Link href="/support" underline="none" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                        {t('footer.support')}
                    </Link>
                </Stack>

                {/* Правый блок: Социальные сети */}
                <Stack direction="row" spacing={2}>
                    <Link href="https://github.com/solacoin" target="_blank" rel="noopener">
                        <img src="/img/github.svg" alt="GitHub" width="30" height="30" />
                    </Link>
                </Stack>
            </Stack>

            <Divider sx={{ marginY: '1.5rem', backgroundColor: 'divider' }} />

            <Typography
                level="body-xs"
                textAlign="center"
                textColor="text.secondary"
                sx={{ fontSize: '0.875rem' }}
            >
                © {new Date().getFullYear()} {t('footer.companyName')}. {t('footer.rightsReserved')}.
            </Typography>
        </Box>
    );
};

export default Footer;
