import * as React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import AvatarWithStatus from './AvatarWithStatus';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import { createPrivateChat } from '../../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/joy/Avatar';
import { useEffect, useState } from 'react';
import {t} from "i18next";

type ChatListItemProps = {
    id: string;
    unread?: boolean;
    sender?: UserProps;
    messages: MessageProps[];
    selectedChatId?: string;
    setSelectedChat: (chat: ChatProps) => void;
    currentUserId: number;
    chats: ChatProps[];
    isGroup?: boolean;
    newMessage?: MessageProps;
};

const isImage = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(fileExtension || '');
};

const isVideo = (fileName: string) => {
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(fileExtension || '');
};

const fixFilePath = (filePath: string) => {
    return filePath.replace(/\\/g, '/');
};

export default function ChatListItem(props: ChatListItemProps) {
    const { id, sender, messages, selectedChatId, setSelectedChat, currentUserId, chats, isGroup, newMessage } = props;
    const [localMessages, setLocalMessages] = useState<MessageProps[]>(messages);
    const selected = selectedChatId === id;

    const hasMessages = Array.isArray(localMessages) && localMessages.length > 0;
    const lastMessage = hasMessages ? localMessages[localMessages.length - 1] : null;
    const navigate = useNavigate();

    useEffect(() => {
        if (newMessage && newMessage.chatId === Number(id)) {
            setLocalMessages((prevMessages) => [...prevMessages, newMessage]);
        }
    }, [newMessage, id]);

    const existingChat = Array.isArray(chats)
        ? chats.find((chat: ChatProps) => chat.id === Number(id))
        : null;

    const handleClick = async () => {
        if (existingChat) {
            setSelectedChat(existingChat);
            navigate(isGroup ? `/chat/#-${existingChat.id}` : `/chat/#${existingChat.id}`);
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
                        padding: { xs: '8px' },
                    }}
                >
                    <Stack direction="row" spacing={1.5}>
                        {isGroup ? (
                            <Avatar
                                src={existingChat?.avatar ? existingChat.avatar : 'path/to/default-group-avatar.jpg'}
                                alt={existingChat?.name || 'Group Chat'}
                                sx={{ width: { xs: 32, sm: 48 }, height: { xs: 32, sm: 48 } }}
                            />
                        ) : (
                            <AvatarWithStatus
                                online={sender?.online}
                                src={sender?.avatar || undefined}
                                alt={sender?.realname}
                                sx={{ width: { xs: 32, sm: 48 }, height: { xs: 32, sm: 48 }, fontSize: { xs: 16, sm: 24 } }}
                            >
                                {(!sender?.avatar && sender?.realname) ? sender.realname[0].toUpperCase() : null}
                            </AvatarWithStatus>
                        )}

                        <Box sx={{ flex: 1 }}>
                            <Typography level="body-md" fontSize={{ xs: 'sm', sm: 'md' }}>
                                {isGroup ? existingChat?.name || 'Group Chat' : `${sender?.realname || 'No Name'} (${sender?.username || 'No Username'})`}
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
                                        whiteSpace: 'nowrap',
                                        color: 'text.secondary',
                                        marginTop: '3px',
                                        maxWidth: { xs: '300px', sm: '350px' },
                                        width: '100%',
                                    }}
                                >
                                    {lastMessage.attachment && isImage(lastMessage.attachment.fileName) ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={`http://localhost:4000/${fixFilePath(lastMessage.attachment.filePath)}`}
                                                alt="attachment preview"
                                                style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                            />
                                            <span>{t('image')}</span>
                                        </Box>
                                    ) : lastMessage.attachment && isVideo(lastMessage.attachment.fileName) ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={`http://localhost:4000/${fixFilePath(lastMessage.attachment.filePath.replace('.mp4', '-thumbnail.jpg'))}`}
                                                alt="video preview"
                                                style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                            />
                                            <span>{lastMessage.attachment.fileName}</span>
                                        </Box>
                                    ) : lastMessage.attachment ? (
                                        <i>{lastMessage.attachment.fileName}</i>
                                    ) : (
                                        lastMessage.content
                                    )}
                                </Typography>
                            )}
                            {!hasMessages && (
                                <Typography level="body-sm">{t('No messages')}</Typography>
                            )}
                        </Box>
                        {hasMessages && lastMessage && (
                            <Box sx={{ lineHeight: 1.5, textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                {lastMessage.unread && (
                                    <CircleIcon sx={{ fontSize: 12 }} color="primary" />
                                )}
                                <Typography
                                    level="body-xs"
                                    display={{ xs: 'none', md: 'block' }}
                                    noWrap
                                >
                                    {new Date(lastMessage.createdAt).toLocaleTimeString('en-GB', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
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
