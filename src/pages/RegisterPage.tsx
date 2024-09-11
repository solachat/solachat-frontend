import * as React from 'react';
import {useNavigate} from 'react-router-dom';
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
import Alert from '@mui/joy/Alert';
import GoogleIcon from '../components/core/GoogleIcon';
import TelegramIcon from '../components/core/TelegramIcon';
import {Link as RouterLink} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Header} from '../components/core/ColorSchemeToggle';
import {UserProfile} from '../api/auth';
import axios from 'axios';
import {ethers} from 'ethers';

import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Person from '@mui/icons-material/Person';
import {Helmet} from "react-helmet-async";

interface FormElements extends HTMLFormControlsCollection {
    username: HTMLInputElement;
    realname: HTMLInputElement;
    email: HTMLInputElement;
    password: HTMLInputElement;
    confirmPassword: HTMLInputElement;
    persistent: HTMLInputElement;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

interface SignUpFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

const RegisterPage: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [buttonColor, setButtonColor] = React.useState<string | undefined>(undefined);

    const handleSubmit = async (event: React.FormEvent<SignUpFormElement>) => {
        event.preventDefault();
        const formElements = event.currentTarget.elements;

        const userData: UserProfile = {
            username: formElements.username.value,
            realname: formElements.realname.value,
            email: formElements.email.value,
            password: formElements.password.value,
            confirmPassword: formElements.confirmPassword.value,
            persistent: formElements.persistent.checked,
            lastlogin: new Date().toISOString(),
            role: '',
            shareEmail: false,
            country: '',
            shareCountry: false,
            timezone: '',
            shareTimezone: false,
            rating: 0,
            wallet: ''
        };

        if (userData.password !== userData.confirmPassword) {
            setErrorMessage(t('passwordsDoNotMatch'));
            setButtonColor('red');
            setTimeout(() => setButtonColor(undefined), 1000);
            return;
        }

        const wallet = ethers.Wallet.createRandom();
        userData.wallet = wallet.address;

        try {
            const response = await axios.post(`${API_URL}/api/users/register`, userData);
            const token = response.data.token;
            localStorage.setItem('token', token);
            if (userData.persistent) {
                localStorage.setItem('persistent', 'true');
            }
            navigate('/account?username=' + encodeURIComponent(userData.username));
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(`Registration failed: ${error.message}`);
            } else {
                setErrorMessage('Registration failed');
            }
        }
    };

    return (
        <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
            <Helmet>
                <title>{t('title.register')}</title>
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
                            <Alert color="danger" sx={{mb: 2}}>
                                {errorMessage}
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit}>
                            <FormControl required>
                                <FormLabel>{t('username')}</FormLabel>
                                <Input
                                    type="text"
                                    name="username"
                                    startDecorator={<Person/>}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            pl: '32px',
                                        },
                                    }}
                                />
                            </FormControl>
                            <FormControl required>
                                <FormLabel>{t('realName')}</FormLabel>
                                <Input
                                    type="text"
                                    name="realname"
                                    startDecorator={<Person/>}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            pl: '32px',
                                        },
                                    }}
                                />
                            </FormControl>
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
                            <FormControl required>
                                <FormLabel>{t('confirmPassword')}</FormLabel>
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    startDecorator={<LockOpenIcon/>}
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
                                <Button type="submit" fullWidth sx={{backgroundColor: buttonColor}}>
                                    {t('signUp')}
                                </Button>
                            </Stack>
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

export default RegisterPage;
