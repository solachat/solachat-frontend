import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Card from '@mui/joy/Card';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import StarIcon from '@mui/icons-material/Star';
import Alert from '@mui/joy/Alert';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import GlobalStyles from '@mui/joy/GlobalStyles';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {Helmet} from "react-helmet-async";
import {CardActions, CardOverflow, Checkbox, Sheet} from "@mui/joy";
import Verified from '../components/core/Verified';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

import { ColorSchemeToggle } from '../components/core/ColorSchemeToggle';
import LanguageSwitcher from '../components/core/LanguageSwitcher';
import AvatarUploadModal from '../components/profile/AvatarUploadModal';
import ReportModal from "../components/profile/ReportModal";
import WalletIcon from '@mui/icons-material/Wallet';
import SecurityModal from "../components/profile/SecurityModal";
import ConnectButtons from "../components/profile/ConnectButtons";
import CircularProgress from '@mui/material/CircularProgress';
import { useWebSocket } from '../api/useWebSocket';
import {cacheAvatar, cacheProfile, getCachedAvatar, getCachedProfile} from "../utils/cacheStorage";
import {cacheMedia, getCachedMedia} from "../utils/cacheMedia";
import { motion } from 'framer-motion';

export default function AccountPage() {
    const {t} = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const username = queryParams.get('username') || null;
    const publicKey = queryParams.get('publicKey') || null;

    const [isOwner, setIsOwner] = React.useState(false);
    const [shareEmail, setShareEmail] = React.useState(false);
    const [sharePublicKey, setPublicKey] = React.useState(false);
    const [accountExists, setAccountExists] = React.useState(true);
    const [loading, setLoading] = React.useState(true);
    const [balance, setBalance] = React.useState(0);
    const [totpSecret, setTotpSecret] = React.useState<string | null>(null);
    const [tokenBalance, setTokenBalance] = React.useState(0);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const [isEditable, setIsEditable] = React.useState(false);
    const [showAlert, setShowAlert] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const [showModal, setShowModal] = React.useState(false);
    const [showAvatarModal, setShowAvatarModal] = React.useState(false);
    const [reportLoading, setReportLoading] = React.useState(false);
    const [showReportModal, setShowReportModal] = React.useState(false);
    const [usernameError, setUsernameError] = React.useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);

    const [profileData, setProfileData] = React.useState({
        username: '',
        email: '',
        aboutMe: '',
        country: '',
        public_key: '',
        rating: 0,
        lastOnline: '',
        avatar: '',
        online: false,
        verified: false,
        totpSecret: '',
    });

    const handleOpenSecurityModal = () => setShowSecurityModal(true);
    const handleCloseSecurityModal = () => setShowSecurityModal(false);
    const {identifier} = useParams<{ identifier: string }>();
    const [error, setError] = useState<string | null>(null);
    const [showTotpAlert, setShowTotpAlert] = useState<boolean>(totpSecret === null);


    const isPublicKey = (id: string) => {
        if (id.startsWith('0x') && id.length === 42) return true;
        const base58Pattern = /^[A-HJ-NP-Za-km-z1-9]+$/;
        if (base58Pattern.test(id) && (id.length >= 32 && id.length <= 44)) return true;

        return false;
    };

    useEffect(() => {
        if (showTotpAlert) {
            const timer = setTimeout(() => setShowTotpAlert(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [showTotpAlert]);


    const profileFetched = useRef(false);

    useEffect(() => {
        if (!identifier || profileFetched.current) return;

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("⚠️ Токен отсутствует!");

                const queryParam = isPublicKey(identifier)
                    ? `public_key=${identifier}`
                    : `username=${identifier}`;

                console.log(`🌍 Запрос профиля: ${API_URL}/api/users/profile?${queryParam}`);

                // Загружаем профиль из кэша
                const cachedProfile = await getCachedProfile(identifier);
                if (cachedProfile) {
                    console.log("✅ Профиль загружен из кэша:", cachedProfile);
                    setProfileData(cachedProfile);
                    setError(null);
                    profileFetched.current = true; // Предотвращаем повторные запросы

                    if (cachedProfile.avatar) {
                        const cachedAvatarUrl = await getCachedMedia(cachedProfile.avatar);
                        if (cachedAvatarUrl) {
                            setAvatar(`${cachedAvatarUrl}?t=${Date.now()}`);
                        }
                    }
                }

                // Загружаем профиль с сервера
                const response = await axios.get(`${API_URL}/api/users/profile?${queryParam}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                const data = response.data;
                console.log("📌 Профиль загружен с сервера:", data);
                setProfileData(data);
                profileFetched.current = true; // Фиксируем, что запрос уже был

                // Загружаем аватарку и кэшируем
                if (data.avatar) {
                    const cachedAvatarUrl = await getCachedMedia(data.avatar);
                    if (cachedAvatarUrl) {
                        setAvatar(`${cachedAvatarUrl}?t=${Date.now()}`);
                    } else {
                        try {
                            const response = await fetch(data.avatar);
                            const avatarBlob = await response.blob();
                            await cacheMedia(data.avatar, avatarBlob);
                            const avatarUrl = URL.createObjectURL(avatarBlob);
                            setAvatar(`${avatarUrl}?t=${Date.now()}`);
                            return () => URL.revokeObjectURL(avatarUrl);
                        } catch (error) {
                            console.error("❌ Ошибка загрузки аватарки:", error);
                        }
                    }
                }

                await cacheProfile(identifier, data);

                // Определяем владельца профиля
                const decodedToken = token ? jwtDecode<{ publicKey: string }>(token) : null;
                const currentPublicKey = decodedToken?.publicKey || null;
                setIsOwner(currentPublicKey === data.public_key);
            } catch (error) {
                console.error("❌ Ошибка загрузки профиля:", error);
                const cachedProfile = await getCachedProfile(identifier);
                if (cachedProfile) {
                    setProfileData(cachedProfile);
                    setError("Сервер недоступен, загружены данные из кэша.");
                    if (cachedProfile.avatar) {
                        const cachedAvatarUrl = await getCachedMedia(cachedProfile.avatar);
                        if (cachedAvatarUrl) {
                            setAvatar(`${cachedAvatarUrl}?t=${Date.now()}`);
                        }
                    }
                } else {
                    setError("Сервер недоступен, данных нет.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [identifier]); // ❌ Убрали


    const {connectWebSocket} = useWebSocket((message) => {
        if (message.type === 'USER_CONNECTED' && message.publicKey === profileData.public_key) {
            setProfileData(prevData => ({
                ...prevData,
                online: true
            }));
        } else if (message.type === 'USER_DISCONNECTED' && message.publicKey === profileData.public_key) {
            setProfileData(prevData => ({
                ...prevData,
                online: false
            }));
        }
    }, [profileData.public_key]);

    useEffect(() => {
    }, [profileData]);

    useEffect(() => {

        if (profileData.online && !wsConnection.current) {
            connectWebSocket();
            wsConnection.current = true;
        } else if (!profileData.online && wsConnection.current) {
            wsConnection.current = false;
        } else {
            console.log("WebSocket already connected or user is offline.");
        }
    }, [profileData.online, connectWebSocket]);

    const wsConnection = useRef(false);

    const handleSave = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error("No token found");
            return;
        }

        try {
            const publicKey = profileData.public_key;

            if (!publicKey) {
                console.error("Public key is undefined");
                return;
            }

            const response = await axios.put(
                `${API_URL}/api/users/profile/${publicKey}`,
                {
                    newUsername: profileData.username,
                    aboutMe: profileData.aboutMe,
                    verified: profileData.verified,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updatedProfile = response.data.user;
            const newToken = response.data.token;

            localStorage.setItem('token', newToken);

            if (updatedProfile.public_key !== publicKey) {
                navigate(`/account?public_key=${updatedProfile.public_key}`);
            }

            setIsEditable(false);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
        } catch (error) {
            console.error('Error updating profile:', error);

            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 409) {
                    setUsernameError(t('Username is already in use'));
                    setOpenSnackbar(true);
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditable(false);
        setUsernameError(null);
        setProfileData((prevData) => ({
            ...prevData,
            username: username ?? '',
            aboutMe: ''
        }));
    };

    const handleAvatarUploadSuccess = (avatarUrl: string) => {
        setProfileData((prevData) => ({...prevData, avatar: avatarUrl}));
    };

    const handleCopyPublicKey = () => {
        navigator.clipboard.writeText(profileData.public_key);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 3000);
    };

    const handleReportSubmit = async () => {
        setReportLoading(true);
        setTimeout(() => {
            setReportLoading(false);
            setShowModal(false);
            alert(`You have successfully submitted a complaint to ${username}!`);
        }, 2000);
    };

    const defaultAvatarUrl = `https://via.placeholder.com/150?text=${username}`;
    console.log(profileData)

    if (!accountExists) {
        return (
            <CssVarsProvider defaultMode="dark">
                <CssBaseline/>
                <Box sx={{flex: 1, width: '100%'}}>
                    <Box sx={{px: {xs: 2, md: 6}, textAlign: 'center'}}>
                        <Breadcrumbs
                            size="sm"
                            aria-label="breadcrumbs"
                            separator={<ChevronRightRoundedIcon/>}
                            sx={{pl: 0, justifyContent: 'center'}}
                        >
                            <Link underline="none" color="neutral" href="/" aria-label="Home">
                                <HomeRoundedIcon/>
                            </Link>
                            <Typography
                            >
                                {t('myProfile')} {identifier}
                            </Typography>
                        </Breadcrumbs>
                    </Box>
                    <Typography
                        level="h4"
                        color="danger"
                        sx={{
                            mt: 2,
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}
                    >
                        {t('accountNotFound', {identifier})}
                    </Typography>
                </Box>
                <style>
                    {`
                    @keyframes typing {
                        from { width: 0; }
                        to { width: 11ch; }
                    }

                    @keyframes blink-caret {
                        from, to { border-color: transparent; }
                        50% { border-color: orange; }
                    }
                `}
                </style>
            </CssVarsProvider>
        );
    }


    if (loading) {
        return (
            <CssVarsProvider defaultMode="dark">
                <CssBaseline/>

                <Box sx={{px: {xs: 2, md: 6}, textAlign: 'center'}}>
                    <Breadcrumbs
                        size="sm"
                        aria-label="breadcrumbs"
                        separator={<ChevronRightRoundedIcon/>}
                        sx={{justifyContent: 'center'}}
                    >
                        <Link underline="none" color="neutral" href="/" aria-label="Home">
                            <HomeRoundedIcon/>
                        </Link>
                        <Typography
                        >
                            {t('myProfile')} {profileData?.public_key || '...'}
                        </Typography>
                    </Breadcrumbs>
                </Box>

                {/* Центр экрана с анимацией загрузки */}
                <Box sx={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh',
                }}>
                    <CircularProgress color="primary" size={60}/>
                </Box>
            </CssVarsProvider>
        );
    }


    const ExpandablePublicKey = ({
                                     publicKey,
                                 }: {
        publicKey: string;
    }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        const handleToggle = () => {
            setIsExpanded(!isExpanded);
        };

        return (
            <Box
                sx={{
                    cursor: 'pointer',
                    maxWidth: isExpanded ? '100%' : '250px',
                    overflow: 'hidden',
                    whiteSpace: isExpanded ? 'normal' : 'nowrap',
                    textOverflow: isExpanded ? 'clip' : 'ellipsis',
                    transition: 'max-width 0.3s ease',
                    display: 'inline',
                }}
                onClick={handleToggle}
            >
                {publicKey}
            </Box>
        );
    };

    return (
        <CssVarsProvider defaultMode="dark">
            <Helmet>
                <title>{`${t('profile')} ${profileData.public_key}`}</title>
            </Helmet>
            <CssBaseline/>
            <GlobalStyles
                styles={{
                    ':root': {
                        '--Form-maxWidth': '800px',
                    },
                }}
            />

            <Box sx={{
                flex: 1,
                width: '100%',
                background: 'radial-gradient(circle at center, #0a192f 0%, #081428 100%)',
                minHeight: '100vh'
            }}>
                <Box
                    sx={{
                        top: {sm: -100, md: -110},
                        zIndex: 9995,
                    }}
                >
                    <Box sx={{px: {xs: 2, md: 6}, textAlign: 'center'}}>
                        <Breadcrumbs
                            size="sm"
                            aria-label="breadcrumbs"
                            separator={<ChevronRightRoundedIcon sx={{color: '#00a8ff'}}/>}
                            sx={{justifyContent: 'center'}}
                        >
                            <Link underline="none" color="neutral" href="/" aria-label="Home">
                                <HomeRoundedIcon sx={{color: '#00a8ff'}}/>
                            </Link>
                            <Typography sx={{color: '#a0d4ff'}}>
                                {t('myProfile')} {profileData.public_key}
                            </Typography>
                        </Breadcrumbs>

                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}}>
                            <Typography
                                level="h2"
                                component="h1"
                                sx={{
                                    mt: 1,
                                    mb: 2,
                                    fontSize: {xs: '20px', sm: '24px'},
                                    fontWeight: 'bold',
                                    lineHeight: 1.2,
                                    textAlign: 'center',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap',
                                    background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {t('profile')}{' '}
                                <ExpandablePublicKey
                                    publicKey={profileData.public_key}

                                />
                                {profileData.verified && (
                                    <Verified sx={{fontSize: 20, verticalAlign: 'middle', color: '#00a8ff'}}/>
                                )}
                            </Typography>
                        </motion.div>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: {xs: 2, md: 6},
                            gap: 2,
                        }}
                    >
                        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1}}>
                            <ColorSchemeToggle/>
                        </Box>
                        <LanguageSwitcher/>
                    </Box>
                </Box>

                <Stack spacing={4} sx={{ maxWidth: '800px', mx: 'auto', px: { xs: 2, md: 6 }, py: { xs: 2, md: 3 } }}>
                    <Sheet
                        component={motion.div}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        sx={{
                            borderRadius: 'lg',
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(0, 168, 255, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 168, 255, 0.2)',
                        }}
                    >
                        <Box sx={{mb: 1}}>
                            <Typography level="title-md" sx={{color: '#00a8ff'}}>{t('personalInfo')}</Typography>
                        </Box>
                        <Divider sx={{borderColor: 'rgba(0, 168, 255, 0.3)'}}/>

                        <Stack direction={{xs: 'column', md: 'row'}} spacing={3} sx={{my: 1, width: '100%'}}>
                            <Stack direction="column" spacing={1} sx={{position: 'relative', alignItems: 'center'}}>
                                <AspectRatio
                                    ratio="1"
                                    sx={{
                                        width: '100%',
                                        maxWidth: 120,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        cursor: isOwner ? 'pointer' : 'default',
                                        transition: '0.3s ease',
                                        border: profileData.online ? '3px solid green' : '3px solid transparent',
                                        '&:hover img': {
                                            filter: isOwner ? 'brightness(0.7)' : 'none',
                                        },
                                    }}
                                    onClick={() => isOwner && setShowAvatarModal(true)}
                                >
                                    <img src={profileData.avatar || defaultAvatarUrl} loading="lazy" alt="Avatar" />
                                </AspectRatio>

                                <Box sx={{textAlign: 'center', mt: 2}}>
                                    <Typography sx={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#00a8ff'
                                    }}>
                                        {profileData.rating}
                                        <StarIcon fontSize="large" sx={{color: '#ffd700', ml: 1}}/>
                                    </Typography>
                                    <Typography sx={{color: '#a0d4ff', mt: 0}}>
                                        {t('ratinguser')}
                                    </Typography>
                                    <Typography sx={{
                                        color: '#a0d4ff',
                                        mt: 1,
                                        visibility: profileData.online ? 'hidden' : 'visible'
                                    }}>
                                        {t('lastLogin')}: {new Date(profileData.lastOnline).toLocaleDateString()} {new Date(profileData.lastOnline).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack spacing={2} sx={{flexGrow: 1, width: '100%'}}>
                                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{width: '100%'}}>
                                    <FormControl sx={{flexGrow: 1}}>
                                        <FormLabel sx={{color: '#00a8ff'}}>{t('username')}</FormLabel>
                                        <Input
                                            size="sm"
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                            disabled={!isEditable}
                                            error={Boolean(usernameError)}
                                            sx={{
                                                bgcolor: 'rgba(0, 168, 255, 0.05)',
                                                borderColor: 'rgba(0, 168, 255, 0.3)',
                                                color: '#a0d4ff',
                                                '&:focus-within': {borderColor: '#00a8ff'}
                                            }}
                                        />
                                        {usernameError && (
                                            <Typography color="danger" sx={{mt: 0.5}}>
                                                {usernameError}
                                            </Typography>
                                        )}
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel sx={{color: '#00a8ff'}}>{t('aboutMe')}</FormLabel>
                                        <Input
                                            size="sm"
                                            value={profileData.aboutMe}
                                            onChange={(e) =>
                                                setProfileData({...profileData, aboutMe: e.target.value})}
                                            disabled={!isEditable}
                                            sx={{
                                                bgcolor: 'rgba(0, 168, 255, 0.05)',
                                                borderColor: 'rgba(0, 168, 255, 0.3)',
                                                color: '#a0d4ff',
                                                '&:focus-within': {borderColor: '#00a8ff'}
                                            }}
                                        />
                                    </FormControl>
                                </Stack>
                                <FormControl>
                                    <FormLabel sx={{color: '#00a8ff'}}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            {t('wallet')}
                                        </Box>
                                    </FormLabel>
                                    <Input
                                        size="sm"
                                        value={profileData.public_key}
                                        startDecorator={<WalletIcon sx={{color: '#00a8ff'}}/>}
                                        endDecorator={
                                            profileData.public_key ? (
                                                <motion.div whileHover={{scale: 1.1}}>
                                                    <IconButton
                                                        variant="plain"
                                                        size="sm"
                                                        color="neutral"
                                                        onClick={handleCopyPublicKey}
                                                        sx={{color: '#00a8ff', cursor: 'pointer'}}
                                                    >
                                                        {copied ? <CheckIcon color="success"/> : <ContentCopyIcon/>}
                                                    </IconButton>
                                                </motion.div>
                                            ) : null
                                        }
                                        readOnly
                                        sx={{
                                            pointerEvents: 'auto',
                                            bgcolor: 'rgba(0, 168, 255, 0.05)',
                                            borderColor: 'rgba(0, 168, 255, 0.3)',
                                            color: '#a0d4ff'
                                        }}
                                    />
                                </FormControl>
                            </Stack>
                        </Stack>
                        <Divider sx={{borderColor: 'rgba(0, 168, 255, 0.3)', my: 2}}/>
                        <CardActions sx={{justifyContent: 'flex-end', gap: 1.5}}>
                            {!isOwner && (
                                <Button
                                    variant="outlined"
                                    sx={{
                                        bgcolor: 'rgba(255, 0, 0, 0.1)',
                                        borderColor: 'rgba(255, 0, 0, 0.3)',
                                        color: '#ff4444',
                                        '&:hover': {bgcolor: 'rgba(255, 0, 0, 0.2)'}
                                    }}
                                    onClick={() => setShowReportModal(true)}
                                >
                                    {t('report')}
                                </Button>
                            )}
                            {isOwner && !isEditable && (
                                <Button
                                    variant="outlined"
                                    sx={{
                                        bgcolor: 'rgba(0, 168, 255, 0.1)',
                                        borderColor: 'rgba(0, 168, 255, 0.3)',
                                        color: '#00a8ff',
                                        '&:hover': {bgcolor: 'rgba(0, 168, 255, 0.2)'}
                                    }}
                                    onClick={handleOpenSecurityModal}
                                >
                                    {t('Security')}
                                </Button>
                            )}
                            <SecurityModal username={profileData.public_key} open={showSecurityModal} onClose={handleCloseSecurityModal} />
                            {isOwner && !isEditable && (
                                <Button
                                    variant="outlined"
                                    sx={{
                                        bgcolor: 'rgba(0, 168, 255, 0.1)',
                                        borderColor: 'rgba(0, 168, 255, 0.3)',
                                        color: '#00a8ff',
                                        '&:hover': {bgcolor: 'rgba(0, 168, 255, 0.2)'}
                                    }}
                                    onClick={() => setIsEditable(true)}
                                >
                                    {t('edit')}
                                </Button>
                            )}
                            {isEditable && (
                                <>
                                    <Button
                                        variant="solid"
                                        sx={{
                                            bgcolor: 'rgba(0, 255, 136, 0.2)',
                                            color: '#00ff88',
                                            '&:hover': {bgcolor: 'rgba(0, 255, 136, 0.3)'}
                                        }}
                                        onClick={handleSave}
                                    >
                                        {t('save')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            bgcolor: 'rgba(255, 0, 0, 0.1)',
                                            borderColor: 'rgba(255, 0, 0, 0.3)',
                                            color: '#ff4444',
                                            '&:hover': {bgcolor: 'rgba(255, 0, 0, 0.2)'}
                                        }}
                                        onClick={handleCancelEdit}
                                    >
                                        {t('cancel')}
                                    </Button>
                                </>
                            )}
                        </CardActions>
                    </Sheet>

                    {/* Модальные окна */}
                    <ReportModal
                        open={showReportModal}
                        onClose={() => setShowReportModal(false)}
                        onSubmit={handleReportSubmit}
                        loading={reportLoading}
                        username={username || 'defaultUsername'}
                    />

                    <AvatarUploadModal
                        open={showAvatarModal}
                        onClose={() => setShowAvatarModal(false)}
                        onSuccess={handleAvatarUploadSuccess}
                    />

                    {/* Уведомления */}
                    {showAlert && (
                        <Box
                            sx={{
                                position: 'fixed',
                                bottom: 16,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 9999,
                                opacity: showAlert ? 1 : 0,
                                transition: 'opacity 0.5s ease-in-out',
                            }}
                        >
                            <Alert
                                variant="outlined"
                                sx={{
                                    bgcolor: 'rgba(0, 22, 45, 0.9)',
                                    borderColor: 'rgba(0, 168, 255, 0.3)',
                                    color: '#00a8ff'
                                }}
                                startDecorator={<AccountCircleRoundedIcon sx={{color: '#00a8ff'}}/>}
                                endDecorator={
                                    <IconButton
                                        variant="plain"
                                        size="sm"
                                        sx={{color: '#00a8ff'}}
                                        onClick={() => setShowAlert(false)}
                                    >
                                        <CloseRoundedIcon/>
                                    </IconButton>
                                }
                            >
                                {t('your-account-was-updated')}
                            </Alert>
                        </Box>
                    )}

                    {isOwner && showTotpAlert && (
                        <Box
                            sx={{
                                position: 'fixed',
                                bottom: 10,
                                right: 10,
                                zIndex: 9999,
                                width: 320,
                                minHeight: 140,
                                display: 'flex',
                                flexDirection: 'column',
                                p: 2,
                                borderRadius: 3,
                                boxShadow: 4,

                            }}
                        >
                            <Alert
                                variant="soft"
                                color="warning"
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    p: 2,
                                    pb: 3,
                                    position: 'relative',

                                }}
                                startDecorator={<WarningRoundedIcon sx={{ fontSize: 30, color: 'warning.dark' }} />}
                            >
                                {/* Крестик сверху справа */}
                                <IconButton
                                    variant="plain"
                                    size="sm"
                                    color="neutral"
                                    onClick={() => setShowTotpAlert(false)}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                    }}
                                >
                                    <CloseRoundedIcon sx={{ fontSize: 20 }} />
                                </IconButton>

                                <Typography fontSize={15} fontWeight={600}>
                                    {t('totp_alert_title')}
                                </Typography>
                                <Typography fontSize={13} fontWeight={400}>
                                    {t('totp_alert_description')}
                                </Typography>
                                <Button
                                    variant="solid"
                                    size="sm"
                                    color="primary"
                                    onClick={handleOpenSecurityModal}
                                    sx={{
                                        alignSelf: 'stretch',
                                        mt: 1,
                                        fontSize: 13,
                                        fontWeight: 500,
                                    }}
                                >
                                    {t('totp_alert_button')}
                                </Button>
                            </Alert>
                        </Box>
                    )}
                </Stack>
            </Box>
        </CssVarsProvider>
    );
}
