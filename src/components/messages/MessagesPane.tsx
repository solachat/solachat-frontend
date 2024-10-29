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
import {updateMessageStatus} from "../../api/api";

type MessagesPaneProps = {
    chat: ChatProps | null;
    members?: UserProps[];
    setSelectedChat: (chat: ChatProps | null) => void;
};

export default function MessagesPane({ chat, members = [], setSelectedChat }: MessagesPaneProps) {
    const { t } = useTranslation();
    const [chatMessages, setChatMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [textAreaValue, setTextAreaValue] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [isFarFromBottom, setIsFarFromBottom] = useState<boolean>(false);
    const [allChatMessages, setAllChatMessages] = useState<{ [key: number]: MessageProps[] }>({});
    const { chatId } = useParams<{ chatId: string }>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const chatIdRef = useRef<number | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);

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
                await Promise.all(messageIds.map(id => updateMessageStatus(Number(id), { isRead: true }, token)));

                setChatMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.userId !== currentUserId ? { ...msg, isRead: true } : msg
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

    useEffect(() => {
        if (chat) {
            chatIdRef.current = chat.id;

            setAllChatMessages((prev) => {
                const updatedMessages = {
                    ...prev,
                    [chat.id]: prev[chat.id] ? [...prev[chat.id]] : chat.messages || [],
                };
                return updatedMessages;
            });

            setChatMessages((prev) => {
                const existingMessages = allChatMessages[chat.id] || chat.messages || [];
                return [...existingMessages];
            });

            scrollToBottom(false);
            setInitialLoad(false);
        } else {
            console.log('No chat selected, clearing messages.');
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

    useEffect(() => {
        if (chat) {
            setChatMessages(allChatMessages[chat.id] || []);
        }
    }, [chat, allChatMessages]);


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
        console.log('Received WebSocket message:', data);

        if (data.type === 'newMessage' && data.message) {
            const newMessage = data.message;

            setAllChatMessages((prev) => {
                const chatId = newMessage.chatId;
                const chatMessages = prev[chatId] || [];
                const exists = chatMessages.some((msg) => msg.id === newMessage.id);
                if (!exists) {
                    return {
                        ...prev,
                        [chatId]: [...chatMessages, newMessage],
                    };
                }
                return prev;
            });

            if (newMessage.chatId === chatIdRef.current) {
                setChatMessages((prevMessages) => {
                    const exists = prevMessages.some((msg) => msg.id === newMessage.id);
                    if (!exists) {
                        return [...prevMessages, newMessage];
                    }
                    return prevMessages;
                });
            }

        } else if (data.type === 'editMessage' && data.message) {
            const updatedMessage = data.message;

            setAllChatMessages((prev) => {
                const chatId = updatedMessage.chatId;
                const chatMessages = prev[chatId] || [];
                return {
                    ...prev,
                    [chatId]: chatMessages.map((msg) =>
                        msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                    ),
                };
            });

            if (updatedMessage.chatId === chatIdRef.current) {
                handleEditMessageInList(updatedMessage);
            }

        } else if (data.type === 'deleteMessage') {
            const { messageId, chatId } = data;

            setAllChatMessages((prev) => {
                return {
                    ...prev,
                    [chatId]: prev[chatId].filter((msg) => msg.id !== messageId),
                };
            });

            if (chatId === chatIdRef.current) {
                handleDeleteMessageInList(messageId);
            }

        }
        if (data.type === 'messageRead' && data.messageId) {
            setChatMessages((prevMessages) => {
                const updatedMessages = prevMessages.map((msg) => {
                    if (msg.id === data.messageId) {
                        return { ...msg, isRead: true };
                    }
                    return msg;
                });
                return updatedMessages;
            });

            setAllChatMessages((prev) => {
                const chatId = chatIdRef.current;
                if (!chatId) return prev;

                return {
                    ...prev,
                    [chatId]: prev[chatId].map((msg) =>
                        msg.id === data.messageId ? { ...msg, isRead: true } : msg
                    ),
                };
            });
        }

    }, [currentUserId, chatIdRef]);


    const handleEditMessage = (messageId: number, content: string) => {
        setEditingMessageId(messageId);
        setTextAreaValue(content);
    };

    const interlocutor = chat?.isGroup
        ? undefined
        : chat?.users?.find((user) => user.id !== currentUserId);

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
                    <Stack spacing={2} sx={{ width: { xs: '100%', sm: '80%', md: '95%' } }}>
                        {chatMessages.map((message: MessageProps, index: number) => {
                            const isCurrentUser = message.userId === currentUserId;
                            const messageCreatorId = message.userId;

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
                                        messageCreatorId={messageCreatorId}
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


            {/*{isFarFromBottom && (*/}
            {/*    <IconButton*/}
            {/*        sx={{*/}
            {/*            position: 'fixed',*/}
            {/*            right: 16,*/}
            {/*            zIndex: 10,*/}
            {/*            backgroundColor: 'primary.main',*/}
            {/*            '&:hover': {*/}
            {/*                backgroundColor: 'primary.dark',*/}
            {/*            },*/}
            {/*            width: { xs: 40, sm: 56 },*/}
            {/*            height: { xs: 40, sm: 56 },*/}
            {/*        }}*/}
            {/*        onClick={() => scrollToBottom()}*/}
            {/*    >*/}
            {/*        <ArrowDownwardIcon />*/}
            {/*    </IconButton>*/}
            {/*)}*/}

            {chat && (
                <Box sx={{ width: { xs: '100%', sm: '80%', md: '94%' }, margin: '0 auto' }}>
                    <MessageInput
                        chatId={Number(chat?.id ?? 0)}
                        onSubmit={() => {
                            const newMessage: MessageProps = {
                                id: (chatMessages.length + 1),
                                user: chat?.users?.find((user) => user.id === currentUserId)!,
                                userId: currentUserId!,
                                chatId: chat?.id!,
                                content: textAreaValue,
                                createdAt: new Date().toISOString(),
                            };
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
