import LanguageIcon from '@mui/icons-material/Language';
import React, { useState, useEffect } from "react";
import { Button, Menu, MenuItem, Typography } from "@mui/joy";
import Box from "@mui/joy/Box";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedLang, setSelectedLang] = useState<string>(localStorage.getItem('language') || 'en'); // Загружаем язык

    const open = Boolean(anchorEl);

    useEffect(() => {
        i18n.changeLanguage(selectedLang); // Устанавливаем язык при загрузке
    }, [selectedLang, i18n]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem('language', code);
        setSelectedLang(code); // Обновляем состояние
        handleClose();
    };

    const languages = [
        { code: 'en', label: 'EN', fullLabel: 'English' },
        { code: 'ru', label: 'RU', fullLabel: 'Русский' },
        { code: 'ch', label: 'CH', fullLabel: '中文' }
    ];

    // Найти текущий выбранный язык
    const currentLang = languages.find(lang => lang.code === selectedLang) || languages[0];

    // Закрытие меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (anchorEl && !anchorEl.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (open) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [open, anchorEl]);

    return (
        <Box>
            <Button
                variant="outlined"
                onClick={handleClick}
                sx={{
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: '1px solid rgba(0,168,255,0.5)',
                    background: 'rgba(0,168,255,0.15)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        background: 'rgba(0,168,255,0.3)',
                        boxShadow: '0 0 12px rgba(0,168,255,0.2)'
                    }
                }}
            >
                <LanguageIcon
                    sx={{ color: '#00a8ff', cursor: 'pointer' }}
                    onClick={handleClose} // Закрываем меню, если кликнули на иконку
                />
                <Typography sx={{ color: '#a0d4ff', fontWeight: 500 }}>
                    {currentLang.label} {/* Отображаем label вместо fullLabel */}
                </Typography>
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                    background: 'rgba(10, 25, 47, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 168, 255, 0.3)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(0, 168, 255, 0.2)',
                    '& .MuiList-root': {
                        py: 0.5
                    }
                }}
            >
                {languages.map(lang => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        sx={{
                            position: 'relative',
                            color: lang.code === selectedLang ? '#00a8ff' : '#a0d4ff',
                            py: 1.5,
                            px: 2.5,
                            minWidth: 140,
                            borderRadius: '6px',
                            transition: 'background 0.3s ease, border-left 0.3s ease',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: lang.code === selectedLang ? '4px' : '0px',

                                borderRadius: '2px',
                                transition: 'width 0.3s ease'
                            }
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Typography>{lang.fullLabel}</Typography>
                            {lang.code === selectedLang && (
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(45deg, #00a8ff, #007bff)',
                                        boxShadow: '0 0 8px rgba(0,168,255,0.5)'
                                    }}
                                />
                            )}
                        </Box>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
