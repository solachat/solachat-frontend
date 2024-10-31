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
import LockIcon from "@mui/icons-material/Lock";
import Alert from "@mui/joy/Alert";
import PhantomConnectButton from "../components/core/PhantomConnectButton";
import {useState} from "react";

interface PhantomProvider extends Window {
    solana?: {
        isPhantom?: boolean;
        publicKey?: {
            toString(): string;
        };
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
        disconnect: () => Promise<void>;
        signMessage?: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
    };
}

declare let window: PhantomProvider;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Login = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
    const [totpCode, setTotpCode] = useState<string>('');

    const handleLogin = async (walletAddress: string, message: string, signature: number[]) => {
        try {
            const response = await axios.post(`${API_URL}/api/users/login`, {
                walletAddress,
                message,
                signature,
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/account?username=' + encodeURIComponent(response.data.user.username));
            } else {
                setErrorMessage('Ошибка аутентификации');
            }
        } catch (err) {
            console.error('Login failed', err);
            setErrorMessage('Ошибка при входе с помощью Phantom Wallet');
        }
    };

    const handleLoginWithTotp = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/users/login`, { totpCode });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/account?username=' + encodeURIComponent(response.data.user.username));
            } else {
                setErrorMessage('Ошибка аутентификации');
            }
        } catch (err) {
            console.error('Login failed', err);
            setErrorMessage('Ошибка при входе с использованием TOTP кода');
        }
    };


    const handlePhantomConnect = async () => {
        try {
            if (!window.solana?.isPhantom) {
                setErrorMessage('Phantom Wallet не найден. Пожалуйста, установите его.');
                return;
            }

            const { publicKey } = await window.solana.connect();
            const walletAddress = publicKey.toString();
            setWalletAddress(walletAddress);

            const message = `Sign this message to confirm login. Nonce: ${Math.random()}`;
            const encodedMessage = new TextEncoder().encode(message);

            if (!window.solana.signMessage) {
                throw new Error("Phantom Wallet не поддерживает подписание сообщений.");
            }

            const { signature } = await window.solana.signMessage(encodedMessage, 'utf8');

            await handleLogin(walletAddress, message, Array.from(signature));
        } catch (error) {
            console.error('Ошибка подключения к Phantom:', error);
            setErrorMessage('Ошибка при подключении к Phantom Wallet');
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
                            {errorMessage && (
                                <Alert color="danger">
                                    {errorMessage}
                                </Alert>
                            )}
                        </Stack>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleLoginWithTotp(); // При отправке формы вызываем вход через TOTP
                        }}>
                            <FormControl required>
                                <FormLabel>{t('TOTP Code')}</FormLabel>
                                <Input
                                    type="text"
                                    name="totpCode"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value)}
                                    startDecorator={<LockIcon/>}
                                />
                            </FormControl>
                            <Button type="submit" fullWidth>
                                {t('signInButton')}
                            </Button>
                        </form>
                        <Divider
                            sx={(theme) => ({
                                [theme.getColorSchemeSelector('light')]: {
                                    color: {xs: '#FFF', md: 'text.tertiary'},
                                },
                            })}
                        >
                            {t('or')}
                        </Divider>
                        <PhantomConnectButton onConnect={handlePhantomConnect}/>
                        <Stack gap={4} sx={{mb: 2}}>
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
