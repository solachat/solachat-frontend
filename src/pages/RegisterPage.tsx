import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/core/ColorSchemeToggle';
import axios from 'axios';
import PhantomConnectButton from '../components/core/PhantomConnectButton';
import { Helmet } from "react-helmet-async";
import MetamaskConnectButton from "../components/core/MetamaskConnectButton";
import {motion} from "framer-motion";
import WalletConnectButton from "../components/core/WalletConnectButton";

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

interface FormElements extends HTMLFormControlsCollection {
    username: HTMLInputElement;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

interface SignUpFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
};


const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
    const [signedMessage, setSignedMessage] = useState<{ message: string; signature: string } | null>(null);

    useEffect(() => {
        if (walletAddress && signedMessage) {
            handleSubmit();
        }
    }, [walletAddress, signedMessage]);

    const handleSubmit = async () => {
        const userData = {
            lastlogin: new Date().toISOString(),
            message: signedMessage?.message,
            signature: signedMessage?.signature,
            wallet: walletAddress,
        };

        try {
            const response = await axios.post(`${API_URL}/api/users/register`, userData);
            const token = response.data.token;
            if (token) {
                localStorage.setItem("token", token);
                navigate('/chat');
            }
        } catch (error) {
            console.error("Registration failed", error);

            if (axios.isAxiosError(error)) {
                const errorMessage =
                    error.response?.data && typeof error.response.data === "object" && "message" in error.response.data
                        ? (error.response.data as { message: string }).message
                        : t("registrationFailed");

                setErrorMessage(errorMessage);
            } else {
                setErrorMessage(t("registrationFailed"));
            }
        }
    };

    const handlePhantomConnect = async () => {
        if (window.solana?.isPhantom) {
            try {
                const { publicKey } = await window.solana.connect();
                const walletAddress = publicKey.toString();

                if (!window.solana.signMessage) {
                    throw new Error(t("error.phantomNotSupportSignMessage"));
                }

                const message = t("message.confirmRegistration", { nonce: Math.random() });
                const encodedMessage = new TextEncoder().encode(message);

                const { signature } = await window.solana.signMessage(encodedMessage, 'utf8');
                const signatureBase64 = btoa(String.fromCharCode(...Array.from(signature)));

                setWalletAddress(walletAddress);
                setSignedMessage({ message, signature: signatureBase64 });
                setErrorMessage(null);

            } catch (error) {
                console.error(t("error.connectingPhantom"), error);
                setErrorMessage(t("error.connectingWallet"));
            }
        } else {
            setErrorMessage(t("error.phantomNotFound"));
        }
    };

    const handleMetaMaskConnect = async () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const walletAddress = accounts[0];
                const message = t("message.confirmRegistration", { nonce: Math.random() });

                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, walletAddress],
                });

                setWalletAddress(walletAddress);
                setSignedMessage({ message, signature });
                setErrorMessage(null);
            } catch (error) {
                console.error(t("error.connectingMetaMask"), error);
                setErrorMessage(t("error.connectMetaMaskFailed"));
            }
        } else {
            setErrorMessage(t("error.metaMaskNotFound"));
        }
    };

    const handleWalletConnect = (wallet: string) => {
        setWalletAddress(wallet);
        setSignedMessage({ message: "Authenticated", signature: "walletConnectSignature" });
    };

    return (
        <CssVarsProvider disableTransitionOnChange>
            <Helmet>
                <title>{t('title.register')}</title>
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
                                {t('signUp')}
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
                                {t('alreadyHaveAccount')}{' '}
                                <Link component={RouterLink} to="/login">
                                    {t('signIn')}
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
                            {/*<WalletConnectButton onConnect={handleWalletConnect}/>*/}
                        </Box>
                    </Box>

                    <Box component="footer" sx={{ py: 3 }}>
                        <Typography
                            level="body-xs"
                            sx={{
                                textAlign: 'center',
                                color: 'white'
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
}

export default RegisterPage;
