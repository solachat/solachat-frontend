import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import Divider from '@mui/joy/Divider';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { Avatar, Box, IconButton, Sheet, Typography } from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { jwtDecode } from 'jwt-decode';
import AvatarUploadModal from "../profile/AvatarUploadModal";
import {checkUsernameAvailability, updateUserProfile} from '../../api/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


interface DecodedToken {
    avatar: string;
    publicKey: string;
    username?: string;
    aboutMe?: string;
    id: string;
}

const MAX_ABOUT_ME_WORDS = 140;

const EditProfileScreen = ({
                               onBack
                           }: {
    onBack: () => void;
}) => {
    const { t } = useTranslation();
    const [profile, setProfile] = useState<Partial<DecodedToken>>({});
    const [aboutMe, setAboutMe] = useState('');
    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [isModified, setIsModified] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode<DecodedToken>(token);
            setProfile({
                avatar: decoded.avatar,
                publicKey: decoded.publicKey,
                username: decoded.username || '',
                aboutMe: decoded.aboutMe || ''
            });
            setUsername(decoded.username || '');
            setAboutMe(decoded.aboutMe || '');
        }
    }, []);

    useEffect(() => {
        const trimmedUsername = username.trim();
        const trimmedAboutMe = aboutMe.trim();
        const originalUsername = (profile.username || '').trim();
        const originalAboutMe = (profile.aboutMe || '').trim();

        const hasChanges = trimmedUsername !== originalUsername || trimmedAboutMe !== originalAboutMe;

        console.log('Profile.username:', profile.username);
        console.log('Profile.aboutMe:', profile.aboutMe);
        console.log('Trimmed username:', trimmedUsername);
        console.log('Trimmed aboutMe:', trimmedAboutMe);
        console.log('hasChanges:', hasChanges);

        setIsModified(hasChanges);
    }, [username, aboutMe, profile.username, profile.aboutMe]);


    const validateUsername = (value: string) => {
        if (value.length < 5) {
            return t('username_min_length');
        }
        if (!/^[a-z0-9_]+$/.test(value)) {
            return t('username_invalid_format');
        }
        return '';
    };

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setUsername(value);

        const validationError = validateUsername(value);
        setUsername(value);
        if (validationError) {
            setUsernameError(validationError);
            setUsernameAvailable(false);
            return;
        }

        const isAvailable = await checkUsernameAvailability(value);
        setUsernameAvailable(isAvailable);
        setUsernameError(isAvailable ? '' : t('username_taken'));
    };


    const handleAboutMeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const words = e.target.value.split(/\s+/).filter(Boolean);
        if (words.length <= MAX_ABOUT_ME_WORDS) {
            setAboutMe(e.target.value);
        }
    };

    const handleSave = async () => {
        if (usernameError) return;

        const token = localStorage.getItem('token');
        if (!token || !profile.publicKey) return;

        try {
            console.log('Saving profile...');
            const updatedUser = await updateUserProfile(profile.publicKey, username, aboutMe, token);
            setProfile((prev) => ({ ...prev, ...updatedUser }));
            setIsModified(false);
            console.log('Profile saved, isModified reset:', isModified);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    useEffect(() => {
        if (isModified) {
            setTimeout(() => setIsModified(true), 0);
        }
    }, [isModified]);


    return (
        <Sheet sx={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #00162d 0%, #000d1a 100%)',
            overflow: 'auto',
            '&::-webkit-scrollbar': { display: 'none' }
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid rgba(0,168,255,0.3)',
                background: 'rgba(0,22,45,0.9)',
                backdropFilter: 'blur(12px)',
            }}>
                <IconButton onClick={onBack} sx={{ color: '#a0d4ff', mr: 2 }}>
                    <ArrowBackIcon sx={{ fontSize: 24 }} />
                </IconButton>
                <Typography level="h4" sx={{
                    color: '#a0d4ff',
                    flexGrow: 1,
                    textShadow: '0 2px 4px rgba(0,168,255,0.3)'
                }}>
                    {t('edit_profile')}
                </Typography>
            </Box>


            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 1,
                position: 'relative'
            }}>
                <Avatar
                    src={profile.avatar}
                    sx={{
                        width: 140,
                        height: 140,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        filter: 'brightness(0.6)',
                        position: 'relative'
                    }}
                />
                <IconButton
                    onClick={() => setIsUploadModalOpen(true)}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translate(-50%, -50%) scale(1.2)',
                            opacity: 0.8,
                            backgroundColor: 'transparent'
                        }
                    }}>
                    <AddAPhotoIcon sx={{ fontSize: 40, color: 'white' }} />
                </IconButton>
            </Box>

            <AvatarUploadModal
                open={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={(avatarUrl) => setProfile(prev => ({ ...prev, avatar: avatarUrl }))}
            />

            <Box sx={{ p: 3, flex: 1 }}>
                <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'bold', color: '#a0d4ff', textShadow: '0 2px 4px rgba(0,168,255,0.3)' }}>
                    {t('about_me')}
                </Typography>
                <Textarea
                    minRows={2}
                    maxRows={4}
                    value={aboutMe}
                    onChange={handleAboutMeChange}
                    sx={{
                        height: 40,
                        mb: 1,
                        bgcolor: 'rgba(0,22,45,0.6)',
                        borderColor: 'rgba(0,168,255,0.3)',
                        fontSize: '1rem'
                    }}
                />
                <Typography level="body-xs" sx={{ color: '#6b8cbe', mb: 2 }}>
                    {t('about_me_description')}<br />
                    {t('example_about_me')}
                </Typography>
                <Divider sx={{ my: 3, bgcolor: 'rgba(0,168,255,0.3)' }} />


                <Box sx={{ mb: 2 }}>
                    <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'bold', color: '#a0d4ff' }}>
                        {t('username')}
                    </Typography>
                    <Input
                        value={username}
                        onChange={handleUsernameChange}
                        sx={{
                            height: 40,
                            bgcolor: 'rgba(0,22,45,0.6)',
                            borderColor: usernameError
                                ? 'red'
                                : usernameAvailable
                                    ? 'green'
                                    : 'rgba(0,168,255,0.3)',
                            fontSize: '1rem',
                            '&:hover': {
                                borderColor: usernameAvailable ? 'green' : usernameError ? 'red' : '#00a8ff',
                            }
                        }}
                    />
                    {usernameError && (
                        <Typography level="body-xs" color="danger" sx={{ mt: 1 }}>
                            {usernameError}
                        </Typography>
                    )}
                    {!usernameError && usernameAvailable && (
                        <Typography level="body-xs" sx={{ mt: 1, color: '#28a745' }}>
                            {t('username_available')}
                        </Typography>
                    )}
                </Box>

                <Typography level="body-sm" sx={{ color: '#8ab4f8', mt: 2 }}>
                    {t('username_description_part1')}{' '}
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>SolaChat</Typography>{' '}
                    {t('username_description_part2')}<br /><br />
                    {t('username_rules')}{' '}
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>a-z, 0-9</Typography>{' '}
                    {t('and_underscores')} {t('min_length_5')}
                </Typography>

                <Typography level="body-sm" sx={{
                    color: '#6b8cbe',
                    mt: 3,
                    wordBreak: 'break-all',
                    fontSize: '0.9rem'
                }}>
                    https://solachat.org/{username || profile.publicKey}
                </Typography>
            </Box>
            {isModified && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 50,
                        height: 50,
                        backgroundColor: 'rgba(0, 22, 45, 0.7)',
                        borderRadius: '50%',
                        border: '1px solid rgba(0, 168, 255, 0.3)',
                        boxShadow: '0px 4px 12px rgba(0, 168, 255, 0.2)',
                        cursor: 'pointer',
                        zIndex: 10,

                        opacity: 1,
                        transform: 'scale(1)',
                        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out, background-color 0.3s ease-in-out',

                        '&:hover': {
                            backgroundColor: 'rgba(0, 30, 60, 0.8)',
                            transform: 'scale(1.1)',
                        }
                    }}
                    onClick={handleSave}
                >
                    <CheckCircleIcon sx={{ color: 'rgba(160, 212, 255, 0.8)', fontSize: 34 }} />
                </Box>
            )}
        </Sheet>
    );
};

export default EditProfileScreen;
