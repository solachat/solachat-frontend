import * as React from 'react';
import axios from 'axios';
import {Helmet} from 'react-helmet-async';
import {CssVarsProvider} from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import GoogleIcon from '../components/core/GoogleIcon';
import {Header} from "../components/core/ColorSchemeToggle";
import TelegramIcon from "../components/core/TelegramIcon";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

interface FormElements extends HTMLFormControlsCollection {
    email: HTMLInputElement;
    password: HTMLInputElement;
    persistent: HTMLInputElement;
}

interface SignInFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Login = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [isConnected, setIsConnected] = React.useState(false);

    const handleLogin = async (event: React.FormEvent<SignInFormElement>) => {
        event.preventDefault();
        const formElements = event.currentTarget.elements;
        const data = {
            email: formElements.email.value,
            password: formElements.password.value,
            persistent: formElements.persistent.checked,
            lastlogin: new Date().toISOString(),
        };


        try {
            const response = await axios.post(`${API_URL}/api/users/login`, {
                email: data.email,
                password: data.password,
                lastlogin: data.lastlogin,
            });


            if (response.data.token && response.data.user) {
                const userData = response.data.user;
                localStorage.setItem('token', response.data.token);

                alert('Login successful');

                navigate('/account?username=' + encodeURIComponent(userData.username));
            } else {
                alert('Invalid email or password');
            }
        } catch (err) {
            console.error('Login failed', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            alert('Login failed: ' + errorMessage);
        }
    };

    const connectPhantom = async () => {
        try {
            const {solana} = window;
            if (solana && solana.isPhantom) {
                const response = await solana.connect();
                const walletAddress = response.publicKey.toString();

                const loginResponse = await axios.post(`${API_URL}/api/users/phantom-login`, {
                    wallet: walletAddress,
                });

                if (loginResponse.data.token) {
                    localStorage.setItem('token', loginResponse.data.token);
                    setIsConnected(true);
                    navigate(`/account?username=${loginResponse.data.user.username}`);
                } else {
                    alert('Failed to login with Phantom');
                }
            } else {
                alert(t('phantomNotFound'));
            }
        } catch (error) {
            console.error('Connection to Phantom failed:', error);
            alert(t('phantomConnectFailed'));
        }
    };


    return (
        <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
            <Helmet>
                <title>{t('title.login')}</title>
            </Helmet>
            <CssBaseline/>
            <GlobalStyles
                styles={{
                    ':root': {
                        '--Form-maxWidth': '800px',
                        '--Transition-duration': '0.4s',
                    },
                }}
            />
            <Box
                sx={(theme) => ({
                    width: {xs: '100%', md: '50vw'},
                    transition: 'width var(--Transition-duration)',
                    transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255 255 255 / 0.2)',
                    [theme.getColorSchemeSelector('dark')]: {
                        backgroundColor: 'rgba(19 19 24 / 0.4)',
                    },
                })}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100dvh',
                        width: '100%',
                        px: 2,
                    }}
                >
                    <Header/>
                    <Box
                        component="main"
                        sx={{
                            my: 'auto',
                            py: 2,
                            pb: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            width: 400,
                            maxWidth: '100%',
                            mx: 'auto',
                            borderRadius: 'sm',
                            '& form': {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            },
                            [`& .MuiFormLabel-asterisk`]: {
                                visibility: 'hidden',
                            },
                        }}
                    >
                        <Stack gap={4} sx={{mt: 2}}>
                            <Stack gap={1}>
                                <Typography component="h1" level="h3">
                                    {t('signIn')}
                                </Typography>
                                <Typography level="body-sm">
                                    {t('newToCompany')}{' '}
                                    <Link component={RouterLink} to="/register" level="title-sm">
                                        {t('signUp')}
                                    </Link>
                                </Typography>
                            </Stack>
                            <form onSubmit={handleLogin}>
                                <FormControl required>
                                    <FormLabel>{t('email')}</FormLabel>
                                    <Input
                                        type="email"
                                        name="email"
                                        startDecorator={<EmailIcon/>}
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                pl: '32px',
                                            },
                                        }}
                                    />
                                </FormControl>
                                <FormControl required>
                                    <FormLabel>{t('password')}</FormLabel>
                                    <Input
                                        type="password"
                                        name="password"
                                        startDecorator={<LockIcon/>}
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                pl: '32px',
                                            },
                                        }}
                                    />
                                </FormControl>
                                <Stack gap={4} sx={{mt: 2}}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Checkbox size="sm" label={t('rememberMe')} name="persistent"/>
                                        <Link component={RouterLink} to="/forgotpassword" level="title-sm">
                                            {t('forgotPassword')}
                                        </Link>
                                    </Box>
                                    <Button type="submit" fullWidth>
                                        {t('signInButton')}
                                    </Button>
                                </Stack>
                            </form>
                        </Stack>
                        <Divider
                            sx={(theme) => ({
                                [theme.getColorSchemeSelector('light')]: {
                                    color: {xs: '#FFF', md: 'text.tertiary'},
                                },
                            })}
                        >
                            {t('or')}
                        </Divider>
                        <Stack gap={4} sx={{mb: 2}}>
                            <Button
                                variant="soft"
                                color="neutral"
                                fullWidth
                                startDecorator={<TelegramIcon/>}
                            >
                                {t('continueWithTelegram')}
                            </Button>
                            <Button
                                variant="soft"
                                color="neutral"
                                fullWidth
                                startDecorator={<GoogleIcon/>}
                            >
                                {t('continueWithGoogle')}
                            </Button>
                        </Stack>
                    </Box>
                    <Box component="footer" sx={{py: 3}}>
                        <Typography level="body-xs" textAlign="center">
                            {t('footerText', {year: new Date().getFullYear()})}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={(theme) => ({
                    height: '100%',
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    left: {xs: 0, md: '50vw'},
                    transition: 'background-image var(--Transition-duration), left var(--Transition-duration) !important',
                    transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
                    backgroundColor: 'background.level1',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundImage:
                        'url(https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&w=1000&dpr=2)',
                    [theme.getColorSchemeSelector('dark')]: {
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)',
                    },
                })}
            />
        </CssVarsProvider>
    );
};

export default Login;
