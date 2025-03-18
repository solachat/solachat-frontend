import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Box, Typography, Button } from '@mui/joy';
import { useMediaQuery } from "react-responsive";

const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } };
const floatingAnimation = { rotate: [0, 2, -2, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } };
const textVariants = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } };
const imageVariants = { hidden: { opacity: 0, x: 50, scale: 0.8 }, visible: { opacity: 1, x: 0, scale: 1 } };

export default function HeroMain() {
    const { t } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    return (
        <Box sx={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #0a192f 0%, #081428 100%)'
        }}>
            <Box sx={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(0, 168, 255, 0.3)',
                filter: 'blur(120px)',
                top: '10%',
                left: '10%'
            }} />
            <Box sx={{
                position: 'absolute',
                width: { xs: 150, sm: 250 },
                height: { xs: 150, sm: 250 },
                borderRadius: '50%',
                background: 'rgba(0, 110, 255, 0.2)',
                filter: 'blur(120px)',
                bottom: '15%',
                right: '15%'
            }} />

            <Box sx={{
                display: 'flex',
                flexDirection: {xs: 'column-reverse', md: 'row'},
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 1200,
                gap: {xs: 4, md: 6},
                position: 'relative',
                zIndex: 1,
                textAlign: {xs: 'center', md: 'left'}
            }}>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    style={{
                        flex: 1,
                        textAlign: isMobile ? "center" : "left",
                    }}
                >
                    <motion.div variants={textVariants}>
                        <Typography
                            level="h1"
                            sx={{
                                fontSize: {xs: '2rem', sm: '3rem', md: 'clamp(2rem, 8vw, 4rem)'},
                                background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 3,
                            }}
                        >
                            {t('hero.title')}
                        </Typography>
                    </motion.div>

                    <motion.div variants={textVariants} transition={{delay: 0.2}}>
                        <Typography
                            fontSize="xl"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                mb: 3,
                                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                                lineHeight: 1.6
                            }}
                        >
                            {t('hero.subtitle')}
                        </Typography>
                    </motion.div>

                    <motion.div variants={textVariants} transition={{delay: 0.4}}>
                        <Typography sx={{color: 'rgba(255,255,255,0.7)', mb: 4, fontSize: '1.1rem'}}>
                            • {t('hero.features.encryption')}<br/>
                            • {t('hero.features.decentralization')}<br/>
                            • {t('hero.features.walletSupport')}
                        </Typography>
                    </motion.div>

                    <motion.div variants={textVariants} transition={{delay: 0.6}}>
                        <Button
                            size="lg"
                            sx={{
                                background: 'linear-gradient(45deg, #007bff, #00a8ff)',
                                px: 6,
                                fontSize: '1.2rem',
                                mb: 4,
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                }
                            }}
                        >
                            {t('hero.button')}
                        </Button>
                    </motion.div>
                </motion.div>

                <motion.div initial="hidden" animate="visible" variants={imageVariants}
                            style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
                    <motion.div animate={floatingAnimation} style={{maxWidth: 320}}>
                        <img
                            src="/favicon.ico"
                            alt="SolaChat Logo"
                            style={{
                                width: '100%',
                                transform: 'perspective(500px) rotateY(10deg)',
                                transition: 'transform 0.5s ease-in-out',
                            }}
                        />
                    </motion.div>
                </motion.div>
            </Box>
        </Box>
    );
}
