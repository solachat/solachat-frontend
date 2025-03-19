import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { UserProps } from '../core/types';
import { useTranslation } from 'react-i18next';
import MessagesMenu from './MessagesMenu';
import GroupInfoModal from '../group/GroupInfoModal';
import CallModal from './CallModal';
import { jwtDecode } from 'jwt-decode';
import Verified from '../core/Verified';
import {useEffect} from "react";
import Box from "@mui/joy/Box";
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { AnimatePresence, motion } from 'framer-motion';

type UserStatus = Pick<UserProps, 'online' | 'lastOnline'>;

type MessagesPaneHeaderProps = {
    sender?: UserProps;
    chatId: number;
    isGroup?: boolean;
    chatName?: string;
    groupAvatar?: string;
    members?: UserProps[];
    onBack?: () => void;
    userStatus?: UserStatus;
    onPublicKeyClick?: () => void;

};

export default function MessagesPaneHeader({
                                               sender,
                                               chatId,
                                               isGroup,
                                               chatName,
                                               groupAvatar,
                                               members = [],
                                               onBack,
                                               userStatus,
    onPublicKeyClick
                                           }: MessagesPaneHeaderProps) {
    const { t, i18n } = useTranslation();
    const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = React.useState(false);
    const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
    const [currentTime, setCurrentTime] = React.useState(Date.now());

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: { id: number } = jwtDecode(token);
            setCurrentUserId(decodedToken.id);
        }
    }, []);

    const receiverId = !isGroup && sender && currentUserId !== null && sender.id !== currentUserId
        ? sender.id
        : null;

    const handleAvatarClick = () => {
        if (isGroup) {
            setIsGroupModalOpen(true);
        } else if (sender?.public_key) {
            window.location.href = `/${sender.public_key}`;
        }
    };

    const getMemberLabel = (count: number, locale: string = 'en') => {
        if (locale === 'ru') {
            if (count % 10 === 1 && count % 100 !== 11) {
                return 'участник';
            } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
                return 'участника';
            } else {
                return 'участников';
            }
        } else {
            return count === 1 ? 'member' : 'members';
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const [isOpen, setIsOpen] = React.useState(false);

    const formatTimeAgo = (timestamp: number) => {
        const now = new Date(currentTime);
        const date = new Date(timestamp);
        const diff = currentTime - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (diff < 60000) return t("just_now");

        if (date.toDateString() === now.toDateString()) {
            if (minutes < 60) return t("minutes_ago", { count: minutes });
            return t("hours_ago", { count: hours });
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            const timeString = date.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });
            return t("last_seen_yesterday", { time: timeString });
        }

        return date.toLocaleDateString(i18n.language, {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };
    const [isAvatarOverlayOpen, setIsAvatarOverlayOpen] = React.useState(false);

    const headerHeight = 68;
    const borderStyle = '1px solid rgba(0, 168, 255, 0.3)';
    const gradientBorder = 'linear-gradient(90deg, transparent 0%, rgba(0, 168, 255, 0.4) 50%, transparent 100%)';
    const backdropStyles = {
        backgroundColor: 'rgba(0, 22, 45, 0.85)',
        backdropFilter: 'blur(20px)',
    };


    return isGroup || sender ? (
        <>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    height: `${headerHeight}px`,
                    px: { xs: 2, md: 1 },
                    borderBottom: borderStyle,
                    position: 'relative',
                    ...backdropStyles,
                    '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: gradientBorder,
                    },
                }}
            >
                <Stack
                    direction="row"
                    spacing={{ xs: 1, md: 1.5 }}
                    sx={{
                        alignItems: 'center',
                        width: { xs: '100%', sm: 'auto' },
                        maxWidth: { xs: '80%', sm: '100%' },
                        overflow: 'hidden',
                    }}
                >
                    <IconButton
                        variant="plain"
                        color="neutral"
                        size="sm"
                        sx={{
                            display: { xs: 'inline-flex', sm: 'none' },
                            color: '#00a8ff',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 168, 255, 0.1)',
                            },
                        }}
                        onClick={onBack}
                    >
                        <ArrowBackIosNewRoundedIcon />
                    </IconButton>

                    <Avatar
                        size="lg"
                        src={isGroup ? groupAvatar || 'path/to/default-group-avatar.jpg' : sender?.avatar}
                        alt={isGroup ? chatName : sender?.public_key}
                        onClick={() => setIsAvatarOverlayOpen(true)}
                        sx={{
                            cursor: 'pointer',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: '#00a8ff',
                                boxShadow: '0 0 12px rgba(0, 168, 255, 0.3)',
                            },
                        }}
                    />


                    <div style={{ width: '100%' }}>
                        <Typography
                            fontWeight="lg"
                            fontSize={{ xs: 'md', md: 'lg' }}
                            component="h2"
                            noWrap
                            sx={{
                                cursor: 'pointer',
                                color: '#a0d4ff',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    color: '#00a8ff',
                                    textShadow: '0 0 8px rgba(0, 168, 255, 0.4)',
                                },
                            }}
                            onClick={onPublicKeyClick}
                        >
                            {isGroup ? chatName : sender?.public_key}
                            {sender?.verified && <Verified sx={{ ml: 1, color: '#00a8ff' }} />}
                        </Typography>

                        <Typography
                            level="body-sm"
                            sx={{
                                color: sender?.online ? '#00a8ff' : 'rgba(160, 212, 255, 0.6)',
                                fontSize: '0.8rem',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {sender?.online
                                ? t("online")
                                : sender?.lastOnline
                                    ? t("last_seen", { time: formatTimeAgo(new Date(sender.lastOnline).getTime()) })
                                    : t("offline")}
                        </Typography>

                        {isGroup && (
                            <Typography
                                level="body-sm"
                                sx={{
                                    color: 'rgba(160, 212, 255, 0.6)',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {members.length} {getMemberLabel(members.length, i18n.language)}
                            </Typography>
                        )}
                    </div>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ position: 'relative' }}>
                    <IconButton
                        onClick={() => setIsOpen(prev => !prev)}
                        aria-label="Toggle menu"
                        sx={{
                            color: '#00a8ff',
                            transition: 'all 0.3s ease',
                            borderRadius: "8px",
                            backgroundColor: isOpen ? 'rgba(0, 168, 255, 0.15)' : 'transparent',
                            '&:hover': {
                                backgroundColor: "rgba(0, 168, 255, 0.15)",
                                boxShadow: '0 0 8px rgba(0, 168, 255, 0.3)',
                            },
                        }}
                    >
                        <MoreVertRoundedIcon />
                    </IconButton>

                    <Box
                        sx={{
                            position: "absolute",
                            top: "48px",
                            right: 0,
                            mt: 1,
                            zIndex: 9,
                            background: 'rgba(0, 22, 45, 0.98)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 168, 255, 0.4)',
                            boxShadow: '0 12px 40px rgba(0, 168, 255, 0.25)',
                            transformOrigin: 'top right',
                            transition: 'opacity 0.2s ease, transform 0.2s ease',
                            opacity: isOpen ? 1 : 0,
                            transform: isOpen ? 'scale(1)' : 'scale(0.95)',
                            visibility: isOpen ? 'visible' : 'hidden',
                        }}
                    >
                        <MessagesMenu
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            chatId={chatId}
                            token={localStorage.getItem('token') || ''}
                            onDeleteChat={() => console.log('Chat deleted')}
                        />
                    </Box>
                </Stack>
            </Stack>

            {isGroup && currentUserId !== null && (
                <GroupInfoModal
                    open={isGroupModalOpen}
                    onClose={() => setIsGroupModalOpen(false)}
                    groupName={chatName || 'Group'}
                    groupAvatar={groupAvatar || ''}
                    users={members}
                    currentUserId={currentUserId}
                    chatId={chatId}
                    token={localStorage.getItem('token') || ''}
                />
            )}

            {sender && receiverId !== null && (
                <CallModal
                    open={isCallModalOpen}
                    onClose={() => setIsCallModalOpen(false)}
                    sender={{
                        ...sender,
                        username: sender.username || 'User',
                    }}
                    receiver={{
                        id: receiverId,
                        username: sender.username || 'User',
                        avatar: sender.avatar || 'avatar.png',
                    }}
                    ws={null}
                    currentUserId={currentUserId}
                    callId={null}
                    status={"incoming"}
                />
            )}
            <AnimatePresence>
                {isAvatarOverlayOpen && (
                    <motion.div
                        key="avatarOverlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            cursor: 'pointer',
                        }}
                        onClick={() => setIsAvatarOverlayOpen(false)}
                    >
                        <img
                            src={isGroup ? groupAvatar || 'path/to/default-group-avatar.jpg' : sender?.avatar}
                            alt={isGroup ? chatName : sender?.public_key}
                            style={{
                                maxWidth: '80%',
                                maxHeight: '80%',
                                objectFit: 'contain',
                                borderRadius: '8px',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    ) : null;
}
