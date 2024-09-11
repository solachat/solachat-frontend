import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import ArrowForward from '@mui/icons-material/ArrowForward';
import TwoSidedLayout from './TwoSidedLayout';

export default function HeroLeft01() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleGetStarted = () => {
        navigate('/register');
    };

    const handleSignIn = () => {
        navigate('/login');
    };

    return (
        <TwoSidedLayout>
            <Typography color="primary" fontSize="lg" fontWeight="lg">
                {t('heroLeft01.power')}
            </Typography>
            <Typography
                level="h1"
                fontWeight="xl"
                fontSize="clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)"
            >
                {t('heroLeft01.headline')}
            </Typography>
            <Typography fontSize="lg" textColor="text.secondary" lineHeight="lg">
                {t('heroLeft01.description')}
            </Typography>
            <Button size="lg" endDecorator={<ArrowForward />} onClick={handleGetStarted}>
                {t('heroLeft01.getStarted')}
            </Button>
            <Typography>
                {t('heroLeft01.alreadyMember')} <Link fontWeight="lg" onClick={handleSignIn}>{t('heroLeft01.signIn')}</Link>
            </Typography>
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
