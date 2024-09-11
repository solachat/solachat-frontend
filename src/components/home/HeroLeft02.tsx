import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AvatarGroup from '@mui/joy/AvatarGroup';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import ArrowForward from '@mui/icons-material/ArrowForward';
import TwoSidedLayout from './TwoSidedLayout';

export default function HeroLeft02() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleGetStarted = () => {
        navigate('/register');
    };

    const handleLearnMore = () => {
        navigate('/learn-more');
    };

    return (
        <TwoSidedLayout>
            <Typography color="primary" fontSize="lg" fontWeight="lg">
                {t('heroLeft03.power')}
            </Typography>
            <Typography
                level="h1"
                fontWeight="xl"
                fontSize="clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)"
            >
                {t('heroLeft03.headline')}
            </Typography>
            <Typography fontSize="lg" textColor="text.secondary" lineHeight="lg">
                {t('heroLeft03.description')}
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    my: 2,
                    '& > *': { flex: 'auto' },
                }}
            >
                <Button size="lg" variant="outlined" color="neutral" onClick={handleLearnMore}>
                    {t('heroLeft03.learnMore')}
                </Button>
                <Button size="lg" endDecorator={<ArrowForward />} onClick={handleGetStarted}>
                    {t('heroLeft03.getStarted')}
                </Button>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 2,
                    textAlign: 'left',
                    '& > *': {
                        flexShrink: 0,
                    },
                }}
            >
                <AvatarGroup size="lg">
                    <Avatar />
                    <Avatar />
                    <Avatar />
                </AvatarGroup>
                <Typography textColor="text.secondary">
                    {t('heroLeft03.joinCommunity')}
                </Typography>
            </Box>
            <Typography
                level="body-xs"
                sx={{
                    position: 'absolute',
                    top: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
            >
            </Typography>
        </TwoSidedLayout>
    );
}
