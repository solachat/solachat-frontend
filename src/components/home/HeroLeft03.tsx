import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, AvatarGroup, Avatar } from '@mui/joy';
import {useTranslation} from "react-i18next";

const fadeIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const floatingAvatar = {
    y: [0, -8, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
};

export default function CTASection() {
    const { t } = useTranslation();
    return (
        <Box sx={{
            py: 12,
            position: 'relative',
            textAlign: 'center',
            overflow: 'hidden',
            background: 'radial-gradient(circle at center, #0a192f 0%, #081428 100%)',
            color: 'white'
        }}>
            {/* Светящиеся круги на фоне */}
            <Box sx={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(0, 110, 255, 0.3)',
                filter: 'blur(180px)',
                top: '10%',
                left: '10%'
            }} />
            <Box sx={{
                position: 'absolute',
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: 'rgba(0, 180, 255, 0.3)',
                filter: 'blur(180px)',
                bottom: '15%',
                right: '15%'
            }} />

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                <Box sx={{
                    maxWidth: 800,
                    mx: 'auto',
                    px: 3,
                    position: 'relative',
                    zIndex: 1
                }}>
                    <Typography
                        level="h2"
                        sx={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            mb: 3,
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #00a8ff 20%, #0055ff 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',

                        }}
                    >
                        {t('cta.title')}
                    </Typography>

                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontSize: '1.2rem' }}>
                        {t('cta.description')}
                    </Typography>

                    {/* Кнопка */}
                    <motion.div>
                        <Button
                            size="lg"
                            sx={{
                                px: 6,
                                fontSize: '1.2rem',
                                mb: 4,
                                boxShadow: '0px 4px 30px rgba(0, 168, 255, 0.6)',
                                border: '1px solid rgba(0, 168, 255, 0.3)',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.05)',

                                }
                            }}
                        >
                            {t('cta.download')}
                        </Button>
                    </motion.div>

                    {/* Аватары сообщества */}
                    <AvatarGroup sx={{ justifyContent: 'center', mt: 3 }}>
                        {[...Array(5)].map((_, index) => (
                            <motion.div key={index} animate={floatingAvatar}>
                                <Avatar
                                    src={`/avatars/${index + 1}.jpg`}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        border: '2px solid rgba(0, 168, 255, 0.5)',
                                        boxShadow: '0px 4px 12px rgba(0, 168, 255, 0.3)',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': { transform: 'scale(1.05)' }
                                    }}
                                />
                            </motion.div>
                        ))}
                    </AvatarGroup>
                </Box>
            </motion.div>
        </Box>
    );
}
