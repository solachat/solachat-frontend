import React from 'react';
import { Box } from '@mui/joy';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { FAQHeader } from '../components/faq/FAQHeader';
import { FAQSection } from '../components/faq/FAQSection';
import {CssVarsProvider} from "@mui/joy/styles";

export default function FAQPage() {
    return (
        <CssVarsProvider>
        <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at center, #0a192f 0%, #081428 100%)' }}>
            <Navbar />
            <Box sx={{ py: 10, px: { xs: 2, md: 10 }, position: 'relative' }}>
                <FAQHeader />
                <FAQSection />
            </Box>
            <Footer />
        </Box>
        </CssVarsProvider>
    );
}
