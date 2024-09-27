import * as React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { ListItemButtonProps } from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import AvatarWithStatus from './AvatarWithStatus';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import { createPrivateChat } from '../../api/api';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

type ChatListItemProps = ListItemButtonProps & {
    id: string;
    unread?: boolean;
    sender?: UserProps;
    messages: MessageProps[];
    selectedChatId?: string;
    setSelectedChat: (chat: ChatProps) => void;
    currentUserId: number;
    chats: ChatProps[];
    isGroup?: boolean;
};

export default function ChatListItem(props: ChatListItemProps) {
    const { id, sender, messages, selectedChatId, setSelectedChat, currentUserId, chats, isGroup } = props;
    const selected = selectedChatId === id;
    const hasMessages = Array.isArray(messages) && messages.length > 0;
    const lastMessage = hasMessages ? messages[messages.length - 1] : null;
    const navigate = useNavigate();

    const existingChat = Array.isArray(chats)
        ? chats.find((chat: ChatProps) => chat.id === Number(id))
        : null;

    const handleClick = async () => {
        if (existingChat) {
            setSelectedChat(existingChat);
            navigate(`/chat/#${existingChat.id}`);
        } else if (sender) {
            const token = localStorage.getItem('token');
            const newChat = await createPrivateChat(currentUserId, sender.id, token || '');
            if (newChat) {
                toast.success('Chat created successfully!');
                setSelectedChat({ ...newChat, users: [sender, { id: currentUserId }] });
                navigate(`/chat/#${newChat.id}`);
            } else {
                toast.error('Failed to create chat.');
            }
        }
    };

    if (!sender && !isGroup) {
        return null;
    }

    return (
        <React.Fragment>
            <ListItem>
                <ListItemButton
                    onClick={handleClick}
                    selected={selected}
                    color="neutral"
                    sx={{
                        flexDirection: 'column',
                        alignItems: 'initial',
                        gap: 1,
                    }}
                >
                    <Stack direction="row" spacing={1.5}>
                        {isGroup ? (
                            <AvatarWithStatus
                                online={!isGroup && sender?.online}
                                src={isGroup ? existingChat?.groupAvatar || 'path/to/default-group-avatar.jpg' : sender?.avatar}
                                sx={{
                                    width: { xs: 32, sm: 48 },
                                    height: { xs: 32, sm: 48 },
                                }}
                            />
                        ) : (
                            <AvatarWithStatus
                                online={sender?.online}
                                src={sender?.avatar}
                                sx={{
                                    width: { xs: 32, sm: 48 },
                                    height: { xs: 32, sm: 48 },
                                }}
                            />
                        )}

                        <Box sx={{ flex: 1 }}>
                            <Typography level="body-md" fontSize={{ xs: 'sm', sm: 'md' }}>
                                {isGroup ? (
                                    existingChat?.name || 'Group Chat'
                                ) : (
                                    `${sender?.realname || 'No Name'} (${sender?.username || 'No Username'})`
                                )}
                            </Typography>
                            {hasMessages && lastMessage && (
                                <Typography
                                    level="body-sm"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: 'text.secondary',
                                        marginTop: '3px',
                                    }}
                                >
                                    {lastMessage.attachment ? (
                                        <i>{lastMessage.attachment.fileName}</i>
                                    ) : (
                                        lastMessage.content
                                    )}
                                </Typography>
                            )}
                        </Box>
                        {hasMessages && lastMessage && (
                            <Box
                                sx={{
                                    lineHeight: 1.5,
                                    textAlign: 'right',
                                }}
                            >
                                {lastMessage.unread && (
                                    <CircleIcon sx={{ fontSize: 12 }} color="primary" />
                                )}
                                <Typography
                                    level="body-xs"
                                    display={{ xs: 'none', md: 'block' }}
                                    noWrap
                                >
                                    {formatDate(lastMessage.createdAt) || 'No Timestamp'}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </ListItemButton>
            </ListItem>
            <ListDivider sx={{ margin: 0 }} />
        </React.Fragment>
    );
}
