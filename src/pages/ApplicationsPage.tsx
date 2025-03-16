import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Grid, Container, Divider, CssVarsProvider } from '@mui/joy';
import { motion } from 'framer-motion';
import AppCard from '../components/apps/AppCard';
import SourceCodeSection from '../components/apps/SourceCodeSection';
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import {Helmet} from "react-helmet-async";
import framesxTheme from "../theme/theme";

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
};

export default function ApplicationsPage() {
    const { t } = useTranslation();

    return (
        <>
            <CssVarsProvider disableTransitionOnChange theme={framesxTheme}>
            <Navbar/>
            <Helmet>
                <title>{t('applications.title')}</title>
            </Helmet>
        <Box sx={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 100%, #0a192f 0%, #081428 100%)',
            py: 8,
            position: 'relative'
        }}>
            <Container maxWidth="xl">
                <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                    <Typography
                        level="h1"
                        sx={{
                            textAlign: 'center',
                            mb: 4,
                            background: 'linear-gradient(45deg, #00a8ff 30%, #80d0ff 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {t('applications.title')}
                    </Typography>

                    <Typography
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            textAlign: 'center',
                            maxWidth: 800,
                            mx: 'auto',
                            mb: 6,
                            fontSize: '1.1rem'
                        }}
                    >
                        {t('applications.subtitle')}
                    </Typography>

                    <SectionDivider title={t('applications.mobile')} />

                    <Grid container spacing={4} sx={{ mb: 8 }}>
                        <AppCard
                            platform="android"
                            title="SolaChat for Android"
                            description={t('applications.androidDesc')}
                            downloadUrl="#"
                            available={false}
                        />
                        <AppCard
                            platform="ios"
                            title="SolaChat for iPhone/iPad"
                            description={t('applications.iosDesc')}
                            downloadUrl="#"
                            available={false}
                        />
                    </Grid>

                    <SectionDivider title={t('applications.desktop')} />
                    <Grid container spacing={4} sx={{ mb: 8 }}>
                        <AppCard
                            platform="windows"
                            title="SolaChat for Windows"
                            description={t('applications.windowsDesc')}
                            downloadUrl="#"
                            available={false}
                        />
                        <AppCard
                            platform="macos"
                            title="SolaChat for macOS"
                            description={t('applications.macosDesc')}
                            downloadUrl="#"
                            available={false}
                        />
                    </Grid>

                    <SectionDivider title={t('applications.web')} />
                    <Grid container spacing={4} sx={{ mb: 8 }}>
                        <AppCard
                            platform="webA"
                            title="SolaChat WebA"
                            description={t('applications.webDesc')}
                            url="/chat"
                        />
                        <AppCard
                            platform="webK"
                            title="SolaChat WebK"
                            description={t('applications.webDesc')}
                            url="/"
                            available={false}
                        />
                    </Grid>

                    <SectionDivider title={t('applications.source')} />
                    <SourceCodeSection />
                </motion.div>
            </Container>
        </Box>
            <Footer/>
            </CssVarsProvider>
        </>
    );
}

const SectionDivider = ({ title }: { title: string }) => (
    <Divider sx={{
        my: 6,
        '&::before, &::after': {
            borderColor: 'rgba(0, 168, 255, 0.3)'
        }
    }}>
        <Typography
            level="h4"
            sx={{
                color: '#00a8ff',
                px: 2,
                background: 'rgba(0, 168, 255, 0.1)',
                borderRadius: 'md'
            }}
        >
            {title}
        </Typography>
    </Divider>
);
