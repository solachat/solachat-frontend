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
import {useTranslation} from "react-i18next";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import Verified from "../core/Verified";
import {useEffect, useState} from "react";
import {fetchChatsFromServer} from "../../api/api";

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
    id: string | null;
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
    lastMessage?: MessageProps;
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


export default function ChatListItem(props: ChatListItemProps) {
    const {
        id, sender, messages, selectedChatId, setSelectedChat,
        currentUserId, chats, isGroup
    } = props;

    const selected = selectedChatId === id;
    const navigate = useNavigate();

    const [existingChat, setExistingChat] = useState<ChatProps | null>(null);
    const isFavorite = existingChat?.isFavorite || false;
    const { i18n } = useTranslation();
    const locale = i18n.language || 'en-GB';

    const lastMessage = messages.length > 0
        ? messages[messages.length - 1]
        : existingChat && Array.isArray(existingChat.messages) && existingChat.messages.length > 0
            ? existingChat.messages[existingChat.messages.length - 1]
            : props.lastMessage || null;

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



    const handleClick = async () => {
        if (!sender) {
            console.error("❌ Ошибка: Отправитель не указан!");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Ошибка: JWT-токен отсутствует!");
            return;
        }

        console.log("📌 handleClick вызван для sender.id =", sender.id);

        const recipientId = sender.id;

        const chatExists = chats.find(
            (chat: ChatProps) =>
                !chat.isGroup && chat.users.some((user: UserProps) => user.id === recipientId)
        );

        if (chatExists) {
            console.log("✅ Чат найден:", chatExists);
            setExistingChat(chatExists);
            setSelectedChat(chatExists);
            navigate(`/chat/#${recipientId}`);
            return;
        }

        const tempChat: ChatProps = {
            id: -1,
            users: [sender],
            messages: [],
            isGroup: false,
            user: sender,
        };

        console.log(`🆕 Создан временный чат с ID: ${tempChat.id} (для UI)`);

        setExistingChat(tempChat);
        setSelectedChat(tempChat);
        navigate(`/chat/#${recipientId}`);
    };

    if (!sender && !isGroup) return null;

    return (
        <React.Fragment>
            <ListItem>
                <ListItemButton
                    onClick={handleClick}
                    selected={selected}
                    sx={{
                        flexDirection: 'column',
                        alignItems: 'initial',
                        gap: { xs: 0.5, sm: 1 },
                        padding: { xs: '6px', sm: '10px' },
                        borderRadius: '2px',
                        mx: '1px',
                        '&.Mui-selected': {
                            backgroundColor: 'var(--joy-palette-primary-solidBg)',
                            color: 'white',
                            borderRadius: '2px',
                        },
                    }}
                >
                    <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
                        {isGroup ? (
                            <Avatar
                                src={existingChat?.avatar || 'path/to/default-group-avatar.jpg'}
                                alt={existingChat?.name || 'Group Chat'}
                                sx={{ width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}
                            />
                        ) : (
                            <Box sx={{ position: 'relative', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
                                <AvatarWithStatus
                                    online={sender?.online}
                                    src={sender?.avatar}
                                    alt={sender?.public_key}
                                    sx={{
                                        width: { xs: 40, sm: 56 },
                                        height: { xs: 40, sm: 56 },
                                        fontSize: { xs: 12, sm: 15 },
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
                                            width: { xs: 18, sm: 24 },
                                            height: { xs: 18, sm: 24 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <BookmarkBorderIcon sx={{ color: 'white', fontSize: { xs: 14, sm: 18 } }} />
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Box sx={{ flex: 1 }}>
                            <Typography
                                level="body-md"
                                fontSize={{ xs: 'sm', sm: 'md' }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    lineHeight: 1.3,
                                    wordBreak: 'break-word',
                                    color: selected
                                        ? 'var(--joy-palette-common-white)'
                                        : 'var(--joy-palette-text-primary)',
                                    fontWeight: 'bold',
                                }}
                            >
                                {isGroup ? existingChat?.name || 'Group Chat' : sender?.public_key || 'No Name'}
                            </Typography>

                            {lastMessage ? (
                                <Typography
                                    level="body-sm"
                                    fontSize={{ xs: 'xs', sm: '15px' }}
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: selected
                                            ? 'var(--joy-palette-common-white)'
                                            : 'var(--joy-palette-text-primary)',
                                        maxWidth: { xs: '260px', sm: '380px' },
                                        width: '100%',
                                    }}
                                >
                                    {lastMessage.attachment && isImage(lastMessage.attachment.fileName) ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={lastMessage.attachment.filePath}
                                                alt="attachment preview"
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    marginRight: '6px',
                                                    borderRadius: '2px',
                                                }}
                                            />
                                            <span>{lastMessage.content ? lastMessage.content : t('image')}</span>
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
                                    fontSize={{ xs: 'xs', sm: 'sm' }}
                                    noWrap
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {getFormattedDate(new Date(lastMessage.createdAt), locale)}
                                </Typography>

                                {unreadCount > 0 && lastMessage.userId !== currentUserId && (
                                    <Box
                                        sx={{
                                            width: { xs: 18, sm: 22 },
                                            height: { xs: 18, sm: 22 },
                                            borderRadius: '50%',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            fontSize: { xs: 12, sm: 14 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mt: 1,
                                            marginLeft: { xs: '8px', sm: '15px' },
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
