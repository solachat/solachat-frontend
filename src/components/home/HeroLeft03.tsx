import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TwoSidedLayout from './TwoSidedLayout';

export default function HeroLeft03() {
    const { t } = useTranslation();

    return (
        <TwoSidedLayout>
            <Typography
                level="h1"
                fontWeight="xl"
                fontSize="clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)"
            >
                {t('heroLeft07.headline')}
            </Typography>
            <Typography fontSize="lg" textColor="text.secondary" lineHeight="lg">
                {t('heroLeft07.description')}
            </Typography>
            <Card
                variant="outlined"
                color="neutral"
                orientation="horizontal"
                sx={{ gap: 2, my: 1, textAlign: 'left' }}
            >
                <AutoAwesomeIcon color="success" />
                <div>
                    <Typography fontSize="xl" fontWeight="lg" sx={{ mb: 1 }}>
                        {t('heroLeft07.newVersion')}
                    </Typography>
                    <Typography level="body-sm">
                        {t('heroLeft07.notification')}
                    </Typography>
                </div>
            </Card>
            <a href="https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202" style={{ textDecoration: 'none' }}>
                <Button size="lg">{t('heroLeft07.downloadApp')}</Button>
            </a>
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
