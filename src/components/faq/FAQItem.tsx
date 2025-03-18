import { Box, Typography, Link } from '@mui/joy';
import React from "react";
import { AnswerText } from './AnswerText';

export const FAQItem = ({ id, question, answer }: { id: string; question: string; answer: React.ReactNode }) => (
    <Box sx={{ pl: 4 }}>
        <Typography level="h3" id={id} sx={{
            color: '#00a8ff',
            fontSize: '1.3rem',
            mb: 3,
            fontWeight: 600
        }}>
            {question}
        </Typography>
        <AnswerText>{answer}</AnswerText>
    </Box>
);
