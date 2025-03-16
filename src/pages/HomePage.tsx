import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import CssBaseline from '@mui/joy/CssBaseline';
import framesxTheme from '../theme/theme';
import { useTranslation } from 'react-i18next';
import { Helmet } from "react-helmet-async";
import HeroLeft01 from '../components/home/HeroLeft01';
import HeroLeft02 from '../components/home/HeroLeft02';
import HeroLeft03 from '../components/home/HeroLeft03';
import Navbar from "../components/home/Navbar";
import {Header} from '../components/core/ColorSchemeToggle';
import Footer from "../components/home/Footer";
import TeamSection from "../components/home/TeamSeaction";
import PartnersSection from "../components/home/PartnersSection";


export default function HomePage() {
    const { t } = useTranslation();
    return (
        <CssVarsProvider disableTransitionOnChange theme={framesxTheme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Navbar/>
            </Box>
            <Box sx={{ overflow: 'hidden' }}>
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
                    <PartnersSection/>
                    <TeamSection/>
                </Box>
            </Box>
            <Footer/>
        </CssVarsProvider>
    );
}
