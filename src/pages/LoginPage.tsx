import * as React from 'react';
import axios from 'axios';
import {Helmet} from 'react-helmet-async';
import {CssVarsProvider} from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Header} from "../components/core/ColorSchemeToggle";
import LockIcon from "@mui/icons-material/Lock";
import Alert from "@mui/joy/Alert";
import PhantomConnectButton from "../components/core/PhantomConnectButton";
import {useState} from "react";
import MetamaskConnectButton from "../components/core/MetamaskConnectButton";
import {motion} from "framer-motion";

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

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
};


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Login = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
    const [totpCode, setTotpCode] = useState<string>('');

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

                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, walletAddress],
                });

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
            <CssBaseline />
            <GlobalStyles
                styles={{
                    ':root': {
                        '--Form-maxWidth': '800px',
                        '--Transition-duration': '0.4s',
                        '--main-gradient': 'linear-gradient(45deg, #0a192f 0%, #081428 100%)',
                        '--accent-blue': '#00a8ff',
                        '--accent-dark-blue': '#007bff',
                        '--glass-bg': 'rgba(10, 25, 47, 0.8)',
                        '--dark-glass-bg': 'rgba(8, 20, 40, 0.8)',
                    },
                }}
            />

            {/* Светящиеся эффекты фона */}
            <Box sx={{
                position: 'fixed',
                width: '100%',
                height: '100%',
                background: 'var(--main-gradient)',
                '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    borderRadius: '50%',
                    filter: 'blur(120px)',
                },
                '&::before': {
                    width: 300,
                    height: 300,
                    background: 'rgba(0, 168, 255, 0.15)',
                    top: '10%',
                    left: '10%',
                },
                '&::after': {
                    width: 250,
                    height: 250,
                    background: 'rgba(0, 110, 255, 0.1)',
                    bottom: '15%',
                    right: '15%',
                }
            }} />

            <Box
                component={motion.div}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                sx={(theme) => ({
                    width: { xs: '100%', md: '50vw' },
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'var(--glass-bg)',
                    [theme.getColorSchemeSelector('dark')]: {
                        backgroundColor: 'var(--dark-glass-bg)',
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
                    <Header />
                    <Box
                        component="main"
                        sx={{
                            my: 'auto',
                            py: 2,
                            pb: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            width: 400,
                            maxWidth: '100%',
                            mx: 'auto',
                        }}
                    >
                        <Stack gap={2}>
                            <Typography
                                component="h1"
                                level="h2"
                                sx={{
                                    background: 'linear-gradient(45deg, var(--accent-blue), var(--accent-dark-blue))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 700
                                }}
                            >
                                {t('signIn')}
                            </Typography>
                            <Typography
                                level="body-sm"
                                sx={{
                                    color: 'rgba(255,255,255,0.7)',
                                    '& a': {
                                        color: 'var(--accent-blue)',
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }
                                }}
                            >
                                {t('newToCompany')}{' '}
                                <Link component={RouterLink} to="/register">
                                    {t('signUp')}
                                </Link>
                            </Typography>
                        </Stack>

                        {errorMessage && (
                            <Alert
                                color="danger"
                                sx={{
                                    background: 'rgba(255, 76, 81, 0.15)',
                                    border: '1px solid rgba(255, 76, 81, 0.3)'
                                }}
                            >
                                {errorMessage}
                            </Alert>
                        )}

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
                                    placeholder={t('enterTOTPCode')}
                                    startDecorator={<LockIcon />}
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',

                                        transition: 'all 0.3s ease-in-out',
                                        color: 'rgba(255,255,255,0.9)',
                                        '&::placeholder': {
                                            color: 'rgba(255,255,255,0.6)',
                                        },
                                        '&:hover': {
                                            borderColor: 'var(--accent-blue)',
                                        },
                                        '&:focus-within': {
                                            borderColor: 'var(--accent-dark-blue)',
                                            boxShadow: '0 0 10px rgba(0, 168, 255, 0.3)',
                                        },
                                        '& input': {
                                            fontSize: '1rem',
                                            padding: '8px',
                                            color: 'inherit',
                                            '&::placeholder': {
                                                color: 'inherit',
                                            },
                                        },
                                    }}
                                />

                            </FormControl>
                            <Button
                                type="submit"
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(45deg, var(--accent-dark-blue), var(--accent-blue))',
                                    border: '1px solid rgba(0, 168, 255, 0.3)',
                                    color: '#fff',
                                    py: 1,
                                    fontSize: '1rem',
                                    mt: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 15px rgba(0, 168, 255, 0.3)'
                                    }
                                }}
                            >
                                {t('signInButton')}
                            </Button>
                        </form>

                        <Divider
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                color: 'rgba(255, 255, 255, 0.6)', // Чуть ярче для читаемости
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                position: 'relative',
                                '&::before, &::after': {
                                    content: '""',
                                    flex: 1,
                                    height: '1px',
                                    background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.5), rgba(255,255,255,0.1))',
                                    margin: '0 12px',
                                }
                            }}
                        >
                            {t('or')}
                        </Divider>


                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            '& button': {
                                background: 'linear-gradient(45deg, var(--accent-dark-blue), var(--accent-blue))',
                                border: '1px solid rgba(0, 168, 255, 0.3)',
                                color: '#fff',
                                py: 1,
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 15px rgba(0, 168, 255, 0.3)'
                                }
                            }
                        }}>
                            <PhantomConnectButton onConnect={handlePhantomConnect} />
                            <MetamaskConnectButton onConnect={handleMetaMaskConnect} />
                        </Box>
                    </Box>

                    <Box component="footer" sx={{ py: 3 }}>
                        <Typography
                            level="body-xs"
                            sx={{
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.5)'
                            }}
                        >
                            {t('footerText', { year: new Date().getFullYear() })}
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
                    left: { xs: 0, md: '50vw' },
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
