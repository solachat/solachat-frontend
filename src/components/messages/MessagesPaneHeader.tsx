import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import { UserProps } from '../core/types';
import { toggleMessagesPane } from '../../utils/utils';
import { useTranslation } from 'react-i18next';
import MessagesMenu from './MessagesMenu';
import GroupInfoModal from '../group/GroupInfoModal';
import CallModal from './CallModal';
import {jwtDecode} from 'jwt-decode';

type MessagesPaneHeaderProps = {
    sender?: UserProps;
    chatId: number;
    isGroup?: boolean;
    chatName?: string;
    groupAvatar?: string;
    members?: UserProps[];
};

export default function MessagesPaneHeader({
                                               sender,
                                               chatId,
                                               isGroup,
                                               chatName,
                                               groupAvatar,
                                               members = [],
                                           }: MessagesPaneHeaderProps) {
    const { t } = useTranslation();
    const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = React.useState(false);
    const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
    const [ws, setWs] = React.useState<WebSocket | null>(null);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: { id: number } = jwtDecode(token);
            setCurrentUserId(decodedToken.id);
        }

        const websocket = new WebSocket('ws://localhost:4005/ws');
        websocket.onopen = () => console.log('WebSocket connected');
        websocket.onclose = () => console.log('WebSocket disconnected');
        websocket.onerror = (error) => console.error('WebSocket error:', error);

        setWs(websocket);

        return () => websocket.close();
    }, []);


    const receiverId = !isGroup && sender && currentUserId !== null && sender.id !== currentUserId
        ? sender.id
        : null;

    const handleAvatarClick = () => {
        if (isGroup) {
            setIsGroupModalOpen(true);
        } else if (sender?.username) {
            window.location.href = `/account?username=${sender.username}`;
        }
    };

    return sender ? (
        <>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    py: { xs: 2, md: 2 },
                    px: { xs: 1, md: 2 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.body',
                }}
            >
                <Stack direction="row" spacing={{ xs: 1, md: 2 }} sx={{ alignItems: 'center' }}>
                    <IconButton
                        variant="plain"
                        color="neutral"
                        size="sm"
                        sx={{
                            display: { xs: 'inline-flex', sm: 'none' },
                        }}
                        onClick={toggleMessagesPane}
                    >
                        <ArrowBackIosNewRoundedIcon />
                    </IconButton>

                    <Avatar
                        size="lg"
                        src={isGroup ? groupAvatar || 'path/to/default-group-avatar.jpg' : sender?.avatar}
                        alt={isGroup ? chatName : sender?.realname}
                        onClick={handleAvatarClick}
                        sx={{ cursor: 'pointer' }}
                    />

                    <div>
                        <Typography
                            fontWeight="lg"
                            fontSize="lg"
                            component="h2"
                            noWrap
                            endDecorator={
                                !isGroup && sender?.online ? (
                                    <Chip
                                        variant="outlined"
                                        size="sm"
                                        color="neutral"
                                        sx={{ borderRadius: 'sm' }}
                                        startDecorator={<CircleIcon sx={{ fontSize: 8 }} color="success" />}
                                    >
                                        Online
                                    </Chip>
                                ) : undefined
                            }
                            sx={{ fontWeight: 'lg', fontSize: 'lg', cursor: 'pointer' }}
                            onClick={handleAvatarClick}
                        >
                            {isGroup ? chatName : sender?.realname}
                        </Typography>

                        {isGroup && (
                            <Typography level="body-sm">
                                {members.length} {members.length === 1 ? 'member' : 'members'}
                            </Typography>
                        )}
                        {!isGroup && <Typography level="body-sm">{sender?.username}</Typography>}
                    </div>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    {receiverId && (
                        <IconButton size="sm" onClick={() => setIsCallModalOpen(true)}>
                            <PhoneInTalkRoundedIcon />
                        </IconButton>
                    )}

                    <MessagesMenu chatId={chatId} token={localStorage.getItem('token') || ''} onDeleteChat={() => console.log('Chat deleted')} />
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

            {sender && ws && receiverId && (
                <CallModal
                    open={isCallModalOpen}
                    onClose={() => setIsCallModalOpen(false)}
                    sender={sender}
                    receiverId={receiverId}
                    isGroup={isGroup}
                    ws={ws}
                    currentUserId={currentUserId}
                />
            )}
        </>
    ) : null;
}
