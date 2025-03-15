import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Sheet,
    RadioGroup,
    Radio,
    Avatar
} from '@mui/joy';
import { motion } from 'framer-motion';
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";
import {CssVarsProvider} from '@mui/joy/styles';
import {Helmet} from "react-helmet-async";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function FeedbackPage() {
    const { t } = useTranslation();
    const [feedbackType, setFeedbackType] = useState('bug');
    const [files, setFiles] = useState<File[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Обработка отправки формы
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    return (
        <>
            <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
                <Helmet>
                    <title>{t('feedback.title')}</title>
                </Helmet>
            <Navbar/>
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #0a192f 0%, #081428 100%)',

        }}>
            <Sheet
                component={motion.div}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                sx={{
                    width: '100%',
                    maxWidth: 800,
                    p: 4,
                    borderRadius: 'lg',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 168, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 168, 255, 0.2)'
                }}
            >
                <Typography
                    level="h2"
                    sx={{
                        textAlign: 'center',
                        mb: 4,
                        background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                        fontWeight: 700
                    }}
                >
                    {t('feedback.title')}
                </Typography>

                <RadioGroup
                    orientation="horizontal"
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    sx={{
                        gap: 2,
                        justifyContent: 'center',
                        mb: 4
                    }}
                >
                    {[
                        { value: 'bug', icon: <BugReportIcon />, label: t('feedback.bug') },
                        { value: 'feature', icon: <LightbulbIcon />, label: t('feedback.feature') },
                        { value: 'other', icon: <DescriptionIcon />, label: t('feedback.other') }
                    ].map((option) => (
                        <Sheet
                            key={option.value}
                            component="label"
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 'md',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderColor: feedbackType === option.value ? '#00a8ff' : 'transparent',
                                background: feedbackType === option.value
                                    ? 'rgba(0, 168, 255, 0.1)'
                                    : 'transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Radio
                                value={option.value}
                                variant="soft"
                                sx={{ display: 'none' }}
                            />
                            <Avatar
                                variant="soft"
                                color="primary"
                                sx={{
                                    mb: 1,
                                    bgcolor: feedbackType === option.value
                                        ? 'rgba(0, 168, 255, 0.2)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    color: 'white'
                                }}
                            >
                                {option.icon}
                            </Avatar>
                            <Typography
                                sx={{
                                    color: feedbackType === option.value ? '#00a8ff' : 'rgba(255,255,255,0.7)',
                                    fontWeight: 500
                                }}
                            >
                                {option.label}
                            </Typography>
                        </Sheet>
                    ))}
                </RadioGroup>

                <form onSubmit={handleSubmit}>
                    <FormControl sx={{ mb: 3 }}>
                        <FormLabel sx={{ color: '#00a8ff', mb: 1 }}>
                            {t('feedback.userId')} *
                        </FormLabel>
                        <Input
                            required
                            placeholder="0x123...abc"
                            sx={{
                                bgcolor: 'rgba(0, 168, 255, 0.05)',
                                borderColor: 'rgba(0, 168, 255, 0.3)',
                                color: '#a0d4ff',
                                '&:focus-within': {
                                    borderColor: '#00a8ff'
                                }
                            }}
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 3 }}>
                        <FormLabel sx={{ color: '#00a8ff', mb: 1 }}>
                            {t('feedback.subject')} *
                        </FormLabel>
                        <Input
                            required
                            sx={{
                                bgcolor: 'rgba(0, 168, 255, 0.05)',
                                borderColor: 'rgba(0, 168, 255, 0.3)',
                                color: '#a0d4ff',
                                '&:focus-within': {
                                    borderColor: '#00a8ff'
                                }
                            }}
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 3 }}>
                        <FormLabel sx={{ color: '#00a8ff', mb: 1 }}>
                            {t('feedback.description')} *
                        </FormLabel>
                        <Textarea
                            required
                            minRows={4}
                            sx={{
                                bgcolor: 'rgba(0, 168, 255, 0.05)',
                                borderColor: 'rgba(0, 168, 255, 0.3)',
                                color: '#a0d4ff',
                                '&:focus-within': {
                                    borderColor: '#00a8ff'
                                }
                            }}
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 4 }}>
                        <FormLabel sx={{ color: '#00a8ff', mb: 1 }}>
                            {t('feedback.attachments')}
                        </FormLabel>
                        <Button
                            component="label"
                            variant="soft"
                            color="primary"
                            sx={{
                                bgcolor: 'rgba(0, 168, 255, 0.1)',
                                border: '1px dashed rgba(0, 168, 255, 0.3)',
                                '&:hover': {
                                    bgcolor: 'rgba(0, 168, 255, 0.2)'
                                }
                            }}
                        >
                            <input
                                type="file"
                                hidden
                                multiple
                                onChange={handleFileUpload}
                            />
                            {t('feedback.uploadFiles')}
                        </Button>
                        {files.length > 0 && (
                            <Typography sx={{ mt: 1, color: '#a0d4ff', fontSize: '0.9rem' }}>
                                {files.length} {t('feedback.filesSelected')}
                            </Typography>
                        )}
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        endDecorator={<SendIcon />}
                        sx={{
                            bgcolor: 'rgba(0, 168, 255, 0.3)',
                            color: '#00a8ff',
                            py: 1.5,
                            fontSize: '1.1rem',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: 'rgba(0, 168, 255, 0.4)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        {t('feedback.submit')}
                    </Button>
                </form>
            </Sheet>
        </Box>
            </CssVarsProvider>
            <Footer/>
        </>
    );
}
