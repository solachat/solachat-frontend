import React from 'react';
import {Box, Button, IconButton} from '@mui/joy';
import {KeyboardArrowLeft, KeyboardArrowRight} from '@mui/icons-material';
import {iconButtonClasses} from '@mui/joy/IconButton';
import {useTranslation} from 'react-i18next';

export const Pagination: React.FC = () => {
    const {t} = useTranslation();

    return (
        <Box
            className="Pagination-laptopUp"
            sx={{
                pt: 2,
                gap: 1,
                [`& .${iconButtonClasses.root}`]: {borderRadius: '50%'},
                display: {
                    xs: 'none',
                    md: 'flex',
                },
            }}
        >
            <Button
                size="sm"
                variant="outlined"
                color="neutral"
                startDecorator={<KeyboardArrowLeft/>}
            >
                {t('Previous')}
            </Button>

            <Box sx={{flex: 1}}/>
            {['1', '2', '3', '…', '8', '9', '10'].map((page) => (
                <IconButton
                    key={page}
                    size="sm"
                    variant={Number(page) ? 'outlined' : 'plain'}
                    color="neutral"
                >
                    {page}
                </IconButton>
            ))}
            <Box sx={{flex: 1}}/>

            <Button
                size="sm"
                variant="outlined"
                color="neutral"
                endDecorator={<KeyboardArrowRight/>}
            >
                {t('Next')}
            </Button>
        </Box>
    );
};
