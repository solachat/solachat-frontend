import { Typography } from '@mui/joy';
import React from 'react';

export const SectionText = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{
        position: 'relative',
        pl: 2,
        borderLeft: '2px solid #00a8ff55',
        maxWidth: 800,
        mb: 2,
        color: 'rgba(255,255,255,0.9)',
        fontSize: '1.1rem',
        lineHeight: 1.7,
        mx: 'auto'
    }}>
        {children}
    </Typography>
);
