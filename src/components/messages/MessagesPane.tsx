import * as React from 'react';
import Box from '@mui/joy/Box';
import { useParams } from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessagesPaneHeader from './MessagesPaneHeader';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../api/useWebSocket';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import { updateMessageStatus } from '../../api/api';

type MessagesPaneProps = {
    chat: ChatProps | null;
    members?: UserProps[];
    chats: ChatProps[];
    setSelectedChat: (chat: ChatProps | null) => void;
};

export default function MessagesPane({ chat, chats, members = [], setSelectedChat }: MessagesPaneProps) {
    const { t } = useTranslation();
    const [chatIdFromUrl, setChatIdFromUrl] = useState<string | undefined>();

    const [chatMessages, setChatMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [textAreaValue, setTextAreaValue] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [isFarFromBottom, setIsFarFromBottom] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const chatIdRef = useRef<number | null>(null);
    const { chatId } = useParams<{ chatId: string }>();
    const [userStatuses, setUserStatuses] = React.useState<Record<string, Pick<UserProps, 'online' | 'lastOnline'>>>({});

    const scrollToBottom = (smooth: boolean = true) => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    const markMessagesAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authorization token is missing');

            const decodedToken: { id: number } = jwtDecode(token);
            const currentUserId = decodedToken.id;

            const messageIds = chatMessages
                .filter(msg => !msg.isRead && msg.userId !== currentUserId)
                .map(msg => msg.id);

            if (messageIds.length > 0) {
                await Promise.all(messageIds.map(id =>
                    updateMessageStatus(Number(id), { isRead: true }, token)
                ));

                setChatMessages(prevMessages =>
                    prevMessages.map(msg =>
                        messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
                    )
                );
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    useEffect(() => {
        markMessagesAsRead();
    }, [chatMessages]);


    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container) {
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
            setIsFarFromBottom(!isNearBottom);

            if (isNearBottom) {
                markMessagesAsRead();
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: { id: number } = jwtDecode(token);
            setCurrentUserId(decodedToken.id);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const chatMessagesRef = useRef<MessageProps[]>(chat?.messages || []);

    const findChatById = (id: string | undefined) => {
        return chats.find((chat) => chat.id === Number(id)) || null;
    };

    useEffect(() => {
        const updateChatIdFromHash = () => {
            let hash = window.location.hash.slice(1);

            if (hash.startsWith('-')) {
                hash = hash.slice(1);
            }

            setChatIdFromUrl(hash || undefined);
        };

        updateChatIdFromHash();
        window.addEventListener('hashchange', updateChatIdFromHash);

        return () => window.removeEventListener('hashchange', updateChatIdFromHash);
    }, []);


    useEffect(() => {
        if (chatIdFromUrl) {
            const chatFromUrl = findChatById(chatIdFromUrl);
            if (chatFromUrl) {
                setSelectedChat(chatFromUrl);
            }
        } else {
            setSelectedChat(null);
        }
    }, [chatIdFromUrl, chats, setSelectedChat]);

    useEffect(() => {
        if (chat && chat.id !== chatIdRef.current) {
            chatIdRef.current = chat.id;
            chatMessagesRef.current = chat.messages || [];
            setChatMessages(chatMessagesRef.current);
            scrollToBottom(false);
        } else if (!chat) {
            chatMessagesRef.current = [];
            setChatMessages([]);
            chatIdRef.current = null;
        }
    }, [chat]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleEditMessageInList = (updatedMessage: MessageProps) => {
        setChatMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === updatedMessage.id
                    ? {
                        ...msg,
                        content: updatedMessage.content,
                        isEdited: updatedMessage.isEdited,
                    }
                    : msg
            )
        );
    };

    const handleDeleteMessageInList = (messageId: number) => {
        setChatMessages((prevMessages) => prevMessages.filter((msg) => Number(msg.id) !== messageId));
    };

    useWebSocket((data) => {
        if (data.type === 'newMessage' && data.message) {
            const newMessage = data.message;
            if (newMessage.chatId === chatIdRef.current) {
                setChatMessages((prevMessages) => {
                    if (!prevMessages.some((msg) => msg.id === newMessage.id)) {
                        return [...prevMessages, newMessage];
                    }
                    return prevMessages;
                });
            }
        } else if (data.type === 'editMessage' && data.message) {
            const updatedMessage = data.message;
            if (updatedMessage.chatId === chatIdRef.current) {
                handleEditMessageInList(updatedMessage);
            }
        } else if (data.type === 'deleteMessage') {
            const { messageId, chatId } = data;
            if (chatId === chatIdRef.current) {
                handleDeleteMessageInList(messageId);
            }
        }
        if (data.type === 'messageRead' && data.messageId) {
            setChatMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === data.messageId ? { ...msg, isRead: true } : msg
                )
            );
        }
        if (data.type === 'USER_CONNECTED' && data.publicKey) {
            setUserStatuses((prevStatuses) => ({
                ...prevStatuses,
                [data.publicKey]: { online: true, lastOnline: null },
            }));
        } else if (data.type === 'USER_DISCONNECTED' && data.publicKey) {
            setUserStatuses((prevStatuses) => ({
                ...prevStatuses,
                [data.publicKey]: { online: false, lastOnline: data.lastOnline },
            }));
        }
    }, [currentUserId, chatIdRef]);

    const handleEditMessage = (messageId: number, content: string) => {
        setEditingMessageId(messageId);
        setTextAreaValue(content);
    };

    const interlocutor = React.useMemo(() => {
        if (!chat?.isGroup) {
            // Находим собеседника по БД
            const userFromDb = chat?.users?.find((user) => user.id !== currentUserId);
            if (userFromDb) {
                // Если для пользователя есть статус из вебсокета, объединяем данные
                return {
                    ...userFromDb,
                    online: userFromDb.public_key && userStatuses[userFromDb.public_key]
                        ? userStatuses[userFromDb.public_key].online
                        : userFromDb.online ?? false,
                    lastOnline: userFromDb.public_key && userStatuses[userFromDb.public_key]
                        ? userStatuses[userFromDb.public_key].lastOnline
                        : userFromDb.lastOnline,
                };
            }
        }
        return undefined;
    }, [chat, currentUserId, userStatuses]);


    return (
        <Sheet
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.level1',
                overflow: 'hidden',
            }}
        >
            {chat?.id && (
                <MessagesPaneHeader
                    sender={interlocutor}
                    chatId={chat.id}
                    isGroup={chat.isGroup}
                    chatName={chat.isGroup ? chat.name : undefined}
                    groupAvatar={chat.isGroup ? chat.avatar || 'path/to/default-group-avatar.jpg' : undefined}
                    members={chat?.users || []}
                    onBack={() => setSelectedChat(null)}
                />
            )}

            <Box
                ref={messagesContainerRef}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    px: 2,
                    py: { xs: 2, sm: 3 },
                    overflowY: 'auto',
                    alignItems: 'center',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '4px',
                    },
                }}
            >

                {chatMessages.length > 0 ? (
                    <Stack spacing={1} sx={{ width: { xs: '100%', sm: '80%', md: '95%' } }}>
                        {chatMessages.map((message: MessageProps, index: number) => {
                            const isCurrentUser = message.userId === currentUserId;
                            return (
                                <Stack
                                    key={index}
                                    direction="row"
                                    spacing={2}
                                    flexDirection={isCurrentUser ? 'row-reverse' : 'row'}
                                >
                                    <ChatBubble
                                        id={message.id}
                                        chatId={message.chatId}
                                        userId={message.userId}
                                        variant={isCurrentUser ? 'sent' : 'received'}
                                        user={message.user}
                                        content={message.content}
                                        createdAt={message.createdAt}
                                        attachment={message.attachment}
                                        isRead={message.isRead ?? false}
                                        isDelivered={message.isDelivered ?? false}
                                        unread={message.unread}
                                        isEdited={message.isEdited}
                                        onEditMessage={handleEditMessage}
                                        messageCreatorId={message.userId}
                                        isGroupChat={chat?.isGroup || false}
                                    />
                                </Stack>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </Stack>
                ) : (
                    <Typography
                        sx={{
                            textAlign: 'center',
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            color: 'text.secondary',
                        }}
                    >
                        {t('')}
                    </Typography>
                )}
            </Box>

            {chat && (
                <Box sx={{ width: { xs: '100%', sm: '80%', md: '94%' }, margin: '0 auto' }}>
                    <MessageInput
                        chatId={chat?.id ?? null} // Чат может быть null, если он еще не создан
                        selectedChat={chat} // Передаем текущий чат
                        setSelectedChat={setSelectedChat} // Передаем функцию для обновления выбранного чата
                        currentUserId={currentUserId!} // Убеждаемся, что передаем корректный ID пользователя
                        onSubmit={() => {
                            const newMessage: MessageProps = {
                                id: chatMessages.length + 1,
                                user: chat?.users?.find((user) => user.id === currentUserId)!,
                                userId: currentUserId!,
                                chatId: chat?.id!,
                                content: textAreaValue,
                                createdAt: new Date().toISOString(),
                            };
                            setChatMessages([...chatMessages, newMessage]);
                            setTextAreaValue('');
                            setEditingMessageId(null);
                        }}
                        editingMessage={
                            editingMessageId !== null
                                ? {
                                    id: editingMessageId,
                                    content:
                                        chatMessages.find(
                                            (msg) => msg.id.toString() === editingMessageId.toString()
                                        )?.content ?? null,
                                }
                                : { id: null, content: null }
                        }
                        setEditingMessage={(msg) => {
                            if (msg === null) {
                                setEditingMessageId(null);
                            } else {
                                const messageToEdit = chatMessages.find(
                                    (msgItem) => msgItem.content === msg.content
                                );
                                if (messageToEdit) {
                                    setEditingMessageId(Number(messageToEdit.id));
                                }
                            }
                        }}
                    />

                </Box>
            )}
        </Sheet>
    );
}
