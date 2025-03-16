import React from 'react';
import { Card, Typography, Button, Link } from '@mui/joy';
import Box from "@mui/joy/Box";

export default function SourceCodeSection() {
    return (
        <Card
            sx={{
                background: 'linear-gradient(145deg, #0a1a32 0%, #081428 100%)',
                border: '1px solid rgba(0, 168, 255, 0.15)',
                maxWidth: 800,
                mx: 'auto',
                p: 4
            }}
        >
            <Typography
                level="h4"
                sx={{
                    mb: 2,
                    background: 'linear-gradient(45deg, #00a8ff, #80d0ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                Open Source Code
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                SolaChat is open-source and licensed under MIT. You can audit, contribute,
                or fork our codebase on GitHub.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    component="a"
                    href="https://github.com/solachat"
                    target="_blank"
                    variant="outlined"
                    sx={{
                        borderColor: 'rgba(0, 168, 255, 0.3)',
                        color: '#00a8ff',
                        '&:hover': {
                            background:
                                'rgba(0, 168, 255, 0.1)'
                        }
                    }}
                >
                    GitHub Repository
                </Button>

                <Typography sx={{ color: 'rgba(255,255,255,0.5)', ml: 2 }}>
                    License: MIT • Version: 0.1.0
                </Typography>
            </Box>
        </Card>
    );
}
