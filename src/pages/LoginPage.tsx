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
import MetamaskConnectButton from "../components/core/MetamaskConnectButton";

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

declare let window: PhantomProvider & {
    ethereum?: {
        isMetaMask?: boolean;
        request: (options: { method: string; params?: any[] }) => Promise<any>;
    };
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Login = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
    const [totpCode, setTotpCode] = useState<string>('');
    const [signedMessage, setSignedMessage] = useState<{ message: string; signature: string } | null>(null);

    const handleLogin = async (walletAddress: string, message: string, signature: string) => {
        try {
            const response = await axios.post(`${API_URL}/api/users/login`, {
                walletAddress,
                message,
                signature,
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/' + encodeURIComponent(response.data.user.publicKey));
            } else {
                setErrorMessage('Ошибка аутентификации');
            }
        } catch (err) {
            console.error('Login failed', err);
            setErrorMessage('Ошибка при входе');
        }
    };


    const handleLoginWithTotp = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/users/login`, { totpCode });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/' + encodeURIComponent(response.data.user.public_key));
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
                setErrorMessage(t('error.phantomNotFound'));
                return;
            }

            const { publicKey } = await window.solana.connect();
            const walletAddress = publicKey.toString();
            setWalletAddress(walletAddress);

            const message = t('message.confirmLogin', { nonce: Math.random() });
            const encodedMessage = new TextEncoder().encode(message);

            if (!window.solana.signMessage) {
                throw new Error(t("error.phantomNotSupportSignMessage"));
            }

            const { signature } = await window.solana.signMessage(encodedMessage, 'utf8');

            const signatureBase64 = btoa(String.fromCharCode(...Array.from(signature)));

            await handleLogin(walletAddress, message, signatureBase64);
        } catch (error) {
            console.error(t("error.connectingPhantom"), error);
            setErrorMessage(t("error.connectingWallet"));
        }
    };

    const handleMetaMaskConnect = async () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const walletAddress = accounts[0];
                const message = "Sign this message to confirm login. Nonce: " + Math.random();

                // Получаем подпись как hex-строку
                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, walletAddress],
                });

                // Передаем hex-подпись напрямую без конвертации
                await handleLogin(walletAddress, message, signature);
            } catch (error) {
                console.error("Error connecting to MetaMask", error);
                setErrorMessage("Ошибка при подключении MetaMask");
            }
        } else {
            setErrorMessage("MetaMask не найден");
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
                            handleLoginWithTotp();
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
                        <MetamaskConnectButton onConnect={handleMetaMaskConnect} />
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
