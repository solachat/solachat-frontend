import React from "react";
import {Typography} from "@mui/joy";


export const AnswerText = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{
        position: 'relative',
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
