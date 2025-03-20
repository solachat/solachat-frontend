import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Sheet,
    Slider,
    ListItemButton,
    Divider
} from '@mui/joy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from "react-i18next";

export default function GeneralSettingsScreen({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation();

    const savedTextSize = sessionStorage.getItem('textSize');
    const savedKeyboardOption = sessionStorage.getItem('keyboardOption');

    const [textSize, setTextSize] = useState<number>(savedTextSize ? parseInt(savedTextSize, 10) : 14);
    const [keyboardOption, setKeyboardOption] = useState<'enter' | 'ctrlEnter'>(savedKeyboardOption as 'enter' | 'ctrlEnter' || 'enter');

    useEffect(() => {
        sessionStorage.setItem('textSize', textSize.toString());
    }, [textSize]);

    useEffect(() => {
        sessionStorage.setItem('keyboardOption', keyboardOption);
    }, [keyboardOption]);

    const keyboardOptions = [
        { key: 'enter', label: t('sendOnEnter'), description: t('newLineShiftEnter') },
        { key: 'ctrlEnter', label: t('sendOnCtrlEnter'), description: t('newLineEnter') }
    ];

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
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid rgba(0,168,255,0.3)',
                background: 'rgba(0,22,45,0.9)',
                backdropFilter: 'blur(12px)',
            }}>
                <IconButton onClick={onBack} sx={{ color: '#00a8ff', mr: 2 }}>
                    <ArrowBackIcon sx={{fontSize: 24, color: '#a0d4ff'}}/>
                </IconButton>
                <Typography level="h4" sx={{
                    color: '#a0d4ff',
                    flexGrow: 1,
                    textShadow: '0 2px 4px rgba(0,168,255,0.3)'
                }}>
                    {t('settings')}
                </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Text Size Card */}
                <Sheet
                    sx={{
                        borderRadius: '16px',
                        background: 'rgba(0,22,45,0.6)',
                        border: '1px solid rgba(0,168,255,0.3)',
                        boxShadow: '0 4px 24px rgba(0,168,255,0.1)',
                        p: 3
                    }}
                >
                    <Typography level="body-lg" sx={{ color: '#a0d4ff', mb: 2 }}>
                        {t('textSize')}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Slider
                            value={textSize}
                            onChange={(e, val) => setTextSize(val as number)}
                            min={12}
                            max={24}
                            step={1}
                            sx={{
                                flexGrow: 1,
                                color: '#00a8ff',
                                '& .MuiSlider-thumb': {
                                    transition: 'transform 0.2s ease',
                                }
                            }}
                        />
                        <Typography sx={{
                            color: '#00a8ff',
                            minWidth: 40,
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>
                            {textSize}px
                        </Typography>
                    </Box>
                </Sheet>

                <Divider sx={{ my: 1 }} />

                {/* Keyboard Settings Card */}
                <Sheet
                    sx={{
                        borderRadius: '16px',
                        background: 'rgba(0,22,45,0.6)',
                        border: '1px solid rgba(0,168,255,0.3)',
                        boxShadow: '0 4px 24px rgba(0,168,255,0.1)',
                        p: 3
                    }}
                >
                    <Typography level="body-lg" sx={{ color: '#a0d4ff', mb: 2 }}>
                        {t('keyboardSettings')}
                    </Typography>

                    {keyboardOptions.map((option) => (
                        <ListItemButton
                            key={option.key}
                            onClick={() => setKeyboardOption(option.key as 'enter' | 'ctrlEnter')}
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
                                    bgcolor: keyboardOption === option.key ? '#00a8ff' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    transform: keyboardOption === option.key ? 'scale(1)' : 'scale(0.8)',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            />

                            {/* Option Names */}
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
                                    {option.label}
                                </Typography>
                                <Typography
                                    level="body-sm"
                                    sx={{
                                        color: 'rgba(160,212,255,0.7)',
                                        mt: 0.5,
                                        transition: 'color 0.2s ease'
                                    }}
                                >
                                    {option.description}
                                </Typography>
                            </Box>
                        </ListItemButton>
                    ))}
                </Sheet>
            </Box>
        </Sheet>
    );
}
