import { Box, Typography, Link } from '@mui/joy';
import { motion } from 'framer-motion';
import { CustomDivider } from './CustomDivider';
import { GeneralQuestions } from './GeneralQuestions';
import React from "react";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const FAQSection = () => (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography level="h2" sx={{
                color: '#00a8ff',
                fontSize: '1.5rem',
                mb: 4,
                fontWeight: 600,

            }}>
                General
            </Typography>

            <Box>
                <motion.div variants={fadeIn}>
                    <Link href="#what-is" sx={{
                        display: 'block',
                        fontSize: '1.1rem',
                        color: '#00a8ff',
                        mb: 2,
                        '&:hover': { color: '#007bff' }
                    }}>
                        • What is SolaChat?
                    </Link>
                </motion.div>
                <motion.div variants={fadeIn}>
                    <Link href="#who-for" sx={{
                        display: 'block',
                        fontSize: '1.1rem',
                        color: '#00a8ff',
                        '&:hover': { color: '#007bff' }
                    }}>
                        • Who is it for?
                    </Link>
                </motion.div>
            </Box>

            <CustomDivider />

            <GeneralQuestions />
        </Box>
    </motion.div>
);
