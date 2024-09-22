import * as React from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from './AvatarWithStatus';
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

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: { id: number } = jwtDecode(token);
            setCurrentUserId(decodedToken.id);
            console.log('Текущий пользователь (ID):', decodedToken.id);
        }
    }, []);

    useEffect(() => {
        if (chat) {
            console.log('Обновлен чат:', chat);
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
        if (!newMessage.userId) {
            console.error('Новое сообщение без userId', newMessage);
        } else {
            console.log('Новое сообщение от userId:', newMessage.userId, 'Содержимое:', newMessage.content);
        }

        setChatMessages((prevMessages) => {
            const exists = prevMessages.some(message => message.id === newMessage.id);
            if (!exists) {
                return [...prevMessages, newMessage];
            }
            return prevMessages;
        });
    };

    useWebSocket((message) => {
        if (message.type === 'newMessage' && message.message.chatId === chat?.id) {
            handleNewMessage(message.message);
        }
    });

    const interlocutor = chat?.users?.find(user => user.id !== currentUserId);
    console.log('Собеседник:', interlocutor);

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
            {interlocutor && <MessagesPaneHeader sender={interlocutor} />}

            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    px: 2,
                    py: 3,
                    overflowY: 'auto',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 2,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--joy-palette-primary-500)',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'var(--joy-palette-background-level1)',
                    },
                }}
            >
                {chatMessages.length > 0 ? (
                    <Stack spacing={2} sx={{ width: '100%' }}>
                        {chatMessages.map((message: MessageProps, index: number) => {
                            const isCurrentUser = message.userId === currentUserId;
                            const avatarSrc = message.user?.avatar || "default_avatar_path";

                            console.log(`Сообщение #${index + 1}: Отправитель: ${message.user?.username} | Аватар: ${avatarSrc}`);

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
                        const newId = (chatMessages.length + 1).toString();
                        const newMessage: MessageProps = {
                            id: newId,
                            user: chat?.users?.find(user => user.id === currentUserId)!,
                            userId: currentUserId!,
                            content: textAreaValue,
                            createdAt: new Date().toISOString(),
                        };
                        handleNewMessage(newMessage);
                        setTextAreaValue('');
                    }}
                />
            )}
        </Sheet>
    );
}
