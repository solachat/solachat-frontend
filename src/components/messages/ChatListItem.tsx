import * as React from 'react';
import Box from '@mui/joy/Box';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from './AvatarWithStatus';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/joy/Avatar';
import { t } from 'i18next';
import {useTranslation} from "react-i18next";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useState} from "react";
import {motion} from "framer-motion";

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

const isImage = (fileName: string): boolean => {
    if (!fileName || typeof fileName !== "string") return false;

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const parts = fileName.toLowerCase().split('.');
    const fileExtension = parts.length > 1 ? parts.pop() : '';

    return fileExtension ? imageExtensions.includes(fileExtension) : false;
};


const isVideo = (fileName?: string): boolean => {
    if (!fileName || typeof fileName !== 'string') return false;

    const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return !!fileExtension && videoExtensions.includes(fileExtension);
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
                    component={motion.div}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleClick}
                    selected={selected}
                    sx={{
                        flexDirection: 'column',
                        alignItems: 'initial',
                        gap: { xs: 0.5, sm: 1 },
                        padding: { xs: '8px', sm: '12px' },
                        borderRadius: 'lg',
                        mx: '4px',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(0, 168, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        '&.Mui-selected': {
                            background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(0, 168, 255, 0.3)',
                            border: '1px solid rgba(0, 168, 255, 0.5)',
                        },
                        '&:hover': {
                            bgcolor: 'rgba(0, 168, 255, 0.1)',
                        },
                    }}
                >
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                        {isGroup ? (
                            <Avatar
                                src={existingChat?.avatar || '/default-group-avatar.png'}
                                alt={existingChat?.name || 'Group Chat'}
                                sx={{
                                    width: { xs: 40, sm: 56 },
                                    height: { xs: 40, sm: 56 },
                                    border: '2px solid rgba(0, 168, 255, 0.3)'
                                }}
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
                                        border: '2px solid rgba(0, 168, 255, 0.3)',
                                        bgcolor: 'rgba(0, 168, 255, 0.1)',
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
                                            bgcolor: '#007bff',
                                            borderRadius: '50%',
                                            width: { xs: 18, sm: 24 },
                                            height: { xs: 18, sm: 24 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(0, 168, 255, 0.3)',
                                        }}
                                    >
                                        <BookmarkBorderIcon sx={{
                                            color: 'white',
                                            fontSize: { xs: 14, sm: 18 }
                                        }} />
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                level="body-md"
                                fontSize={{ xs: 'sm', sm: 'md' }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    lineHeight: 1.3,
                                    wordBreak: 'break-word',
                                    color: selected ? 'white' : '#a0d4ff',
                                    fontWeight: 'bold',
                                    textShadow: selected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
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
                                        color: selected ? 'white' : '#8ab4f8',
                                        maxWidth: { xs: '260px', sm: '380px' },
                                        width: '100%',
                                        mt: 0.5,
                                    }}
                                >
                                    {lastMessage.attachment && lastMessage.attachment.length > 0 ? (
                                        (() => {
                                            const firstAttachment = lastMessage.attachment[0];
                                            if (isImage(firstAttachment.fileName)) {
                                                return (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <img
                                                            src={firstAttachment.filePath}
                                                            alt="attachment preview"
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                marginRight: '8px',
                                                                borderRadius: '4px',
                                                                border: '1px solid rgba(0, 168, 255, 0.3)',
                                                            }}
                                                        />
                                                        <span>{lastMessage.content ? lastMessage.content : t('image')}</span>
                                                    </Box>
                                                );
                                            } else if (isVideo(firstAttachment.fileName)) {
                                                return (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <span>{firstAttachment.fileName}</span>
                                                    </Box>
                                                );
                                            } else {
                                                return <i>{firstAttachment.fileName}</i>;
                                            }
                                        })()
                                    ) : (
                                        lastMessage.content
                                    )}
                                </Typography>
                            ) : (
                                <Typography level="body-sm" sx={{ color: '#8ab4f8' }}>
                                    {t('No messages')}
                                </Typography>
                            )}
                        </Box>

                        {lastMessage && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    minWidth: '60px',
                                }}
                            >
                                <Typography
                                    level="body-xs"
                                    fontSize={{ xs: 'xs', sm: 'sm' }}
                                    noWrap
                                    sx={{
                                        color: selected ? 'white' : '#8ab4f8',
                                        opacity: 0.8,
                                    }}
                                >
                                    {getFormattedDate(new Date(lastMessage.createdAt), locale)}
                                </Typography>

                                {unreadCount > 0 && lastMessage.userId !== currentUserId && (
                                    <Box
                                        sx={{
                                            width: { xs: 20, sm: 24 },
                                            height: { xs: 20, sm: 24 },
                                            borderRadius: '50%',
                                            bgcolor: '#007bff',
                                            color: 'white',
                                            fontSize: { xs: 12, sm: 14 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mt: 1,
                                            boxShadow: '0 2px 8px rgba(0, 168, 255, 0.3)',
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
