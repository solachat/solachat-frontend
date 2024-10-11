import React from 'react';
import { useTranslation } from 'react-i18next';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import IconButton from '@mui/joy/IconButton';
import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/joy/Box';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (language: string) => {
        i18n.changeLanguage(language).then(() => {
        });
        handleMenuClose();
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
                onClick={handleMenuOpen}
                aria-label="change language"
                aria-controls="language-menu"
                aria-haspopup="true"
                size="sm"
                variant="outlined">
                <LanguageIcon />
            </IconButton>
            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {[
                    <MenuItem key="en" onClick={() => handleLanguageChange('en')}>English</MenuItem>,
                    <MenuItem key="ru" onClick={() => handleLanguageChange('ru')}>Русский</MenuItem>,
                    <MenuItem key="ch" onClick={() => handleLanguageChange('ch')}>中国人</MenuItem>
                ]}
            </Menu>
        </Box>
    );
};

export default LanguageSwitcher;
