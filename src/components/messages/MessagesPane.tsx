import * as React from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessagesPaneHeader from './MessagesPaneHeader';
import { ChatProps, MessageProps } from '../core/types';
import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../api/useWebSocket';
import { jwtDecode } from 'jwt-decode';
import {useTranslation} from "react-i18next";

type MessagesPaneProps = {
    chat: ChatProps | null;
};

export default function MessagesPane({ chat }: MessagesPaneProps) {
    const { t } = useTranslation();
    const [chatMessages, setChatMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [textAreaValue, setTextAreaValue] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: { id: number } = jwtDecode(token);
            setCurrentUserId(decodedToken.id);
        }
    }, []);

    useEffect(() => {
        if (chat) {
            setChatMessages(chat.messages || []);
            scrollToBottom();
        } else {
            setChatMessages([]);
        }
    }, [chat]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleNewMessage = (newMessage: MessageProps) => {
        setChatMessages((prevMessages) => {
            const exists = prevMessages.some(message => message.id === newMessage.id);
            if (!exists) {
                return [...prevMessages, newMessage];
            }
            return prevMessages;
        });
    };

    useWebSocket((message) => {
        if (message.type === 'newMessage') {
            if (message.message.chatId === chat?.id) {
                handleNewMessage(message.message);
            } else {
                console.log(`Received message for chat ID ${message.message.chatId}, but current chat ID is ${chat?.id}. Ignoring.`);
            }
        }
    });

    const handleEditMessage = (messageId: number, content: string) => {
        setEditingMessageId(messageId);
        setTextAreaValue(content);
    };


    const interlocutor = chat?.users?.find(user => user.id !== currentUserId);

    return (
        <Sheet
            sx={{
                height: { xs: 'calc(100dvh - var(--Header-height))', md: '100dvh' },
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.level1',
                borderRadius: 'md',
                boxShadow: 'lg',
                overflow: 'hidden',
            }}
        >
            {interlocutor && chat?.id && (
                <MessagesPaneHeader sender={interlocutor} chatId={chat.id} />
                )}

            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    px: 2,
                    py: { xs: 1, sm: 3 },
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: { xs: '6px', sm: '8px' },
                    },
                }}
            >
                {chatMessages.length > 0 ? (
                    <Stack spacing={2} sx={{ width: '100%' }}>
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
                                        userId={message.userId}
                                        variant={isCurrentUser ? 'sent' : 'received'}
                                        user={message.user}
                                        content={message.content}
                                        createdAt={message.createdAt}
                                        attachment={message.attachment}
                                        onEditMessage={handleEditMessage}
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
                        {t('nomessages')}
                    </Typography>
                )}
            </Box>

            {chat && (
                <MessageInput
                    chatId={Number(chat?.id ?? 0)}
                    textAreaValue={textAreaValue}
                    setTextAreaValue={setTextAreaValue}
                    onSubmit={() => {
                        const newMessage: MessageProps = {
                            id: (chatMessages.length + 1).toString(),
                            user: chat?.users?.find(user => user.id === currentUserId)!,
                            userId: currentUserId!,
                            content: textAreaValue,
                            createdAt: new Date().toISOString(),
                        };
                        handleNewMessage(newMessage);
                        setTextAreaValue('');
                        setEditingMessageId(null); // Сброс состояния редактирования
                    }}
                    editingMessage={editingMessageId !== null ?
                        chatMessages.find(msg => msg.id.toString() === editingMessageId.toString())?.content ?? '' : ''}
                    setEditingMessage={(msg) => {
                        if (msg === null) {
                            setEditingMessageId(null);
                        } else {
                            const messageToEdit = chatMessages.find(msgItem => msgItem.content === msg);
                            if (messageToEdit) {
                                setEditingMessageId(Number(messageToEdit.id)); // Убедитесь, что id - это number
                            }
                        }
                    }} // Передаем функцию для изменения ID редактируемого сообщения
                />
            )}
        </Sheet>
    );
}
