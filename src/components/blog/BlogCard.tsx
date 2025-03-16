import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Box, Typography, Button, Card, Grid } from '@mui/joy';
import { Link } from 'react-router-dom';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    date: string;
}

interface BlogCardProps {
    post: BlogPost;
    transitionDelay: number;
}

export const cardHover = {
    y: -10,
    transition: { duration: 0.3 }
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const BlogCard: React.FC<BlogCardProps> = ({ post, transitionDelay }) => {
    const { t } = useTranslation();

    return (
        <Grid xs={12} sm={6} lg={4} xl={3}>
            <motion.div
                whileHover={cardHover}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: transitionDelay }}
            >
                <Card
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(145deg, #0a1a32 0%, #081428 100%)',
                        border: '1px solid rgba(0, 168, 255, 0.15)',
                        borderRadius: 'lg',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        maxWidth: 400,
                        mx: 'auto',
                        '&:hover': {
                            borderColor: 'rgba(0, 168, 255, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 110, 255, 0.1)'
                        }
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 'md',
                            mb: 2,
                            aspectRatio: '16/9',
                            flexShrink: 0
                        }}
                    >
                        <img
                            src={post.image}
                            alt={t(`blog.${post.title}`)}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'brightness(0.9)'
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                                background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))'
                            }}
                        >
                            <Typography
                                sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}
                            >
                                {post.date}
                            </Typography>
                        </Box>
                    </Box>

                    <Typography
                        level="h4"
                        sx={{
                            mb: 1.5,
                            background: 'linear-gradient(45deg, #00a8ff, #80d0ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {t(`blog.${post.title}`)}
                    </Typography>

                    <Typography
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            mb: 2,
                            lineHeight: 1.6,
                            fontSize: '0.95rem'
                        }}
                    >
                        {t(`blog.${post.excerpt}`)}
                    </Typography>

                    <Button
                        component={Link}
                        to={`/blog/${post.id}`}
                        variant="outlined"
                        size="sm"
                        sx={{
                            alignSelf: 'flex-start',
                            borderColor: 'rgba(0, 168, 255, 0.3)',
                            color: '#00a8ff',
                            '&:hover': {
                                background: 'rgba(0, 168, 255, 0.1)',
                                borderColor: 'rgba(0, 168, 255, 0.5)'
                            }
                        }}
                    >
                        {t('blog.readMore')}
                    </Button>
                </Card>
            </motion.div>
        </Grid>
    );
};

export default BlogCard;
