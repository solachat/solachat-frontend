import React from 'react';
import { Box, Typography } from '@mui/joy';
import { CustomDivider } from './CustomDivider';
import { FAQItem } from './FAQItem';

export const GeneralQuestions = () => (
    <Box>
        <Typography level="h2" sx={{
            color: '#00a8ff',
            fontSize: '1.5rem',
            mb: 4,
            fontWeight: 600,
            pl: 4
        }}>
            General Questions
        </Typography>
        <FAQItem id="what-is" question="Q: What is SolaChat?" answer={
            <>
                SolaChat is a messaging app with a focus on decentralization and security, it's super-fast, simple and free.
                You can use SolaChat on all your devices <strong>at the same time</strong> — your messages sync seamlessly across
                any number of your phones, tablets or computers.
            </>
        } />
    </Box>
);
