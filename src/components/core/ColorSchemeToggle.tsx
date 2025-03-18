import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import IconButton, { IconButtonProps } from "@mui/joy/IconButton";
import { useColorScheme } from "@mui/joy/styles";
import React from "react";
import Typography from "@mui/joy/Typography";
import Box, { BoxProps } from "@mui/joy/Box";
import {LanguageSwitcher} from "./LanguageSwitcher";
import SolanaIcon from "./SolanaIcon";
import {Switch} from "@mui/joy";
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import {useTranslation} from "react-i18next";

export function DarkModeSwitch() {
    const { mode, setMode } = useColorScheme();
    const [mounted, setMounted] = React.useState(false);
    const { t } = useTranslation();

    React.useEffect(() => setMounted(true), []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMode(event.target.checked ? 'dark' : 'light');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DarkModeOutlinedIcon />
                <Typography
                    level="title-sm"
                    sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {t('Dark Mode')}
                </Typography>
            </Box>
            <Switch
                checked={mode === 'dark'}
                disabled={!mounted}
                onChange={handleChange}
                aria-label="toggle dark mode"
                sx={{
                    transition: 'transform 0.3s',
                    '&:checked': {
                        transform: 'scale(1.2)',
                    },
                }}
            />
        </Box>
    );
}

export function ColorSchemeToggle(props: IconButtonProps) {
    const { onClick, ...other } = props;
    const { mode, setMode } = useColorScheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    return (
        <IconButton
            aria-label="toggle light/dark mode"
            size="sm"
            variant="soft"
            disabled={!mounted}
            onClick={(event) => {
                setMode(mode === 'light' ? 'dark' : 'light');
                onClick?.(event);
            }}
            sx={{
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 12px rgba(0, 168, 255, 0.3)',
                }
            }}
            {...other}
        >
            {mode === 'light' ? <DarkModeRoundedIcon sx={{ color: '#ffcc00' }} /> : <LightModeRoundedIcon sx={{ color: '#00a8ff' }} />}
        </IconButton>
    );
}


interface HeaderProps extends BoxProps {}

export function Header({ sx, ...props }: HeaderProps) {
    return (
        <Box
            component="header"
            sx={{
                py: 3,
                px: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                ...sx,
            }}
            {...props}
        >
            {/* Логотип и заголовок */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                    variant="soft"
                    size="sm"
                    sx={{
                        borderRadius: "50%",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.1)",
                            boxShadow: "0 0 15px rgba(0, 168, 255, 0.4)",
                        },
                    }}
                >
                    <SolanaIcon />
                </IconButton>
                <Typography
                    component="h1"
                    sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        background: "linear-gradient(45deg, var(--accent-blue), var(--accent-dark-blue))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    SolaChat
                </Typography>
            </Box>


            {/* Переключатели */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LanguageSwitcher />
            </Box>
        </Box>
    );
}
