import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import IconButton, {IconButtonProps} from "@mui/joy/IconButton";
import {useColorScheme} from "@mui/joy/styles";
import React from "react";
import Typography from "@mui/joy/Typography";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import Box from "@mui/joy/Box";
import LanguageSwitcher from "./LanguageSwitcher";
import Navbar from "../home/Navbar";

export function ColorSchemeToggle(props: IconButtonProps) {
    const {onClick, ...other} = props;
    const {mode, setMode} = useColorScheme();
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
            {mode === 'light' ? <DarkModeRoundedIcon/> : <LightModeRoundedIcon/>}
        </IconButton>
    );
}

export function Header() {
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
            }}
        >
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                <IconButton variant="soft" color="primary" size="sm">
                    <BadgeRoundedIcon />
                </IconButton>
                <Typography component="h1">Coin</Typography>
            </Box>
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                <ColorSchemeToggle />
                <LanguageSwitcher />
            </Box>
        </Box>
    );
}
