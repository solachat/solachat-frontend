import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Box, Typography, Grid, Container } from '@mui/joy';
import BlogCard from '../components/blog/BlogCard';
import { blogPosts } from '../utils/blogPosts';
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer"; // Вынесем моковые данные в отдельный файл

// Анимации
const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function BlogPage() {
    const { t } = useTranslation();

    return (
        <>
        <Navbar/>
        <Box sx={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 100%, #0a192f 0%, #081428 100%)',
            py: 8,
            position: 'relative'
        }}>
            {/* Фоновые элементы */}
            <Box sx={{
                position: 'absolute',
                width: '40vw',
                height: '40vw',
                background: 'radial-gradient(circle, rgba(0, 110, 255, 0.1) 0%, transparent 70%)',
                top: '20%',
                left: '-10%'
            }} />

            <Container maxWidth="xl">
                <Typography
                    level="h1"
                    component={motion.h1}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    sx={{
                        textAlign: 'center',
                        mb: 6,
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        background: 'linear-gradient(45deg, #00a8ff 30%, #80d0ff 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {t('blog.title')}
                </Typography>

                <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
                    {blogPosts.map((post: any, index: any) => (
                        <BlogCard
                            key={post.id}
                            post={post}
                            transitionDelay={index * 0.1}
                        />
                    ))}
                </Grid>
            </Container>
        </Box>
    <Footer/>
            </>
    );
}
