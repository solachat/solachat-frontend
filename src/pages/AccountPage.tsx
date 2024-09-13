import React from 'react';
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
import {Checkbox} from "@mui/joy";

import UserDeals from '../components/profile/UserDeals';
import ConnectButtons from '../components/profile/ConnectButtons';
import { ColorSchemeToggle } from '../components/core/ColorSchemeToggle';
import LanguageSwitcher from '../components/core/LanguageSwitcher';
import AvatarUploadModal from '../components/profile/AvatarUploadModal';
import ReportModal from "../components/profile/ReportModal";

export default function AccountPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const username = queryParams.get('username') || 'defaultUsername';

    const [isOwner, setIsOwner] = React.useState(false);
    const [shareEmail, setShareEmail] = React.useState(false);
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

    const [profileData, setProfileData] = React.useState({
        username: '',
        realname: '',
        email: '',
        aboutMe: '',
        country: '',
        public_key: '',
        rating: 0,
        lastLogin: '',
        avatar: '',
    });

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
                setAccountExists(true);

                const balanceResponse = await axios.get(`${API_URL}/api/wallet/${data.public_key}/balance`);
                setBalance(balanceResponse.data.balance);

                const tokenBalanceResponse = await axios.get(`${API_URL}/api/tokens/${data.public_key}/balance`);
                setTokenBalance(tokenBalanceResponse.data.balance);

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
        }
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
                        <Breadcrumbs size="sm" aria-label="breadcrumbs" separator={<ChevronRightRoundedIcon />} sx={{ pl: 0, justifyContent: 'center' }}>
                            <Link underline="none" color="neutral" href="/" aria-label="Home">
                                <HomeRoundedIcon />
                            </Link>
                            <Typography sx={{ fontWeight: 'bold' }}>{t('loading')}</Typography>
                        </Breadcrumbs>
                    </Box>
                </Box>
            </CssVarsProvider>
        );
    }

    return (
        <CssVarsProvider defaultMode="dark">
            <Helmet>
                <title>{`${t('profile')} ${username}`}</title>
            </Helmet>
            <CssBaseline />
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
                            {t('profile')} {username}
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
                                <AspectRatio ratio="1" sx={{ width: '100%', maxWidth: 120, borderRadius: '50%' }}>
                                    <img src={profileData.avatar || defaultAvatarUrl} loading="lazy" alt="Anonymous avatar" />
                                </AspectRatio>
                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {profileData.rating}
                                        <StarIcon fontSize="large" sx={{ color: 'warning.300', ml: 1 }} />
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', mt: 0 }}>
                                        Rating user
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                                        {t('lastLogin')}: {new Date(profileData.lastLogin).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack spacing={2} sx={{ flexGrow: 1, width: '100%' }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                                    <FormControl sx={{ flexGrow: 1 }}>
                                        <FormLabel>{t('username')}</FormLabel>
                                        <Input size="sm" value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} disabled={!isEditable} />
                                    </FormControl>
                                    <FormControl sx={{ flexGrow: 1 }}>
                                        <FormLabel>{t('realname')}</FormLabel>
                                        <Input size="sm" value={profileData.realname} onChange={(e) => setProfileData({ ...profileData, realname: e.target.value })} disabled={!isEditable} />
                                    </FormControl>
                                </Stack>
                                <FormControl>
                                    <FormLabel>{t('aboutMe')}</FormLabel>
                                    <Input size="sm" value={profileData.aboutMe} onChange={(e) => setProfileData({ ...profileData, aboutMe: e.target.value })} disabled={!isEditable} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {t('email')}
                                        <Box sx={{ ml: 1 }} />
                                        <Checkbox
                                            size="sm"
                                            checked={shareEmail}
                                            onChange={() => setShareEmail(!shareEmail)}
                                            disabled={!isEditable}
                                        /> {t('hideEmail')}
                                    </FormLabel>
                                    <Input
                                        size="sm"
                                        type="email"
                                        startDecorator={<EmailRoundedIcon />}
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        disabled={!isEditable}
                                        sx={{
                                            width: '100%',
                                        }}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>{t('wallet')} ({balance} SOL, {tokenBalance} {t('tokens')})</FormLabel>
                                    <Input
                                        size="sm"
                                        value={profileData.public_key}
                                        endDecorator={
                                            <IconButton
                                                variant="plain"
                                                size="sm"
                                                color="neutral"
                                                onClick={handleCopyPublicKey}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                                            </IconButton>
                                        }
                                        readOnly
                                        sx={{ pointerEvents: 'auto' }}
                                    />
                                </FormControl>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    sx={{
                                        mt: 2,
                                        justifyContent: { xs: 'center', sm: 'flex-end' },
                                        width: '100%',
                                        '& > *': {
                                            flexGrow: 1,
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <Button variant="outlined" color="danger" onClick={() => setShowReportModal(true)}>
                                        {t('report')}
                                    </Button>
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
                                            <Button variant="outlined" color="danger" onClick={() => setIsEditable(false)}>
                                                {t('cancel')}
                                            </Button>
                                            <Button variant="outlined" color="primary" onClick={() => setShowAvatarModal(true)}>
                                                {t('uploadAvatar')}
                                            </Button>
                                        </>
                                    )}
                                </Stack>

                            </Stack>
                        </Stack>
                    </Card>
                    <Card>
                        <UserDeals username={username} currentUser={isOwner ? username : ''} />
                    </Card>
                    <ConnectButtons />

                    {/* Modal for Report */}
                    <ReportModal
                        open={showReportModal}
                        onClose={() => setShowReportModal(false)}
                        onSubmit={handleReportSubmit}
                        loading={reportLoading}
                        username={username}
                    />

                    {/* Modal for Upload Avatar */}
                    <AvatarUploadModal open={showAvatarModal} onClose={() => setShowAvatarModal(false)} />

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
