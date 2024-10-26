import * as React from 'react';
import Box from '@mui/joy/Box';
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
import { useEffect, useCallback, useMemo } from 'react';
import { t } from 'i18next';

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

const fixFilePath = (filePath: string) => filePath.replace(/\\/g, '/');

export default function ChatListItem(props: ChatListItemProps) {
    const {
        id, sender, messages, selectedChatId, setSelectedChat,
        currentUserId, chats, isGroup, newMessage, setChats,
    } = props;

    const selected = selectedChatId === id;
    const navigate = useNavigate();

    // Находим существующий чат по ID
    const existingChat = chats.find((chat: ChatProps) => chat.id === Number(id));

    // Используем useMemo для кэширования lastMessage и уменьшения вычислений
    const lastMessage = useMemo(() => messages[messages.length - 1] || null, [messages]);

    // Обновление чатов с помощью useCallback для уменьшения ререндеров
    const updateChatsWithNewMessage = useCallback(() => {
        setChats((prevChats) => prevChats.map((chat) => {
            if (chat.id === newMessage?.chatId) {
                return { ...chat, lastMessage: newMessage };
            }
            return chat;
        }));
    }, [newMessage, setChats]);

    // Обновляем чат при поступлении нового сообщения
    useEffect(() => {
        if (newMessage && newMessage.chatId === Number(id)) {
            updateChatsWithNewMessage();
        }
    }, [newMessage, id, updateChatsWithNewMessage]);

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
                                sx={{ width: { xs: 48, sm: 48 }, height: { xs: 48, sm: 48 } }}
                            />
                        ) : (
                            <AvatarWithStatus
                                online={sender?.online}
                                src={sender?.avatar || undefined}
                                alt={sender?.realname}
                                sx={{ width: { xs: 48, sm: 48 }, height: { xs: 48, sm: 48 }, fontSize: { xs: 16, sm: 24 } }}
                            >
                                {(!sender?.avatar && sender?.realname) ? sender.realname[0].toUpperCase() : null}
                            </AvatarWithStatus>
                        )}

                        <Box sx={{ flex: 1 }}>
                            <Typography level="body-md" fontSize={{ xs: 'sm', sm: 'md' }}>
                                {isGroup ? existingChat?.name || 'Group Chat' : `${sender?.realname || 'No Name'} (${sender?.username || 'No Username'})`}
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
                                        marginTop: '3px',
                                        maxWidth: { xs: '290px', sm: '350px' },
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
                            ) : (
                                <Typography level="body-sm">{t('No messages')}</Typography>
                            )}
                        </Box>
                        {lastMessage && (
                            <Box
                                sx={{
                                    lineHeight: 1.5,
                                    textAlign: { xs: 'left', sm: 'right' },
                                    display: { xs: 'flex', sm: 'block' },
                                    justifyContent: { xs: 'flex-start' },
                                    mt: { xs: 1, sm: 0 },
                                }}
                            >
                                {lastMessage.unread && (
                                    <CircleIcon sx={{ fontSize: 12 }} color="primary" />
                                )}
                                <Typography
                                    level="body-xs"
                                    noWrap
                                    sx={{
                                        textAlign: { xs: 'left', sm: 'right' }, // Выравнивание текста
                                    }}
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
        </React.Fragment>
    );
}
