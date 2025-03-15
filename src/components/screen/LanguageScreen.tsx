import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Sheet, ListItemButton } from '@mui/joy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from "react-i18next";

type LanguageCode = 'en' | 'ru' | 'ch';

interface LanguageNames {
    native: Record<LanguageCode, string>;
    english: Record<LanguageCode, string>;
}

export default function LanguageScreen({ onBack }: { onBack: () => void }) {
    const { t, i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState<LanguageCode>(i18n.language as LanguageCode);
    const languages: LanguageCode[] = ['en', 'ru', 'ch'];

    const languageNames: LanguageNames = {
        native: {
            en: 'English',
            ru: 'Русский',
            ch: '中文'
        },
        english: {
            en: 'English',
            ru: 'Russian',
            ch: 'Chinese'
        },
    };

    useEffect(() => {
        const handleLanguageChanged = (lng: LanguageCode) => {
            setCurrentLang(lng);
        };

        i18n.on('languageChanged', handleLanguageChanged);
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    const changeLanguage = (lng: LanguageCode) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Sheet sx={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #00162d 0%, #000d1a 100%)',
            position: 'relative',
            overflow: 'auto',
            '&::-webkit-scrollbar': { display: 'none' }
        }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid rgba(0,168,255,0.3)',
                background: 'rgba(0,22,45,0.9)',
                backdropFilter: 'blur(12px)',
            }}>
                <IconButton onClick={onBack} sx={{ color: '#00a8ff', mr: 2 }}>
                    <ArrowBackIcon sx={{ fontSize: 24 }} />
                </IconButton>
                <Typography level="h4" sx={{
                    color: '#a0d4ff',
                    flexGrow: 1,
                    textShadow: '0 2px 4px rgba(0,168,255,0.3)'
                }}>
                    {t('language')}
                </Typography>
            </Box>

            {/* Language List Card */}
            <Box sx={{ p: 3, flex: 1 }}>
                <Sheet
                    sx={{
                        borderRadius: '16px',
                        background: 'rgba(0,22,45,0.6)',
                        border: '1px solid rgba(0,168,255,0.3)',
                        boxShadow: '0 4px 24px rgba(0,168,255,0.1)',
                        p: 2
                    }}
                >
                    {languages.map((lng) => (
                        <ListItemButton
                            key={lng}
                            onClick={() => changeLanguage(lng)}
                            sx={{
                                p: 2,
                                borderRadius: '8px',
                                gap: 2,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transformOrigin: 'left center',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: 'translateX(8px)',
                                    boxShadow: '0 4px 16px rgba(0,168,255,0.2)',
                                    '&::before': {
                                        opacity: 0.1
                                    }
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',

                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                },
                                '&:not(:last-child)': {
                                    borderBottom: '1px solid rgba(0,168,255,0.1)'
                                }
                            }}
                        >
                            {/* Selection Indicator */}
                            <Box
                                sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: '2px solid #00a8ff',
                                    bgcolor: currentLang === lng ? '#00a8ff' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    transform: currentLang === lng ? 'scale(1)' : 'scale(0.8)',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            />

                            {/* Language Names */}
                            <Box sx={{
                                flexGrow: 1,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'translateX(4px)'
                                }
                            }}>
                                <Typography
                                    level="body-lg"
                                    sx={{
                                        color: '#a0d4ff',
                                        lineHeight: 1.2,
                                        transition: 'color 0.2s ease'
                                    }}
                                >
                                    {languageNames.native[lng]}
                                </Typography>
                                <Typography
                                    level="body-sm"
                                    sx={{
                                        color: 'rgba(160,212,255,0.7)',
                                        mt: 0.5,
                                        transition: 'color 0.2s ease'
                                    }}
                                >
                                    {languageNames.english[lng]}
                                </Typography>
                            </Box>
                        </ListItemButton>
                    ))}
                </Sheet>
            </Box>
        </Sheet>
    );
}
