import * as React from 'react';
import {
    Box,
    Button,
    Typography,
    styled,
    ButtonProps,
    Menu,
    MenuItem,
    ListItemDecorator
} from '@mui/joy';
import { useTranslation } from 'react-i18next';
import {Link as RouterLink, LinkProps, useLocation} from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';
import Link from "@mui/joy/Link";
import ClickAwayListener from '@mui/material/ClickAwayListener';

type NavButtonProps = ButtonProps & LinkProps & {
    component?: React.ElementType;
};

const NavButton = styled(Button)<NavButtonProps>(() => ({
    background: 'linear-gradient(45deg, #00a8ff30 30%, #007bff30 90%)',
    border: '1px solid rgba(0, 168, 255, 0.3)',
    color: '#00a8ff',
    borderRadius: '8px',
    padding: '8px 16px',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(45deg, #00a8ff50 30%, #007bff50 90%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 15px rgba(0, 168, 255, 0.2)'
    },
    '& svg': {
        marginRight: '8px'
    }
}));

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const [isAuthenticated] = React.useState(!!localStorage.getItem('token'));

    const languages = [
        { code: 'en', label: 'EN', fullLabel: 'English' },
        { code: 'ru', label: 'RU', fullLabel: 'Русский' },
        { code: 'ch', label: 'CH', fullLabel: '中文' }
    ];
    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem('language', code);
        handleClose();
    };

    return (
        <Box component="nav" sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            px: { xs: 2, md: 6 },
            py: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(10, 25, 47, 0.9)',
            backdropFilter: 'blur(10px)',
            position: 'relative'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'absolute', left: 16 }}>
                <Link component={RouterLink} to="/" sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                }}>
                    <img
                        src="/favicon.ico"
                        alt="Solana"
                        style={{
                            width: 40,
                            height: 40,
                            filter: 'drop-shadow(0 0 5px rgba(0,168,255,0.3))'
                        }}
                    />
                </Link>
            </Box>

            <Box sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
                flexGrow: 1
            }}>
                <NavButton
                    component={RouterLink}
                    to="/feedback"
                    sx={{
                        background: isActive('/feedback') ? 'rgba(0, 168, 255, 0.5)' : 'linear-gradient(45deg, #00a8ff30 30%, #007bff30 90%)',
                        color: isActive('/feedback') ? 'white' : '#00a8ff'
                    }}
                >
                    <EmailIcon /> {t('navbar.feedback')}
                </NavButton>
                <NavButton
                    component={RouterLink}
                    to="/jobs"
                    sx={{
                        background: isActive('/careers') ? 'rgba(0, 168, 255, 0.5)' : 'linear-gradient(45deg, #00a8ff30 30%, #007bff30 90%)',
                        color: isActive('/jobs') ? 'white' : '#00a8ff'
                    }}
                >
                    <WorkOutlineIcon /> {t('navbar.vacancies')}
                </NavButton>
                <NavButton
                    component={RouterLink}
                    to="/docs"
                    sx={{
                        background: isActive('/docs') ? 'rgba(0, 168, 255, 0.5)' : 'linear-gradient(45deg, #00a8ff30 30%, #007bff30 90%)',
                        color: isActive('/docs') ? 'white' : '#00a8ff'
                    }}
                >
                    <DescriptionIcon /> {t('navbar.documents')}
                </NavButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'absolute', right: 16 }}>
                <ClickAwayListener onClickAway={handleClose}>
                    <Box sx={{ position: 'relative' }}>
                        <Button
                            variant="outlined"
                            onClick={handleClick}
                            sx={{
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                border: '1px solid rgba(0,168,255,0.5)',
                                background: 'rgba(0,168,255,0.15)',
                                '&:hover': {
                                    background: 'rgba(0,168,255,0.3)',
                                    boxShadow: '0 0 12px rgba(0,168,255,0.2)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <LanguageIcon sx={{ color: '#00a8ff' }} />
                            <Typography sx={{ color: '#a0d4ff' }}>
                                {currentLang.label}
                            </Typography>
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            sx={{
                                background: 'rgba(10, 25, 47, 0.95)',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 168, 255, 0.3)',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 8px 32px rgba(0, 168, 255, 0.2)',
                                '& .MuiList-root': {
                                    py: 0.5
                                }
                            }}
                        >
                            {languages.map(lang => (
                                <MenuItem
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    sx={{
                                        position: 'relative',
                                        color: lang.code === i18n.language ? '#00a8ff' : '#a0d4ff',
                                        py: 1.5,
                                        px: 2.5,
                                        minWidth: 120,
                                        '&:hover': {
                                            background: 'rgba(0, 168, 255, 0.1)'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: lang.code === i18n.language ? '3px' : '0px',
                                            background: 'linear-gradient(180deg, #00a8ff, #007bff)',
                                            transition: 'width 0.3s ease'
                                        }
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Typography>
                                            {lang.fullLabel}
                                        </Typography>
                                        {lang.code === i18n.language && (
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(45deg, #00a8ff, #007bff)',
                                                boxShadow: '0 0 8px rgba(0,168,255,0.5)'
                                            }} />
                                        )}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </ClickAwayListener>
                {!isAuthenticated && (
                    <>
                        <NavButton component={RouterLink} to="/login">
                            <AccountCircleIcon /> {t('navbar.signIn')}
                        </NavButton>
                        <NavButton
                            component={RouterLink}
                            to="/register"
                            sx={{ background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)', color: 'white' }}
                        >
                            <HowToRegIcon />
                            {t('navbar.signUp')}
                        </NavButton>
                    </>
                )}
            </Box>
        </Box>
    );
}
