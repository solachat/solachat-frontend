import * as React from 'react';
import {
    Box,
    Button,
    Typography,
    styled,
    ButtonProps,
    Menu,
    MenuItem,
    Drawer,
    IconButton
} from '@mui/joy';
import { useTranslation } from 'react-i18next';
import {Link as RouterLink, LinkProps, useLocation} from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LanguageIcon from '@mui/icons-material/Language';
import Link from "@mui/joy/Link";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {Apps} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface BurgerIconProps {
    open: boolean;
    onClick: () => void;
}
const BurgerIcon: React.FC<BurgerIconProps> = ({ open, onClick }) => (
    <Box
        sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 30,
            height: 20,
            cursor: 'pointer',
            zIndex: 1200,
        }}
        onClick={onClick}
    >
        {open ? (
            <CloseIcon sx={{ color: '#00a8ff', fontSize: 30 }} />
        ) : (
            <>
                <Box sx={{ height: 2, width: '100%', bgcolor: '#00a8ff', borderRadius: 1 }} />
                <Box sx={{ height: 2, width: '100%', bgcolor: '#00a8ff', borderRadius: 1 }} />
                <Box sx={{ height: 2, width: '100%', bgcolor: '#00a8ff', borderRadius: 1 }} />
            </>
        )}
    </Box>
);

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
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
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
            py: { xs: 4, md: 2 },
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(180deg, #0a192f, #081428)',
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
                display: { xs: 'none', md: 'flex' },
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
                    to="/faq"
                    sx={{
                        background: isActive('/faq') ? 'rgba(0, 168, 255, 0.5)' : 'linear-gradient(45deg, #00a8ff30 30%, #007bff30 90%)',
                        color: isActive('/faq') ? 'white' : '#00a8ff'
                    }}
                >
                    <HelpOutlineIcon /> {t('navbar.faq')}
                </NavButton>
                <NavButton
                    component={RouterLink}
                    to="/apps"
                    sx={{
                        background: isActive('/apps') ? 'rgba(0, 168, 255, 0.5)' : 'linear-gradient(45deg, #00a8ff30 30%, #007bff30 90%)',
                        color: isActive('/apps') ? 'white' : '#00a8ff'
                    }}
                >
                    <Apps /> {t('navbar.apps')}
                </NavButton>
            </Box>

            <Drawer
                anchor="right"
                open={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 280,
                        background: 'linear-gradient(180deg, #0a192f, #081428)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 0 15px rgba(0,168,255,0.2)',
                        padding: 2,
                        color: '#00a8ff',
                        '& .MuiListItemButton-root': {
                            transition: 'all 0.3s ease',
                        }
                    }
                }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',


                }}>
                    <IconButton
                        onClick={() => setIsMenuOpen(false)}
                        sx={{
                            color: '#00a8ff',
                            '&:hover': {
                                background: 'rgba(0,168,255,0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        mt: 2,
                        px: 1,
                    }}
                >
                    {[
                        { to: '/feedback', icon: <EmailIcon />, text: t('navbar.feedback') },
                        { to: '/jobs', icon: <WorkOutlineIcon />, text: t('navbar.vacancies') },
                        { to: '/faq', icon: <HelpOutlineIcon />, text: t('navbar.faq') },
                        { to: '/apps', icon: <Apps />, text: t('navbar.apps') },
                    ].map((item) => (
                        <NavButton
                            key={item.to}
                            component={RouterLink}
                            to={item.to}
                            fullWidth
                            onClick={() => setIsMenuOpen(false)}
                            sx={{
                                justifyContent: 'flex-start',
                                background: isActive(item.to)
                                    ? 'rgba(0,168,255,0.5)'
                                    : 'linear-gradient(45deg, rgba(0,168,255,0.2) 30%, rgba(0,123,255,0.2) 90%)',
                                color: isActive(item.to)
                                    ? 'white'
                                    : 'rgba(160,212,255,0.9)',
                                mb: 1,
                                border: '1px solid rgba(0,168,255,0.3)',
                                borderRadius: '8px',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: '0 0 10px rgba(0,168,255,0.4)',
                                },
                                p: 1.5,
                            }}
                        >
                            {item.icon}
                            <Box sx={{ flexGrow: 1, textAlign: 'left', ml: 1.5 }}>
                                {item.text}
                            </Box>
                        </NavButton>
                    ))}

                {!isAuthenticated && (
                        <>
                            <NavButton
                                component={RouterLink}
                                to="/login"
                                fullWidth
                                onClick={() => setIsMenuOpen(false)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    background: 'transparent',
                                    color: '#00a8ff',
                                    border: '1px solid rgba(0,168,255,0.3)',
                                    mt: 2,
                                    '&:hover': {
                                        background: 'rgba(0,168,255,0.1)'
                                    }
                                }}
                            >
                                <AccountCircleIcon />
                                <Box sx={{ flexGrow: 1, textAlign: 'left', ml: 1.5 }}>
                                    {t('navbar.signIn')}
                                </Box>
                            </NavButton>

                            <NavButton
                                component={RouterLink}
                                to="/register"
                                fullWidth
                                onClick={() => setIsMenuOpen(false)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                                    color: 'white',
                                    '&:hover': {
                                        boxShadow: '0 0 12px rgba(0,168,255,0.4)'
                                    }
                                }}
                            >
                                <HowToRegIcon />
                                <Box sx={{ flexGrow: 1, textAlign: 'left', ml: 1.5 }}>
                                    {t('navbar.signUp')}
                                </Box>
                            </NavButton>
                        </>
                    )}
                </Box>
            </Drawer>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'absolute', right: 16}}>
                {/* Бургер-иконка для мобильных устройств */}

                {/* Кнопка языка для десктопных устройств */}
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
                                        transition: 'background 0.3s ease, border-left 0.3s ease',
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
                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 2 }}>
                    <BurgerIcon open={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
                </Box>

            {!isAuthenticated && (
                    <>
                        <NavButton
                            component={RouterLink}
                            to="/login"
                            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                        >
                            <AccountCircleIcon /> {t('navbar.signIn')}
                        </NavButton>
                        <NavButton
                            component={RouterLink}
                            to="/register"
                            sx={{
                                display: { xs: 'none', md: 'inline-flex' },
                                background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                                color: 'white'
                            }}
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

const linkStyle = {
    padding: '10px 16px',
    color: '#a0d4ff',
    textDecoration: 'none',
    fontSize: '16px',
    borderRadius: '6px',
    transition: 'background 0.3s ease',
    '&:hover': { background: 'rgba(0, 168, 255, 0.1)' }
};
