import * as React from 'react';
import Box from '@mui/joy/Box';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from './AvatarWithStatus';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import { createPrivateChat } from '../../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/joy/Avatar';
import { t } from 'i18next';
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckIcon from "@mui/icons-material/Check";
import {useTranslation} from "react-i18next";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import Verified from "../core/Verified";
import Divider from "@mui/joy/Divider";

type NewMessageEvent =
    | {
    type: "newMessage";
    message: MessageProps;
}
    | {
    type: "editMessage";
    message: MessageProps;
}
    | {
    type: "deleteMessage";
    messageId: number;
    chatId: number;
}
    | {
    type: "messageRead";
    messageId: number;
};

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
    newMessage?: NewMessageEvent;
    setChats: React.Dispatch<React.SetStateAction<ChatProps[]>>;
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

const fixFilePath = (filePath: string) => filePath.replace(/\\/g, '/').replace(/\.enc$/, '');

export default function ChatListItem(props: ChatListItemProps) {
    const {
        id, sender, messages, selectedChatId, setSelectedChat,
        currentUserId, chats, isGroup, newMessage, setChats,
    } = props;

    const selected = selectedChatId === id;
    const navigate = useNavigate();

    const existingChat = chats.find((chat: ChatProps) => chat.id === Number(id));
    const isFavorite = existingChat?.isFavorite || false;

    const lastMessage = messages[messages.length - 1] || null;


    const unreadMessages = messages.filter(
        (msg) => msg.userId !== currentUserId && !msg.isRead
    );
    const unreadCount = unreadMessages.length;

    const getFormattedDate = (date: Date, locale: string = 'en-GB') => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);


        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);

        const weekdayAbbreviations: Record<string, Record<string, string>> = {
            'ru': {
                Monday: 'Пн',
                Tuesday: 'Вт',
                Wednesday: 'Ср',
                Thursday: 'Чт',
                Friday: 'Пт',
                Saturday: 'Сб',
                Sunday: 'Вс',
            },
            'en': {
                Monday: 'Mon',
                Tuesday: 'Tue',
                Wednesday: 'Wed',
                Thursday: 'Thu',
                Friday: 'Fri',
                Saturday: 'Sat',
                Sunday: 'Sun',
            },
        };

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
            });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return locale === 'ru' ? 'Вчера' : 'Yesterday';
        } else if (date >= startOfWeek) {
            const weekdayInEnglish = date.toLocaleDateString('en', { weekday: 'long' });
            const abbreviation = weekdayAbbreviations[locale]?.[weekdayInEnglish] || weekdayInEnglish;
            return abbreviation;
        } else {
            return date.toLocaleDateString(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).replace(/\//g, '.').replace(/-/g, '.');
        }
    };


    const { i18n } = useTranslation();
    const locale = i18n.language || 'en-GB';

    const handleClick = async () => {
        if (existingChat) {
            setSelectedChat(existingChat);
            navigate(isGroup ? `/chat/#-${existingChat.id}` : `/chat/#${existingChat.id}`);
        } else if (sender) {
            const token = localStorage.getItem('token');
            const newChat = await createPrivateChat(currentUserId, sender.id, token || '');
            if (newChat) {
                setSelectedChat({ ...newChat, users: [sender, { id: currentUserId }] });
                navigate(`/chat/#${newChat.id}`);
            } else {
                toast.error('Failed to create chat.');
            }
        }
    };

    if (!sender && !isGroup) return null;

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
                                src={existingChat?.avatar || 'path/to/default-group-avatar.jpg'}
                                alt={existingChat?.name || 'Group Chat'}
                                sx={{ width: { xs: 48, sm: 48 }, height: { xs: 48, sm: 48 } }}
                            />
                        ) : (
                            <Box sx={{ position: 'relative', width: 48, height: 48 }}>
                                <AvatarWithStatus
                                    online={sender?.online}
                                    src={sender?.avatar}
                                    alt={sender?.public_key}
                                    sx={{
                                        width: { xs: 48, sm: 48 },
                                        height: { xs: 48, sm: 48 },
                                        fontSize: { xs: 16, sm: 24 },
                                    }}
                                >
                                    {(!sender?.avatar && sender?.public_key)
                                        ? sender.public_key[0].toUpperCase()
                                        : null}
                                </AvatarWithStatus>
                                {isFavorite && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: -2,
                                            right: -2,
                                            backgroundColor: '#007bff',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <BookmarkBorderIcon sx={{ color: 'white', fontSize: 16 }} />
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Box sx={{ flex: 1 }}>
                            <Typography
                                level="body-md"
                                fontSize={{ xs: 'xs', sm: 'sm' }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 0.3,
                                    lineHeight: 1.2,
                                    wordBreak: 'break-word',
                                }}
                            >
                                {isGroup ? (
                                    existingChat?.name || 'Group Chat'
                                ) : (
                                    <>
                                        {sender?.public_key || 'No Name'}
                                        {sender?.verified && (
                                            <Verified sx={{ fontSize: 14, verticalAlign: 'middle', ml: 0.5 }} />
                                        )}
                                    </>
                                )}
                            </Typography>
                            {lastMessage ? (
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
                                        marginTop: '7px',
                                        maxWidth: { xs: '290px', sm: '350px' },
                                        width: '100%',
                                    }}
                                >
                                    {lastMessage.attachment && isImage(lastMessage.attachment.fileName) ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={`${fixFilePath(lastMessage.attachment.filePath)}`}
                                                alt="attachment preview"
                                                style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                            />
                                            <span>{t('image')}</span>
                                        </Box>
                                    ) : lastMessage.attachment && isVideo(lastMessage.attachment.fileName) ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <span>{lastMessage.attachment.fileName}</span>
                                        </Box>
                                    ) : lastMessage.attachment ? (
                                        <i>{lastMessage.attachment.fileName}</i>
                                    ) : (
                                        lastMessage.content
                                    )}
                                </Typography>
                            ) : (
                                <Typography level="body-sm">{t('No messages')}</Typography>
                            )}
                        </Box>
                        {lastMessage && (
                            <Box
                                sx={{
                                    lineHeight: 1.5,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                }}
                            >
                                <Typography
                                    level="body-xs"
                                    noWrap
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {lastMessage.userId === currentUserId ? (
                                        lastMessage.isRead ? (
                                            <DoneAllIcon sx={{ fontSize: 15, mr: 0.5 }} />
                                        ) : (
                                            <CheckIcon sx={{ fontSize: 15, mr: 0.5 }} />
                                        )
                                    ) : null}
                                    {getFormattedDate(new Date(lastMessage.createdAt), locale)}
                                </Typography>

                                {unreadCount > 0 && lastMessage.userId !== currentUserId && (
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            backgroundColor: 'black',
                                            color: 'white',
                                            fontSize: 12,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mt: 1,
                                            ml: 0.3,
                                        }}
                                    >
                                        {unreadCount}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Stack>
                </ListItemButton>
            </ListItem>
        </React.Fragment>
    );
}
