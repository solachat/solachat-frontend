import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Avatar } from '@mui/joy';
import { useTranslation } from 'react-i18next';

const partners = [
    {
        name: 'Solana',
        logo: '/img/solana.svg',
        url: 'https://solana.com/'
    },
    {
        name: 'Ethereum',
        logo: '/img/ethereum.svg',
        url: 'https://ethereum.org/'
    },
    {
        name: 'ByBit',
        logo: '/img/bybit.svg',
        url: 'https://bybit.com/'
    }
];

export default function PartnersSection() {
    const { t } = useTranslation();

    return (
        <Box sx={{
            py: 10,
            px: 3,
            background: 'radial-gradient(circle at center, #0a192f 0%, #061021 100%)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Typography
                level="h2"
                sx={{
                    fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                    mb: 6,
                    background: 'linear-gradient(45deg, #00a8ff 20%, #0055ff 80%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700
                }}
            >
                {t('partners.title')}
            </Typography>

            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 4,
                maxWidth: 1200,
                mx: 'auto'
            }}>
                {partners.map((partner, index) => (
                    <motion.div
                        key={partner.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <a
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
                        >
                            <Box sx={{
                                width: { xs: 150, sm: 200 },
                                height: { xs: 150, sm: 200 },
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '2px solid rgba(0, 168, 255, 0.3)',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 0 30px rgba(0, 168, 255, 0.4)',
                                    borderColor: '#00a8ff'
                                },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        padding: '10%',
                                        filter: 'brightness(0) invert(1)'
                                    }}
                                />
                            </Box>
                            <Typography
                                sx={{
                                    mt: 2,
                                    color: '#00a8ff',
                                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                    fontWeight: 'bold'
                                }}
                            >
                                {partner.name}
                            </Typography>
                        </a>
                    </motion.div>
                ))}
                <Box sx={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'rgba(0, 168, 255, 0.1)',
                    filter: 'blur(100px)',
                    top: '20%',
                    left: '10%',
                    zIndex: 0
                }} />
                <Box sx={{
                    position: 'absolute',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(0, 110, 255, 0.1)',
                    filter: 'blur(80px)',
                    bottom: '20%',
                    right: '10%',
                    zIndex: 0
                }} />
            </Box>
        </Box>
    );
}
