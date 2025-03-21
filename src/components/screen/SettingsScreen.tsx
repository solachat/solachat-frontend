import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    IconButton,
    Typography,
    Avatar,
    ListItemButton,
    Sheet,
    Menu,
    MenuItem,
} from '@mui/joy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyIcon from '@mui/icons-material/VpnKey';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import PolicyIcon from '@mui/icons-material/Policy';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from "react-i18next";
import { getCachedAvatar, cacheAvatar } from '../../utils/cacheStorage';
import LanguageScreen from "./LanguageScreen";
import { useNavigate } from 'react-router-dom';
import GeneralSettingsScreen from "./GeneralSettingsScreen";
import EditIcon from "@mui/icons-material/Edit";
import EditProfileScreen from "./EditProfileScreen";
import DevicesIcon from '@mui/icons-material/Devices';
import SessionScreen from './SessionScreen';
import {getCachedSessionsIndexedDB} from "../../utils/sessionIndexedDB";

interface DecodedToken {
    avatar: string;
    publicKey: string;
    username?: string;
    aboutMe?: string;
    id: string;
}

const menuItemStyle = {
    p: 1.0,
    transition: 'all 0.2s ease',
    '&:hover': {
        bgcolor: 'rgba(0,168,255,0.1)',
        transform: 'translateX(4px)',
        boxShadow: '0 4px 12px rgba(0,168,255,0.2)'
    },
    '&:not(:last-child)': {
        borderBottom: '1px solid rgba(0,168,255,0.1)'
    }
};

const contentStyle = {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    gap: 2
};

