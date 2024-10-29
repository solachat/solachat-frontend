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
import { useEffect } from 'react';
import { t } from 'i18next';
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckIcon from "@mui/icons-material/Check";

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

    const lastMessage = messages[messages.length - 1] || null;

    useEffect(() => {
        if (newMessage?.type === "newMessage" && newMessage.message.chatId === Number(id)) {
            const messageData = newMessage.message;

            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.id === messageData.chatId
                        ? {
                            ...chat,
                            messages: [...chat.messages, messageData],
                            lastMessage: messageData,
                        }
                        : chat
                )
            );
        }

        if (newMessage?.type === "editMessage" && newMessage.message) {
            const updatedMessage = newMessage.message;

            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.id === updatedMessage.chatId
                        ? {
                            ...chat,
                            messages: chat.messages.map((msg) =>
                                msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                            ),
                            lastMessage: updatedMessage,
                        }
                        : chat
                )
            );
        }

        if (newMessage?.type === "deleteMessage" && "messageId" in newMessage) {
            const { messageId, chatId } = newMessage;

            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.id === chatId
                        ? {
                            ...chat,
                            messages: chat.messages.filter((msg) => msg.id !== messageId),
                        }
                        : chat
                )
            );
        }

        if (newMessage?.type === "messageRead" && "messageId" in newMessage) {
            const { messageId } = newMessage;

            setChats((prevChats) =>
                prevChats.map((chat) => ({
                    ...chat,
                    messages: chat.messages.map((msg) =>
                        msg.id === messageId ? { ...msg, isRead: true } : msg
                    ),

                    lastMessage: chat.messages[chat.messages.length - 1]?.id === messageId
                        ? { ...chat.messages[chat.messages.length - 1], isRead: true }
                        : chat.lastMessage,
                }))
            );
        }
    }, [newMessage, id, setChats]);


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
                            <AvatarWithStatus
                                online={sender?.online}
                                src={sender?.avatar}
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
                                    alignItems: 'center',
                                }}
                            >
                                <Typography
                                    level="body-xs"
                                    noWrap
                                    sx={{
                                        textAlign: { xs: 'left', sm: 'right' },
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginLeft: 0,
                                    }}
                                >
                                    {lastMessage.isRead ? (
                                        <>
                                            <DoneAllIcon sx={{ fontSize: 15, marginRight: 0.5 }} />
                                        </>
                                    ) : (
                                        <CheckIcon sx={{ fontSize: 15, marginRight: 0.5 }} />
                                    )}

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
