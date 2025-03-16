import React from 'react';
import { Card, Typography, Button, Grid, Box } from '@mui/joy';
import { motion } from 'framer-motion';
import {
    Android,
    Apple,
    Window,
    DesktopMac,
    Language
} from '@mui/icons-material';

interface AppCardProps {
    platform: 'android' | 'ios' | 'windows' | 'macos' | 'webA' | 'webK';
    title: string;
    description: string;
    downloadUrl?: string;
    available?: boolean;
    url?: string;
}


const platformIcons = {
    android: <Android sx={{ fontSize: 40 }} />,
    ios: <Apple sx={{ fontSize: 40 }} />,
    windows: <Window sx={{ fontSize: 40 }} />,
    macos: <DesktopMac sx={{ fontSize: 40 }} />,
    webA: (
        <Box sx={{ position: 'relative' }}>
            <Language sx={{ fontSize: 40 }} />
            <Typography
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -60%)',
                    fontWeight: 'bold',
                    color: '#00a8ff',
                    fontSize: 16
                }}
            >
                A
            </Typography>
        </Box>
    ),
    webK: (
        <Box sx={{ position: 'relative' }}>
            <Language sx={{ fontSize: 40 }} />
            <Typography
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -60%)',
                    fontWeight: 'bold',
                    color: '#00a8ff',
                    fontSize: 16
                }}
            >
                K
            </Typography>
        </Box>
    )
};


export default function AppCard({ platform, title, description, available = true, ...props }: AppCardProps) {
    return (
        <Grid xs={12} sm={6} lg={4} sx={{ mb: { xs: 2, sm: 0 } }}>
            <motion.div whileHover={{ scale: available ? 1.02 : 1 }} style={{ height: '100%', cursor: available ? 'pointer' : 'default' }}>
                <Card sx={{
                    height: '100%',
                    background: 'linear-gradient(145deg, #0a1a32 0%, #081428 100%)',
                    border: '1px solid rgba(0, 168, 255, 0.15)',
                    borderRadius: 'lg',
                    p: 2,
                    transition: 'all 0.3s ease',
                    opacity: available ? 1 : 0.7,
                    '&:hover': {
                        borderColor: available ? 'rgba(0, 168, 255, 0.3)' : 'rgba(255,255,255,0.1)',
                        boxShadow: available ? '0 4px 16px rgba(0, 110, 255, 0.2)' : 'none'
                    }
                }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        {platformIcons[platform]}
                    </Box>

                    <Typography
                        level="h4"
                        sx={{
                            mb: 1.5,
                            textAlign: 'center',
                            background: 'linear-gradient(45deg, #00a8ff, #80d0ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            mb: 2,
                            textAlign: 'center',
                            minHeight: 60
                        }}
                    >
                        {description}
                    </Typography>

                    <Button
                        component={available ? 'a' : 'div'}
                        href={available ? (props.downloadUrl || props.url) : undefined}
                        variant="outlined"
                        size="sm"
                        disabled={!available}
                        sx={{
                            mx: 'auto',
                            borderColor: available
                                ? 'rgba(0, 168, 255, 0.3)'
                                : 'rgba(255,255,255,0.1)',
                            color: available ? '#00a8ff' : 'rgba(255,255,255,0.4)',
                            fontSize: '1rem',
                            px: 2.5,
                            '&:hover': {
                                background: available
                                    ? 'rgba(0, 168, 255, 0.1)'
                                    : 'transparent'
                            }
                        }}
                    >
                        {available
                            ? (props.downloadUrl ? 'Download' : 'Open')
                            : 'Coming Soon'}
                    </Button>
                </Card>
            </motion.div>
        </Grid>
    );
}