const textStyle = {
    color: '#a0d4ff',
    fontSize: '0.95rem',
    flexGrow: 1
};

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
    const {t, i18n} = useTranslation();
    const [avatarUrl, setAvatarUrl] = useState('');
    const [profile, setProfile] = useState<Partial<DecodedToken>>({});
    const [menuOpen, setMenuOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const [currentScreen, setCurrentScreen] = useState<
        'settings' | 'language' | 'general_settings' | 'edit_profile' | 'sessions'
    >('settings');
    const [sessionCount, setSessionCount] = useState<number>(0);
    const [sessionList, setSessionList] = useState<any[]>([]);

    useEffect(() => {
        const loadProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const decoded: DecodedToken = jwtDecode(token);
                const cachedAvatar = await getCachedAvatar(decoded.avatar);

                if (cachedAvatar) {
                    setAvatarUrl(URL.createObjectURL(cachedAvatar));
                } else if (decoded.avatar) {
                    const response = await fetch(decoded.avatar);
                    const blob = await response.blob();
                    await cacheAvatar(decoded.avatar, blob);
                    setAvatarUrl(URL.createObjectURL(blob));
                }

                setProfile({
                    publicKey: decoded.publicKey,
                    username: decoded.username,
                    aboutMe: decoded.aboutMe,
                    id: decoded.id
                });

            } catch (error) {
                console.error('Error loading profile:', error);
            }
        };

        loadProfile();
    }, []);

    useEffect(() => {
        async function fetchSessions() {
            try {
                const cachedSessions = await getCachedSessionsIndexedDB();
                setSessionList(cachedSessions || []);
                setSessionCount(cachedSessions ? cachedSessions.length : 0);
            } catch (error) {
                console.warn('Ошибка получения сеансов из IndexedDB', error);
                setSessionList([]);
                setSessionCount(0);
            }
        }
        fetchSessions();
    }, []);


    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const navigate = useNavigate();

    const menuItems = [
        {
            icon: <SettingsIcon sx={{fontSize: 20}}/>,
            text: t('general_settings'),
            onClick: () => setCurrentScreen('general_settings')
        },
        {
            icon: <StorageIcon sx={{fontSize: 20}}/>,
            text: t('data_storage'),
            onClick: () => setCurrentScreen('general_settings')
        },
        {
            icon: <LanguageIcon sx={{ fontSize: 20 }} />,
            text: t('language'),
            rightText: i18n.language === 'en' ? t('english') : t('russian'),
            onClick: () => setCurrentScreen('language')
        },
        {
            icon: <DevicesIcon sx={{ fontSize: 20 }} />,
            text: t('active_sessions'),
            rightText: `${sessionCount}`,
            onClick: () => setCurrentScreen('sessions'),
        },
    ];

    const supportItems = [
        {
            icon: <HelpOutlineIcon sx={{ fontSize: 20 }} />,
            text: t('ask_question'),
            onClick: () => console.log('Ask question clicked'),
        },
        {
            icon: <InfoIcon sx={{ fontSize: 20 }} />,
            text: t('solchat_faq'),
            onClick: () => navigate('/faq'),
        },
        {
            icon: <PolicyIcon sx={{ fontSize: 20 }} />,
            text: t('privacy_policy'),
            onClick: () => console.log('Privacy Policy clicked'),
        },
    ];

    const renderMenuButton = () => (
        <ListItemButton
            component="button"
            ref={anchorRef}
            onClick={() => setMenuOpen(!menuOpen)}
            sx={{

                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                    bgcolor: 'rgba(0,168,255,0.1)',
                    boxShadow: '0 0 8px rgba(0,168,255,0.2)'
                }
            }}
        >
            <MoreVertIcon sx={{color: '#a0d4ff'}}/>
        </ListItemButton>
    );

    return (
        <>
            {currentScreen === 'language' ? (
                <LanguageScreen onBack={() => setCurrentScreen('settings')} />
            ) : currentScreen === 'general_settings' ? (
                <GeneralSettingsScreen onBack={() => setCurrentScreen('settings')} />
            ) : currentScreen === 'edit_profile' ? (
                <EditProfileScreen onBack={() => setCurrentScreen('settings')} />
            ) : currentScreen === 'sessions' ? (
                <SessionScreen sessions={sessionList} onBack={() => setCurrentScreen('settings')} />
                ) : (
                <Sheet
                    sx={{
                        height: '100dvh',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(180deg, #00162d 0%, #000d1a 100%)',
                        position: 'relative',
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                            display: 'none'
                        }
                    }}
                >
                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: '1px solid rgba(0,168,255,0.3)',
                            background: 'rgba(0,22,45,0.9)',
                        }}
                    >
                        <IconButton onClick={onBack} sx={{ color: '#00a8ff', mr: 2 }}>
                            <ArrowBackIcon sx={{ fontSize: 24, color: '#a0d4ff' }} />
                        </IconButton>

                        <Typography
                            level="h4"
                            sx={{
                                color: '#a0d4ff',
                                flexGrow: 1,
                                textShadow: '0 2px 4px rgba(0,168,255,0.3)',
                            }}
                        >
                            {t('settings')}
                        </Typography>

                        {/* Карандаш перед троеточием с отступом */}
                        <IconButton
                            sx={{ mr: 1.5 }}
                            onClick={() => setCurrentScreen('edit_profile')}
                        >
                            <EditIcon sx={{ fontSize: 24, color: '#a0d4ff' }} />
                        </IconButton>

                        {renderMenuButton()}

                        <Menu
                            open={menuOpen}
                            anchorEl={anchorRef.current}
                            onClose={() => setMenuOpen(false)}
                            sx={{
                                '& .MuiPaper-root': {
                                    background: 'rgba(0,22,45,0.98)',
                                    border: '1px solid rgba(0,168,255,0.4)',
                                    boxShadow: '0 8px 32px rgba(0,168,255,0.3)',
                                    minWidth: 180,
                                    p: 1,
                                },
                            }}
                        >
                            <MenuItem
                                onClick={handleLogout}
                                sx={{
                                    color: '#ff5050',
                                    borderRadius: '6px',
                                    p: 1.5,
                                    '&:hover': {
                                        background: 'rgba(255,80,80,0.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ExitToAppIcon sx={{ mr: 1.5, fontSize: 24 }} />
                                <Typography sx={{ fontSize: '1rem' }}>
                                    {t('logout')}
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>


                    {/* Avatar Section */}
                    <Box sx={{
                        flex: '0 0 30%',
                        position: 'relative',
                        borderBottom: '1px solid rgba(0,168,255,0.3)'
                    }}>
                        <Avatar
                            src={avatarUrl}
                            sx={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 0,
                                objectFit: 'cover'
                            }}
                        />
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent 0%, rgba(0,22,45,0.9) 100%)',
                            p: 2,
                        }}>
                            <Typography level="h3" sx={{
                                color: '#00a8ff',
                                fontSize: '1.3rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {profile.username || profile.publicKey}
                            </Typography>
                            {profile.aboutMe && (
                                <Typography sx={{
                                    color: '#a0d4ff',
                                    fontSize: '0.9rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {profile.aboutMe}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Public Key Section */}
                    <Box sx={{p: 3, pt: 4,}}>
                        <Sheet
                            sx={{
                                borderRadius: '12px',
                                background: 'rgba(0,22,45,0.6)',
                                border: '1px solid rgba(0,168,255,0.3)',
                                p: 3
                            }}
                        >
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <KeyIcon sx={{
                                    color: '#00a8ff',
                                    mr: 2,
                                    fontSize: 32,
                                    flexShrink: 0
                                }}/>
                                <Box>
                                    <Typography level="body-sm" sx={{
                                        color: '#a0d4ff',
                                        fontSize: '1rem',
                                        mb: 1
                                    }}>
                                        {t('public_key')}
                                    </Typography>
                                    <Typography sx={{
                                        color: '#8ab4f8',
                                        wordBreak: 'break-all',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.5
                                    }}>
                                        {profile.publicKey}
                                    </Typography>
                                </Box>
                            </Box>
                        </Sheet>
                    </Box>

                    {/* Main Content */}
                    <Box sx={{
                        p: 3,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}>
                        {/* Settings Section */}
                        <Sheet
                            sx={{
                                borderRadius: '16px',
                                background: 'rgba(0,22,45,0.6)',
                                border: '1px solid rgba(0,168,255,0.3)',
                                boxShadow: '0 4px 24px rgba(0,168,255,0.1)',
                                p: 2
                            }}
                        >
                            {menuItems.map((item, index) => (
                                <ListItemButton
                                    key={`menu-${index}`}
                                    onClick={item.onClick}
                                    sx={{
                                        ...menuItemStyle,
                                        p: 2,
                                        '& svg': {fontSize: 24}
                                    }}
                                >
                                    <Box sx={{
                                        ...contentStyle,
                                        justifyContent: 'space-between'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {item.icon}
                                            <Typography sx={{...textStyle, fontSize: '1.1rem'}}>
                                                {item.text}
                                            </Typography>
                                        </Box>
                                        {item.rightText && (
                                            <Typography
                                                sx={{
                                                    color: '#00a8ff',
                                                    fontSize: '0.95rem',
                                                    pr: 1
                                                }}
                                            >
                                                {item.rightText}
                                            </Typography>
                                        )}
                                    </Box>
                                </ListItemButton>
                            ))}
                        </Sheet>

                        {/* Support Section */}
                        <Sheet
                            sx={{
                                borderRadius: '16px',
                                background: 'rgba(0,22,45,0.6)',
                                border: '1px solid rgba(0,168,255,0.3)',
                                boxShadow: '0 4px 24px rgba(0,168,255,0.1)',
                                p: 2
                            }}
                        >
                            {supportItems.map((item, index) => (
                                <ListItemButton
                                    key={`support-${index}`}
                                    onClick={item.onClick}
                                    sx={{
                                        ...menuItemStyle,
                                        p: 2,
                                        '& svg': {fontSize: 24}
                                    }}
                                >
                                    <Box sx={contentStyle}>
                                        {item.icon}
                                        <Typography sx={{...textStyle, fontSize: '1.1rem'}}>
                                            {item.text}
                                        </Typography>
                                    </Box>
                                </ListItemButton>
                            ))}
                        </Sheet>
                    </Box>
                </Sheet>
            )}
        </>
    );
}
