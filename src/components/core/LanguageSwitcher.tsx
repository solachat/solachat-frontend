import React from 'react';
import { useTranslation } from 'react-i18next';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import IconButton from '@mui/joy/IconButton';
import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';

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

export const LanguageSwitcherWithText = () => {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = React.useState(i18n.language);

    const handleLanguageChange = (newLanguage: string) => {
        if (newLanguage && newLanguage !== language) {
            i18n.changeLanguage(newLanguage).then(() => {
                setLanguage(newLanguage);
            });
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            }}
        >
            <TranslateOutlinedIcon />
            <Typography
                level="title-sm"
                sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {t('Language')}
            </Typography>


            <Select
                value={language}
                onChange={(e, newValue) => {
                    if (newValue) {
                        handleLanguageChange(newValue);
                    }
                }}
                sx={{
                    minWidth: 50,
                    height: '25px',
                    fontSize: '12px',
                    padding: '0px 5px',
                    lineHeight: '25px',
                    '.MuiSelect-icon': {
                        fontSize: '16px',
                        marginRight: '2px',
                    },
                }}
            >
                <Option value="en">EN</Option>
                <Option value="ru">RU</Option>
                <Option value="ch">中国人</Option>
            </Select>
        </Box>
    );
};

export default LanguageSwitcher;
