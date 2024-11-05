import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
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
import Alert from '@mui/joy/Alert';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/core/ColorSchemeToggle';
import axios from 'axios';
import PhantomConnectButton from '../components/core/PhantomConnectButton';
import Person from '@mui/icons-material/Person';
import { Helmet } from "react-helmet-async";
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

interface FormElements extends HTMLFormControlsCollection {
    username: HTMLInputElement;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

interface SignUpFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
    const [signedMessage, setSignedMessage] = useState<{ message: string; signature: string } | null>(null);

    const handleSubmit = async (event: React.FormEvent<SignUpFormElement>) => {
        event.preventDefault();
        const formElements = event.currentTarget.elements;

        const userData = {
            username: formElements.username.value,
            lastlogin: new Date().toISOString(),
            message: signedMessage?.message,
            signature: signedMessage?.signature,
            wallet: walletAddress,
        };

        try {
            const response = await axios.post(`${API_URL}/api/users/register`, userData);
            const token = response.data.token;
            localStorage.setItem('token', token);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/account?username=' + encodeURIComponent(response.data.user.username));
            }
        } catch (error) {
            console.error('Registration failed', error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || t('registrationFailed');
                setErrorMessage(errorMessage);
            } else {
                setErrorMessage(t('registrationFailed'));
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

    return (
        <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
            <Helmet>
                <title>{t('title.register')}</title>
            </Helmet>
            <CssBaseline />
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
                    width: { xs: '100%', md: '50vw' },
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
                    <Header />

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
                        <Stack gap={1}>
                            <Typography component="h1" level="h3">
                                {t('signUp')}
                            </Typography>
                            <Typography level="body-sm">
                                {t('alreadyHaveAccount')}{' '}
                                <Link component={RouterLink} to="/login" level="title-sm">
                                    {t('signIn')}
                                </Link>
                            </Typography>
                        </Stack>
                        {errorMessage && (
                            <Alert color="danger" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit}>
                            <FormControl required>
                                <FormLabel>{t('username')}</FormLabel>
                                <Input
                                    type="text"
                                    name="username"
                                    startDecorator={<Person />}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            pl: '32px',
                                        },
                                    }}
                                />
                            </FormControl>
                            <Stack>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >

                                </Box>
                                <Button type="submit" fullWidth>
                                    {t('signUp')}
                                </Button>
                            </Stack>
                        </form>
                        <Divider
                            sx={(theme) => ({
                                [theme.getColorSchemeSelector('light')]: {
                                    color: { xs: '#FFF', md: 'text.tertiary' },
                                },
                            })}
                        >
                            {t('or')}
                        </Divider>
                        <PhantomConnectButton onConnect={handlePhantomConnect} />
                        <MetamaskConnectButton onConnect={handleMetaMaskConnect} />
                    </Box>

                    <Box component="footer" sx={{ py: 3 }}>
                        <Typography level="body-xs" textAlign="center">
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

export default RegisterPage;
