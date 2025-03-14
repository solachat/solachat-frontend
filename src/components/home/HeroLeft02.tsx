import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Box, Typography, Card, Avatar } from '@mui/joy';
import ShieldIcon from '@mui/icons-material/Security';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SpeedIcon from '@mui/icons-material/Speed';
import PublicIcon from '@mui/icons-material/Public';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockIcon from '@mui/icons-material/Lock';
import GppGoodIcon from '@mui/icons-material/GppGood';

const reasons = [
    {
        key: "security",
        icon: <ShieldIcon sx={{ color: '#00ff99' }} />,
    },
    {
        key: "anonymity",
        icon: <VisibilityOffIcon sx={{ color: '#ff0077' }} />,
    },
    {
        key: "transactions",
        icon: <SpeedIcon sx={{ color: '#00a8ff' }} />,
    },
    {
        key: "decentralization",
        icon: <PublicIcon sx={{ color: '#ff5500' }} />,
    },
    {
        key: "web3",
        icon: <AutoAwesomeIcon sx={{ color: '#9900ff' }} />,
    },
    {
        key: "wallets",
        icon: <LockIcon sx={{ color: '#ff6600' }} />,
    },
    {
        key: "transparency",
        icon: <GppGoodIcon sx={{ color: '#00ffaa' }} />,
    }
];

export default function ReasonsToUseSolanaChat() {
    const { t } = useTranslation(); // Добавляем перевод

    return (
        <Box
            sx={{
                py: 12,
                px: 3,
                background: 'radial-gradient(circle at center, #131a26 0%, #0a0f1a 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Анимированное заголовок */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <Typography
                    level="h2"
                    sx={{
                        textAlign: 'center',
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        mb: 6,
                        color: '#00a8ff',
                        textTransform: 'uppercase',
                        fontWeight: 700
                    }}
                >
                    {t('reasons.title')}
                </Typography>
            </motion.div>

            {/* Карточки с причинами */}
            <Box
                sx={{
                    display: 'grid',
                    gap: 6,
                    maxWidth: 1200,
                    mx: 'auto',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
                }}
            >
                {reasons.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 4,
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.07)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 8px 20px rgba(0, 168, 255, 0.2)',
                                transition: 'all 0.3s ease-in-out'
                            }}
                        >
                            <Avatar sx={{ background: 'rgba(255,255,255,0.1)', width: 60, height: 60, mb: 3 }}>
                                {item.icon}
                            </Avatar>
                            <Typography level="h4" sx={{ mb: 1, fontSize: '1.4rem', fontWeight: 600 }}>
                                {t(`reasons.${item.key}.title`)}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                                {t(`reasons.${item.key}.description`)}
                            </Typography>
                        </Card>
                    </motion.div>
                ))}
            </Box>
        </Box>
    );
}
