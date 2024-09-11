import * as React from 'react';
import {Box, Typography, Link} from '@mui/joy';
import {CssVarsProvider} from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import {useTranslation} from 'react-i18next';
import {Helmet} from "react-helmet-async";
import framesxTheme from '../theme/theme';
import {Header} from '../components/core/ColorSchemeToggle';
import Navbar from "../components/home/Navbar";
import Stack from "@mui/joy/Stack";
import Button from "@mui/joy/Button";
import TelegramIcon from "../components/core/TelegramIcon";
import DiscordIcon from "../components/core/DiscordIcon";
import Divider from "@mui/joy/Divider";

export default function ContactsPage() {
    const {t} = useTranslation();

    return (
        <CssVarsProvider disableTransitionOnChange theme={framesxTheme}>
            <Helmet>
                <title>{t('title.contacts')}</title>
            </Helmet>
            <CssBaseline/>
            <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                <Header/>
                <Navbar/>
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3
                }}>
                    <Typography level="h1" sx={{mb: 2}}>{t('contacts.title')}</Typography>
                    <Box sx={{textAlign: 'center'}}>
                        <Stack gap={4} sx={{mb: 2}}>
                            <Button
                                variant="soft"
                                color="neutral"
                                fullWidth
                                startDecorator={<TelegramIcon/>}
                            >
                                {t('Telegram')}
                            </Button>
                            <Divider
                                sx={(theme) => ({
                                    [theme.getColorSchemeSelector('light')]: {
                                        color: {xs: '#FFF', md: 'text.tertiary'},
                                    },
                                })}
                            >
                                {t('or')}
                            </Divider>
                            <Button
                                variant="soft"
                                color="neutral"
                                fullWidth
                                startDecorator={<DiscordIcon/>}
                            >
                                {t('Discord')}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </CssVarsProvider>
    );
}
