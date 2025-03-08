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
        const diff = currentTime - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (diff < 60000) return t("just_now");
        if (minutes < 60) return t("minutes_ago", { count: minutes });
        if (hours < 24) return t("hours_ago", { count: hours });

        return new Date(timestamp).toLocaleDateString(i18n.language, {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };


    return isGroup || sender ? (
        <>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    py: { xs: 2, md: 1 },
                    px: { xs: 2, md: 1 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.body',
                }}
            >
                <Stack
                    direction="row"
                    spacing={{ xs: 1, md: 1 }}
                    sx={{
                        alignItems: 'center',
                        width: { xs: '100%', sm: 'auto' },
                        maxWidth: { xs: '85%', sm: '100%' },
                        overflow: 'hidden',
                    }}
                >
                    <IconButton
                        variant="plain"
                        color="neutral"
                        size="sm"
                        sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                        onClick={onBack}
                    >
                        <ArrowBackIosNewRoundedIcon />
                    </IconButton>

                    <Avatar
                        size="lg"
                        src={isGroup ? groupAvatar || 'path/to/default-group-avatar.jpg' : sender?.avatar}
                        alt={isGroup ? chatName : sender?.public_key}
                        onClick={handleAvatarClick}
                        sx={{ cursor: 'pointer' }}
                    />

                    <div style={{ width: '100%' }}>
                        <Typography
                            fontWeight="lg"
                            fontSize={{ xs: 'md', md: 'lg' }}
                            component="h2"
                            noWrap
                            sx={{
                                fontWeight: 'lg',
                                fontSize: 'lg',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                            onClick={handleAvatarClick}
                        >
                            {isGroup ? chatName : sender?.public_key}
                            {sender?.verified && <Verified sx={{ ml: 1 }} />}
                        </Typography>

                        <Typography level="body-sm" color={sender?.online ? "primary" : "neutral"}>
                            {sender?.online
                                ? t("online")
                                : sender?.lastOnline
                                    ? t("last_seen", { time: formatTimeAgo(new Date(sender.lastOnline).getTime()) })
                                    : t("offline")}
                        </Typography>

                        {isGroup && (
                            <Typography level="body-sm">
                                {members.length} {getMemberLabel(members.length, i18n.language)}
                            </Typography>
                        )}
                    </div>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ position: 'relative' }}>
                    {/* Кнопка с иконкой троеточия */}
                    <IconButton
                        onClick={() => setIsOpen(prev => !prev)}
                        aria-label="Toggle menu"
                        sx={{
                            borderRadius: "50%",
                            backgroundColor: isOpen ? "rgba(255, 255, 255, 0.2)" : "transparent",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                            },
                        }}
                    >
                        <MoreVertRoundedIcon />
                    </IconButton>

                    <Box
                        sx={{
                            position: "absolute",
                            top: "60px",
                            right: 0,
                            mt: 0,
                            width: "auto",
                            zIndex: 9,
                            borderRadius: "12px",
                            boxShadow: "4px 4px 20px rgba(0, 0, 0, 0.5)",
                            maxHeight: isOpen ? "400px" : "0px",
                            opacity: isOpen ? 1 : 0,
                            overflow: "hidden",
                            transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
                            ml: 2,
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

        </>
    ) : null;
}
