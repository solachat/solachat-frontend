import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Box, Typography, Button, Chip } from '@mui/joy';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import {CssVarsProvider} from "@mui/joy/styles";

interface FeatureItem {
    title: string;
    icon: string;
    description: string;
}


type YearKey = 2024 | 2025 | 2026;

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
};

const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: { y: 0, opacity: 1, transition: { type: 'spring', duration: 1 } }
};

const timelineYears: YearKey[] = [2024, 2025, 2026];

export default function FeaturesPage() {
    const { t } = useTranslation();
    const [selectedYear, setSelectedYear] = useState<YearKey>(2025);

    const featuresData: Record<YearKey, FeatureItem[]> = {
        2024: [
            { title: t('features.launch'), icon: '🚀', description: t('features.launchDesc') },
            { title: t('features.core'), icon: '🔧', description: t('features.coreDesc') }
        ],
        2025: [
            { title: t('features.e2ee'), icon: '🔒', description: t('features.e2eeDesc') },
            { title: t('features.mobile'), icon: '📱', description: t('features.mobileDesc') }
        ],
        2026: [
            { title: t('features.dex'), icon: '💱', description: t('features.dexDesc') },
            { title: t('features.dao'), icon: '🌐', description: t('features.daoDesc') }
        ]
    };
    return (
        <CssVarsProvider>
            <Box sx={{ minHeight: '100vh', background: '#0a192f' }}>
                <Navbar />

                <Box sx={{ py: 8, px: { xs: 2, md: 8 } }}>
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <Typography level="h1" sx={{
                            textAlign: 'center',
                            mb: 6,
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: '#00a8ff'
                        }}>
                            {t('features.title')}
                        </Typography>
                    </motion.div>

                    {/* Таймлайн */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 8 }}>
                        {timelineYears.map(year => (
                            <motion.div key={year} whileHover={{ scale: 1.05 }}>
                                <Chip
                                    onClick={() => setSelectedYear(year)}
                                    variant={selectedYear === year ? 'solid' : 'outlined'}
                                    color="primary"
                                    sx={{
                                        px: 4,
                                        py: 1,
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        borderRadius: '12px',
                                        border: selectedYear === year ? 'none' : '1px solid #00a8ff99',
                                        background: selectedYear === year ? '#00a8ff' : 'transparent',
                                        color: selectedYear === year ? '#fff' : '#00a8ff',
                                        borderColor: selectedYear === year ? 'transparent' : '#00a8ff55'
                                    }}
                                >
                                    {year}
                                </Chip>
                            </motion.div>
                        ))}
                    </Box>

                    {/* Карточки фич */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                        gap: 4,
                        maxWidth: 1000,
                        mx: 'auto'
                    }}>
                        {featuresData[selectedYear].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial="offscreen"
                                whileInView="onscreen"
                                viewport={{ once: true, margin: "-80px" }}
                                variants={cardVariants}
                            >
                                <Box sx={{
                                    background: '#081428',
                                    borderRadius: 16,
                                    p: 4,
                                    border: '1px solid #00a8ff55',
                                    backdropFilter: 'blur(6px)',
                                    minHeight: 250,
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 6px 20px #00a8ff22'
                                    }
                                }}>
                                    <Typography level="h3" sx={{
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        fontSize: '1.5rem'
                                    }}>
                                        <span style={{ fontSize: '2rem' }}>{feature.icon}</span>
                                        {feature.title}
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
                                        {feature.description}
                                    </Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </Box>

                <Footer />
            </Box>
        </CssVarsProvider>
    );
}
