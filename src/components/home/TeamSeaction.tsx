import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Avatar } from '@mui/joy';
import { teamMembers } from '../../utils/team';
import {useTranslation} from "react-i18next";

export default function TeamSection() {
    const { t } = useTranslation();
    return (
        <Box sx={{
            py: 10,
            px: 3,
            background: 'radial-gradient(circle at center, #0a192f 0%, #061021 100%)',
            textAlign: 'center'
        }}>
            <Typography
                level="h2"
                sx={{
                    fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                    mb: 6,
                    background: 'linear-gradient(45deg, #00a8ff 20%, #0055ff 80%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                {t('team.title')}
            </Typography>

            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 4,
                maxWidth: 1200,
                mx: 'auto'
            }}>
                {teamMembers.map((member: any) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box sx={{
                            position: 'relative',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            '&:hover .avatar-img': {
                                filter: 'grayscale(0%)',
                                transform: 'scale(1.05)'
                            },
                            '&:hover .avatar-overlay': {
                                opacity: 1,
                                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,25,47,0.95) 100%)'
                            }
                        }}>
                            <Avatar
                                className="avatar-img"
                                src={member.avatar}
                                sx={{
                                    width: 300,
                                    height: 300,
                                    border: '3px solid #00a8ff',
                                    filter: 'grayscale(100%)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 0 30px rgba(0,168,255,0.2)',
                                    position: 'relative'
                                }}
                            />

                            {/* Overlay с текстом */}
                            <Box
                                className="avatar-overlay"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,25,47,0.8) 100%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    p: 3,
                                    opacity: 0.8,
                                    transition: 'all 0.4s ease',
                                    pointerEvents: 'none'
                                }}
                            >
                                <motion.div initial={{ y: 20 }} whileHover={{ y: 0 }}>
                                    <Typography
                                        level="h3"
                                        sx={{
                                            color: '#fff',
                                            fontSize: '1.8rem',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                            mb: 1
                                        }}
                                    >
                                        {member.name}
                                    </Typography>
                                </motion.div>

                                <motion.div initial={{ opacity: 0.8 }} whileHover={{ opacity: 1 }}>
                                    <Typography
                                        sx={{
                                            color: '#00a8ff',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        {member.position}
                                    </Typography>
                                </motion.div>

                                <motion.div initial={{ scale: 0.9 }} whileHover={{ scale: 1 }}>
                                    <Typography
                                        sx={{
                                            color: 'rgba(255,255,255,0.9)',
                                            mt: 1,
                                            fontSize: '0.9rem',
                                            maxWidth: 250,
                                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        {member.description}
                                    </Typography>
                                </motion.div>
                            </Box>

                            {/* Анимированная обводка */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '-10px',
                                    right: '-10px',
                                    bottom: '-10px',
                                    border: '2px solid rgba(0, 168, 255, 0.3)',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s infinite',
                                    pointerEvents: 'none',
                                    '@keyframes pulse': {
                                        '0%': { opacity: 0.5, transform: 'scale(1)' },
                                        '50%': { opacity: 1, transform: 'scale(1.05)' },
                                        '100%': { opacity: 0.5, transform: 'scale(1)' }
                                    }
                                }}
                            />
                        </Box>
                    </motion.div>
                ))}
            </Box>
        </Box>
    );
}
