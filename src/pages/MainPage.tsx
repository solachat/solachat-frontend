import React from 'react';
import { Box, Button, Typography, Stack, IconButton } from '@mui/joy';
import { motion, Variants } from 'framer-motion';
import PhantomIcon from '../components/core/PhantomIconPurple';

// Настройка анимации частиц
const particleAnimation: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 0.8,
        y: [0, -20, 0],
        transition: {
            delay: 0.1,
            duration: 4,
            repeat: Infinity,
            repeatType: 'loop' as const,
        },
    },
};

// Анимация для боковых элементов
const sideAnimation: Variants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 1, delay: 0.5 },
    },
};

const MainPage = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: 'linear-gradient(120deg, #1f2c38, #212c46, #151826)',
                position: 'relative',
                padding: '2rem',
            }}
        >
            {/* Анимированные боковые элементы */}
            <motion.div
                variants={sideAnimation}
                initial="hidden"
                animate="visible"
                style={{
                    position: 'absolute',
                    left: 0,
                    top: '10%',
                    width: '50px',
                    height: '100px',
                    backgroundColor: '#f39c12',
                    borderRadius: '10px',
                    zIndex: -1,
                }}
            />
            <motion.div
                variants={sideAnimation}
                initial="hidden"
                animate="visible"
                style={{
                    position: 'absolute',
                    right: 0,
                    top: '40%',
                    width: '50px',
                    height: '100px',
                    backgroundColor: '#3498db',
                    borderRadius: '10px',
                    zIndex: -1,
                }}
            />

            {/* Анимированный фон с частицами */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    zIndex: -1,
                }}
            >
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={particleAnimation}
                        initial="hidden"
                        animate="visible"
                        style={{
                            position: 'absolute',
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: '20px',
                            height: '20px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '50%',
                        }}
                    />
                ))}
            </Box>

            {/* Заголовки */}
            <Typography
                level="h1"
                component={motion.h1}
                initial={{ opacity: 0 }} // Убираем y: -100 для устранения отступа
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                sx={{
                    fontSize: '5rem', // Увеличенный размер заголовка
                    color: 'white',
                    textAlign: 'center',
                    mb: 2,
                }}
            >
                SuperFast Token on Solana
            </Typography>

            <Typography
                level="h4"
                component={motion.h4}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                sx={{ fontSize: '1.5rem', color: 'white', textAlign: 'center', mb: 4 }}
            >
                Low fees. Instant transfers. Integrated with Phantom Wallet.
            </Typography>

            {/* Кнопка с анимацией */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <Button variant="solid" color="primary" size="lg">
                    Get Started with Phantom
                </Button>
            </motion.div>

            {/* Блок с анимацией и иконкой Phantom */}
            <Stack
                direction="row"
                spacing={2}
                mt={6}
                sx={{ justifyContent: 'center', alignItems: 'center' }}
            >
                <Typography sx={{ color: 'white' }}>Transaction Speed:</Typography>
                <motion.div
                    animate={{ x: [0, 20, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                >
                    <IconButton size="lg" color="success">
                        <PhantomIcon />
                    </IconButton>
                </motion.div>
            </Stack>

            {/* Текст внизу */}
            <Typography
                sx={{ color: 'white', mt: 4, textAlign: 'center', fontSize: '1.25rem' }}
                component={motion.p}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
            >
                The Solana blockchain is your ideal choice for fast and low-cost cryptocurrency transactions.
            </Typography>

            {/* Дополнительные секции для удлинения страницы */}
            <Box sx={{ mt: 8, textAlign: 'center', width: '100%' }}>
                <Typography
                    component={motion.h2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    sx={{ color: 'white', mb: 4, fontSize: '2.5rem' }}
                >
                    Why Choose Solana?
                </Typography>
                <Typography sx={{ color: 'white', maxWidth: '600px', margin: '0 auto', mb: 8 }}>
                    Solana is designed to be the fastest blockchain in the world. It enables high-speed transactions
                    with incredibly low fees, making it the best choice for modern decentralized applications and tokens.
                </Typography>

                {/* Секция преимуществ с анимациями */}
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="center"
                    spacing={6}
                    sx={{ marginBottom: '4rem' }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            background: '#3498db',
                            padding: '2rem',
                            borderRadius: '10px',
                            color: 'white',
                            width: '300px',
                            textAlign: 'center',
                        }}
                    >
                        <Typography mb={2}>
                            Low Transaction Fees
                        </Typography>
                        <Typography>
                            Enjoy extremely low transaction fees, making it affordable for everyone to use.
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            background: '#f39c12',
                            padding: '2rem',
                            borderRadius: '10px',
                            color: 'white',
                            width: '300px',
                            textAlign: 'center',
                        }}
                    >
                        <Typography mb={2}>
                            Fast Transactions
                        </Typography>
                        <Typography>
                            Experience near-instant transactions with Solana’s powerful network.
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        style={{
                            background: '#e74c3c',
                            padding: '2rem',
                            borderRadius: '10px',
                            color: 'white',
                            width: '300px',
                            textAlign: 'center',
                        }}
                    >
                        <Typography mb={2}>
                            Secure Network
                        </Typography>
                        <Typography>
                            Solana ensures the highest level of security for your transactions and data.
                        </Typography>
                    </motion.div>
                </Stack>
            </Box>
        </Box>
    );
};

export default MainPage;
