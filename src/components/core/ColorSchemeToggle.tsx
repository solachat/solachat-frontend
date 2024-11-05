import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import IconButton, { IconButtonProps } from "@mui/joy/IconButton";
import { useColorScheme } from "@mui/joy/styles";
import React from "react";
import Typography from "@mui/joy/Typography";
import Box, { BoxProps } from "@mui/joy/Box";
import LanguageSwitcher from "./LanguageSwitcher";
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
                gap: 1,
            }}
        >
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
            variant="outlined"
            disabled={!mounted}
            onClick={(event) => {
                setMode(mode === 'light' ? 'dark' : 'light');
                onClick?.(event);
            }}
            {...other}
        >
            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
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
                px: 2,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                width: '100%',
                ...sx,
            }}
            {...props}
        >
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                <IconButton variant="soft" size="sm">
                    <SolanaIcon />
                </IconButton>
                <Typography component="h1">SolaChat</Typography>
            </Box>
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                <ColorSchemeToggle />
                <LanguageSwitcher />
            </Box>
        </Box>
    );
}
