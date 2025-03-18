import { Box, Typography } from '@mui/joy';
import { motion } from 'framer-motion';
import { SectionText } from './SectionText';
import { CustomDivider } from './CustomDivider';
import React from "react";

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
};

export const FAQHeader = () => (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography level="h1" sx={{
                mb: 4,
                background: 'linear-gradient(45deg, #00a8ff, #007bff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2.5rem',
                fontWeight: 700
            }}>
                SolaChat FAQ
            </Typography>
            <SectionText>
                This FAQ provides answers to basic questions about SolaChat.
            </SectionText>
            <CustomDivider />
            <SectionText>
                SolaChat keeps evolving and adding new features, so this document may contain outdated information.
            </SectionText>
            <CustomDivider />
        </Box>
    </motion.div>
);
