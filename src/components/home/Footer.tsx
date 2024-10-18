import React, { useState } from 'react';
import { Box, Typography, Link, Stack, Divider } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import AboutModal from './AboutModal'; // Импортируем компонент AboutModal

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false); // Состояние для открытия и закрытия модального окна

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Box
                component="footer"
                sx={{
                    padding: '2rem',
                    marginTop: 'auto',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }} // Колонка на маленьких экранах, строка на больших
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        width: '100%',
                        margin: '0 auto',
                        padding: { xs: '0 0.5rem', sm: '0 1rem' }, // Уменьшаем отступы на мобильных
                    }}
                >
                    {/* Левая часть - Логотип и информация */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ marginBottom: { xs: '1rem', sm: 0 } }} // Отступ снизу для мобильных
                    >
                        <img src="/img/solana.svg" alt="SolaCoin" width="40" height="40" />
                        <Box>
                            <Typography fontWeight="bold" fontSize="lg" color="primary">
                                {t('footer.companyName')}
                            </Typography>
                            <Typography fontSize="sm" sx={{ color: 'text.secondary' }}>
                                {t('footer.companySlogan')}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Центр - Ссылки */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }} // Вертикальное расположение на мобильных
                        spacing={{ xs: 2, sm: 4 }}
                        alignItems="center"
                        sx={{
                            marginBottom: { xs: '1rem', sm: 0 },
                        }}
                    >
                        <Link
                            href="#"
                            underline="none"
                            sx={{ color: 'text.primary', fontWeight: 'bold', textAlign: 'center' }}
                            onClick={handleOpen} // Открытие модального окна при клике
                        >
                            {t('footer.about')}
                        </Link>
                        <Link href="/terms" underline="none" sx={{ color: 'text.primary', fontWeight: 'bold', textAlign: 'center' }}>
                            {t('footer.terms')}
                        </Link>
                        <Link href="/privacy" underline="none" sx={{ color: 'text.primary', fontWeight: 'bold', textAlign: 'center' }}>
                            {t('footer.privacy')}
                        </Link>
                        <Link href="mailto:contact@solacoin.org" underline="none" sx={{ color: 'text.primary', fontWeight: 'bold', textAlign: 'center' }}>
                            {t('footer.support')}
                        </Link>
                    </Stack>

                    {/* Правая часть - Социальные сети */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Link href="https://github.com/solacoin" target="_blank" rel="noopener">
                            <img src="/img/github.svg" alt="GitHub" width="30" height="30" />
                        </Link>
                    </Stack>
                </Stack>

                <Divider sx={{ marginY: '1.5rem', backgroundColor: 'divider' }} />

                <Typography
                    textAlign="center"
                    sx={{ fontSize: '0.875rem', color: 'text.secondary' }}
                >
                    © {new Date().getFullYear()} {t('footer.companyName')}. {t('footer.rightsReserved')}.
                </Typography>
            </Box>

            {/* Вызов компонента AboutModal */}
            <AboutModal open={open} onClose={handleClose} />
        </>
    );
};

export default Footer;
