import React from 'react';
import { Box, IconButton, Typography, Avatar, Divider } from '@mui/joy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyIcon from '@mui/icons-material/VpnKey';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    avatar: string;
    publicKey: string;
    username?: string;
    bio?: string;
    id: string;
}

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
    // Получаем данные из JWT
    const token = localStorage.getItem('token');
    let avatarUrl = '';
    let publicKey = '';
    let username = '';
    let bio = '';
    let id = '';

    if (token) {
        try {
            const decoded: DecodedToken = jwtDecode(token);
            avatarUrl = decoded.avatar || 'https://via.placeholder.com/300'; // Заглушка если нет аватарки
            publicKey = decoded.publicKey || 'Unknown';
            username = decoded.username || '';
            bio = decoded.bio || '';
            id = decoded.id || '';
        } catch (error) {
            console.error('Invalid token', error);
        }
    }

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                maxWidth: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'background.surface',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Верхняя панель */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    gap: 1,
                    zIndex: 10,
                    backgroundColor: 'background.surface',
                }}
            >
                <IconButton onClick={onBack} sx={{ padding: 0 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography level="h4" sx={{ lineHeight: 'normal' }}>Settings</Typography>

                <Box sx={{ marginLeft: '73%', display: 'flex' }}>
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ position: 'relative', width: '100%', height: '100%', maxHeight: '70vh', marginTop: '50px' }}>
                <Avatar
                    src={avatarUrl}
                    alt="Avatar"
                    sx={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        borderRadius: 0,
                        objectFit: 'cover',
                    }}
                />

                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        color: 'white',
                        fontSize: 14,
                        padding: '6px 12px',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography sx={{ fontWeight: 'bold', fontSize: '20px', color: 'white' }}>
                        {publicKey}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ width: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingLeft: '15px' }}>
                    <KeyIcon sx={{ color: 'gray' }} />
                    <Box>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {publicKey}
                        </Typography>
                        <Typography sx={{ fontSize: '16px' }}>
                            ID
                        </Typography>
                    </Box>
                </Box>

                {/* Username (если есть) */}
                {username && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingLeft: '16px' }}>
                        <PersonIcon sx={{ color: 'gray' }} />
                        <Box>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>
                                @{username}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: 'gray' }}>
                                {username}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Bio (если есть) */}
                {bio && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingLeft: '16px' }}>
                        <InfoIcon sx={{ color: 'gray' }} />
                        <Typography sx={{ fontSize: '14px' }}>
                            {bio}
                        </Typography>
                    </Box>
                )}

                {/* Разделитель */}
                <Divider sx={{ marginY: '12px' }} />

                {/* Настройки */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingLeft: '16px' }}>
                        <SettingsIcon sx={{ color: 'gray' }} />
                        <Typography sx={{ fontSize: '16px' }}>
                            General Settings
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingLeft: '16px' }}>
                        <StorageIcon sx={{ color: 'gray' }} />
                        <Typography sx={{ fontSize: '16px' }}>
                            Data and Storage
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
