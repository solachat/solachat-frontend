import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import CssBaseline from '@mui/joy/CssBaseline';
import framesxTheme from '../theme/theme';
import { Helmet } from "react-helmet-async";
import HeroLeft01 from '../components/home/HeroLeft01';
import HeroLeft02 from '../components/home/HeroLeft02';
import HeroLeft03 from '../components/home/HeroLeft03';
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import TeamSection from "../components/home/TeamSeaction";
import PartnersSection from "../components/home/PartnersSection";

export default function HomePage() {
    return (
        <CssVarsProvider disableTransitionOnChange theme={framesxTheme}>
            <Helmet>
                <title>SolaChat</title>
            </Helmet>
            <CssBaseline />
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <Navbar />
            </Box>
            <Box sx={{ mt: '64px', overflow: 'hidden' }}>
                <Box
                    sx={{
                        height: '100%',
                        overflowY: 'auto',
                        scrollSnapType: 'y mandatory',
                        '& > div': {
                            scrollSnapAlign: 'start',
                        },
                    }}
                >
                    <HeroLeft01 />
                    <HeroLeft02 />
                    <HeroLeft03 />
                    <PartnersSection />
                    <TeamSection />
                </Box>
            </Box>
            <Footer />
        </CssVarsProvider>
    );
}
