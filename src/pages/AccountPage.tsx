import React, {useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
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
import {CardActions, CardOverflow, Checkbox} from "@mui/joy";
import Verified from '../components/core/Verified';

import ConnectButtons from '../components/profile/ConnectButtons';
import { ColorSchemeToggle } from '../components/core/ColorSchemeToggle';
import LanguageSwitcher from '../components/core/LanguageSwitcher';
import AvatarUploadModal from '../components/profile/AvatarUploadModal';
import ReportModal from "../components/profile/ReportModal";
import WalletIcon from '@mui/icons-material/Wallet';
import SecurityModal from "../components/profile/SecurityModal";

export default function AccountPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const username = queryParams.get('username') || 'defaultUsername';

    const [isOwner, setIsOwner] = React.useState(false);
    const [shareEmail, setShareEmail] = React.useState(false);
    const [sharePublicKey, setPublicKey] = React.useState(false);
    const [accountExists, setAccountExists] = React.useState(true);
    const [loading, setLoading] = React.useState(true);
    const [balance, setBalance] = React.useState(0);
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

    const [profileData, setProfileData] = React.useState({
        username: '',
        realname: '',
        email: '',
        aboutMe: '',
        country: '',
        public_key: '',
        rating: 0,
        lastOnline: '',
        avatar: '',
        online: false,
        verified: false
    });

    const handleOpenSecurityModal = () => setShowSecurityModal(true);
    const handleCloseSecurityModal = () => setShowSecurityModal(false);


    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode<{ username: string }>(token);
                const currentUsername = decodedToken?.username;
                setIsOwner(currentUsername === username);
            } catch (error) {
                console.error("Invalid token", error);
            }
        }

        setAccountExists(true);
        setLoading(true);

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get(`${API_URL}/api/users/profile?username=${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;
                setProfileData(data);
                setShareEmail(data.shareEmail);
                setPublicKey(data.sharePublicKey);
                setAccountExists(true);
                setBalance(data.balance);
                setTokenBalance(data.tokenBalance);

                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setAccountExists(false);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, API_URL]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const originalUsername = queryParams.get('username') || profileData.username;

            const response = await axios.put(
                `${API_URL}/api/users/profile/${originalUsername}`,
                {
                    newUsername: profileData.username,
                    realname: profileData.realname,
                    email: profileData.email,
                    aboutMe: profileData.aboutMe,
                    shareEmail: shareEmail,
                    sharePublicKey: sharePublicKey,
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

            if (updatedProfile.username !== originalUsername) {
                navigate(`/account?username=${updatedProfile.username}`);
            }

            setIsEditable(false);
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
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
            username: username
        }));
    };

    const handleAvatarUploadSuccess = (avatarUrl: string) => {
        setProfileData((prevData) => ({ ...prevData, avatar: avatarUrl }));
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

    if (!accountExists) {
        return (
            <CssVarsProvider defaultMode="dark">
                <CssBaseline />
                <Box sx={{ flex: 1, width: '100%', textAlign: 'center', py: 5 }}>
                    <Typography level="h4" color="danger">
                        {t('accountNotFound')}
                    </Typography>
                </Box>
            </CssVarsProvider>
        );
    }


    if (loading) {
        return (
            <CssVarsProvider defaultMode="dark">
                <CssBaseline />
                <Box sx={{ flex: 1, width: '100%' }}>
                    <Box sx={{ px: { xs: 2, md: 6 }, textAlign: 'center' }}>
                        <Breadcrumbs
                            size="sm"
                            aria-label="breadcrumbs"
                            separator={<ChevronRightRoundedIcon />}
                            sx={{ pl: 0, justifyContent: 'center' }}
                        >
                            <Link underline="none" color="neutral" href="/" aria-label="Home">
                                <HomeRoundedIcon />
                            </Link>
                            <Typography
                                sx={{
                                    fontWeight: 'bold',
                                    animation: 'typing 3.5s steps(11, end), blink-caret 0.75s step-end infinite',
                                    borderRight: '.15em solid transparent',
                                    display: 'inline-block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                            >
                                {t('loading')}
                            </Typography>
                        </Breadcrumbs>
                    </Box>
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

    return (
        <CssVarsProvider defaultMode="dark">
            <Helmet>
                <title>{`${t('profile')} ${username}`}</title>
            </Helmet>
            <CssBaseline/>
            <GlobalStyles
                styles={{
                    ':root': {
                        '--Form-maxWidth': '800px',
                    },
                }}
            />
            <Box sx={{ flex: 1, width: '100%' }}>
                <Box sx={{ top: { sm: -100, md: -110 }, bgcolor: 'background.body', zIndex: 9995 }}>
                    <Box sx={{ px: { xs: 2, md: 6 }, textAlign: 'center' }}>
                        <Breadcrumbs size="sm" aria-label="breadcrumbs" separator={<ChevronRightRoundedIcon />} sx={{ justifyContent: 'center' }}>
                            <Link underline="none" color="neutral" href="/" aria-label="Home">
                                <HomeRoundedIcon />
                            </Link>
                            <Typography>{t('myProfile')} {username}</Typography>
                        </Breadcrumbs>
                        <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
                            {t('profile')} {username} {profileData.verified && <Verified sx={{ fontSize: 24, verticalAlign: 'middle' }} />}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 2, md: 6 }, gap: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                            <ColorSchemeToggle />
                        </Box>
                        <LanguageSwitcher />
                    </Box>
                </Box>
                <Stack spacing={4} sx={{ maxWidth: '800px', mx: 'auto', px: { xs: 2, md: 6 }, py: { xs: 2, md: 3 } }}>
                    <Card>
                        <Box sx={{ mb: 1 }}>
                            <Typography level="title-md">{t('personalInfo')}</Typography>
                        </Box>
                        <Divider />
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ my: 1, width: '100%' }}>
                            <Stack direction="column" spacing={1} sx={{ position: 'relative', alignItems: 'center' }}>
                                <AspectRatio
                                    ratio="1"
                                    sx={{
                                        width: '100%',
                                        maxWidth: 120,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        cursor: isOwner ? 'pointer' : 'default',
                                        transition: '0.3s ease',
                                        '&:hover img': {
                                            filter: isOwner ? 'brightness(0.7)' : 'none',
                                        },
                                    }}
                                    onClick={() => isOwner && setShowAvatarModal(true)}
                                >
                                    <img src={profileData.avatar || defaultAvatarUrl} loading="lazy" alt="Avatar" />
                                </AspectRatio>
                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {profileData.rating}
                                        <StarIcon fontSize="large" sx={{ color: 'warning.300', ml: 1 }} />
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', mt: 0 }}>
                                        {t('ratinguser')}
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', mt: 1, visibility: profileData.online ? 'hidden' : 'visible' }}>
                                        {t('lastLogin')}: {new Date(profileData.lastOnline).toLocaleDateString()} {new Date(profileData.lastOnline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack spacing={2} sx={{ flexGrow: 1, width: '100%' }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                                    <FormControl sx={{ flexGrow: 1 }}>
                                        <FormLabel>{t('username')}</FormLabel>
                                        <Input
                                            size="sm"
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                            disabled={!isEditable}
                                            error={Boolean(usernameError)}
                                        />
                                        {usernameError && (
                                            <Typography color="danger" sx={{ mt: 0.5 }}>
                                                {usernameError}
                                            </Typography>
                                        )}
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>{t('aboutMe')}</FormLabel>
                                        <Input size="sm"
                                               value={profileData.aboutMe}
                                               onChange={(e) =>
                                                   setProfileData({ ...profileData, aboutMe: e.target.value })} disabled={!isEditable}
                                        />
                                    </FormControl>
                                </Stack>
                                <FormControl>
                                    <FormLabel>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {t('wallet')}
                                            {isOwner || sharePublicKey ? (
                                                <> ({balance} SOL, {tokenBalance} {t('tokens')})</>
                                            ) : null}
                                            {isOwner && (
                                                <>
                                                    <Checkbox
                                                        size="sm"
                                                        checked={sharePublicKey}
                                                        onChange={() => setPublicKey(!sharePublicKey)}
                                                        disabled={!isEditable}
                                                        sx={{ ml: 1 }}
                                                    />
                                                    {t('Share public key')}
                                                </>
                                            )}
                                        </Box>
                                    </FormLabel>
                                    <Input
                                        size="sm"
                                        value={isOwner || sharePublicKey ? profileData.public_key : '******'}
                                        startDecorator={<WalletIcon />}
                                        endDecorator={
                                            (isOwner || sharePublicKey) && profileData.public_key ? (
                                                <IconButton
                                                    variant="plain"
                                                    size="sm"
                                                    color="neutral"
                                                    onClick={handleCopyPublicKey}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                                                </IconButton>
                                            ) : null
                                        }
                                        readOnly
                                        sx={{ pointerEvents: 'auto' }}
                                    />
                                </FormControl>

                            </Stack>
                        </Stack>
                        <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                            <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
                                {!isOwner && (
                                    <Button variant="outlined" color="danger" onClick={() => setShowReportModal(true)}>
                                        {t('report')}
                                    </Button>
                                )}
                                {isOwner && !isEditable && (
                                    <Button variant="outlined" color="primary" onClick={handleOpenSecurityModal}>
                                        {t('Security')}
                                    </Button>
                                )}
                                <SecurityModal username={profileData.username} open={showSecurityModal} onClose={handleCloseSecurityModal} />
                            {isOwner && !isEditable && (
                                <Button variant="outlined" color="primary" onClick={() => setIsEditable(true)}>
                                    {t('edit')}
                                </Button>
                            )}
                                {isEditable && (
                                    <>
                                        <Button variant="solid" color="success" onClick={handleSave}>
                                            {t('save')}
                                        </Button>
                                        <Button variant="outlined" color="danger" onClick={handleCancelEdit}>
                                            {t('cancel')}
                                        </Button>
                                    </>
                                )}
                            </CardActions>
                        </CardOverflow>
                    </Card>
                    <ConnectButtons />

                    <ReportModal
                        open={showReportModal}
                        onClose={() => setShowReportModal(false)}
                        onSubmit={handleReportSubmit}
                        loading={reportLoading}
                        username={username}
                    />

                    <AvatarUploadModal
                        open={showAvatarModal}
                        onClose={() => setShowAvatarModal(false)}
                        onSuccess={handleAvatarUploadSuccess}
                    />

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
                                color="neutral"
                                startDecorator={<AccountCircleRoundedIcon />}
                                endDecorator={
                                    <IconButton
                                        variant="plain"
                                        size="sm"
                                        color="neutral"
                                        onClick={() => setShowAlert(false)}
                                    >
                                        <CloseRoundedIcon />
                                    </IconButton>
                                }
                            >
                                {t('your-account-was-updated')}
                            </Alert>
                        </Box>
                    )}
                </Stack>
            </Box>
        </CssVarsProvider>
    );
}
