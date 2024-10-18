import * as React from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/joy/Typography';
import LanguageSwitcher from '../core/LanguageSwitcher';
import { ColorSchemeToggle } from '../core/ColorSchemeToggle';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
    title: string;
    onSidebarToggle: () => void;
};

export default function Header({ title, onSidebarToggle }: HeaderProps) {
    const { t } = useTranslation();

    return (
        <>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                p={2}
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
                {/* Кнопка для открытия Sidebar на всех экранах */}
                <IconButton onClick={onSidebarToggle}>
                    <MenuIcon />
                </IconButton>

                {/* Заголовок */}
                <Typography component="h1" fontWeight="lg" sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
                    {title}
                </Typography>

                {/* Переключатель языка и темы */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <LanguageSwitcher />
                    <ColorSchemeToggle />
                </Box>
            </Stack>
        </>
    );
}