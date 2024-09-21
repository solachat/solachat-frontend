import * as React from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from './AvatarWithStatus';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessagesPaneHeader from './MessagesPaneHeader';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import { useState, useEffect, useRef } from 'react';

type MessagesPaneProps = {
    chat: ChatProps | null;
    currentUserId: number;
    currentUser: UserProps;
};

export default function MessagesPane(props: MessagesPaneProps) {
    const { chat, currentUserId, currentUser } = props;
    const chatId = chat ? chat.id : null;

    const [chatMessages, setChatMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [textAreaValue, setTextAreaValue] = useState('');
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !chatId) {
            console.error('Missing token or chat ID.');
            return;
        }

        const connectWebSocket = () => {
            ws.current = new WebSocket(`ws://localhost:4005/ws?token=${token}&chatId=${chatId}`);

            ws.current.onopen = () => {
                console.log('WebSocket connection opened');
            };

            ws.current.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                if (messageData.chatId === Number(chatId)) {
                    setChatMessages((prevMessages) => [...prevMessages, messageData.message]);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.current.onclose = (event) => {
                console.log(`WebSocket connection closed. Code: ${event.code}. Reason: ${event.reason}`);
                if (event.code !== 1000) {
                    setTimeout(connectWebSocket, 3000); // Retry connection after 3 seconds
                }
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [chatId]);

    useEffect(() => {
        if (chat) {
            setChatMessages(chat.messages || []);
        }
    }, [chat]);

    const handleSendMessage = async (newMessageContent: string) => {
        const newId = chatMessages.length + 1;
        const newMessage: MessageProps = {
            id: newId.toString(),
            sender: { id: currentUserId, realname: 'You', username: 'you', avatar: currentUser.avatar || '', online: true },
            content: newMessageContent,
            timestamp: 'Just now',
        };

        if (ws.current && ws.current.readyState === WebSocket.OPEN && chatId) {
            ws.current.send(JSON.stringify({ chatId, content: newMessageContent }));
        } else {
            console.error('WebSocket is not open');
        }

        setChatMessages((prevMessages) => [...prevMessages, newMessage]);
        setTextAreaValue('');
    };

    if (!chat || !chat.users || chat.users.length === 0) {
        return (
            <Sheet
                sx={{
                    height: { xs: 'calc(100dvh - var(--Header-height))', lg: '100dvh' },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'background.level1',
                }}
            >
                <Typography sx={{ textAlign: 'center' }}>Start to communicate!</Typography>
            </Sheet>
        );
    }

    const sender = chat.users.find((user) => user.id !== currentUserId);

    return (
        <Sheet
            sx={{
                height: { xs: 'calc(100dvh - var(--Header-height))', md: '100dvh' },
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.level1',
            }}
        >
            <MessagesPaneHeader sender={sender} />
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    px: 2,
                    py: 3,
                    overflowY: 'auto',
                    minHeight: 0,
                }}
            >
                <Stack spacing={2} justifyContent="flex-end">
                    {chatMessages.length > 0 ? (
                        chatMessages.map((message: MessageProps, index: number) => {
                            const isYou = message.sender === 'You';
                            const messageSender = isYou ? currentUser : message.sender as UserProps;

                            return (
                                <Stack
                                    key={index}
                                    direction="row"
                                    spacing={2}
                                    flexDirection={isYou ? 'row-reverse' : 'row'}
                                >
                                    {!isYou && messageSender && (
                                        <AvatarWithStatus online={messageSender.online} src={messageSender.avatar} />
                                    )}
                                    <ChatBubble
                                        variant={isYou ? 'sent' : 'received'}
                                        {...message}
                                        currentUser={currentUser}
                                    />
                                </Stack>
                            );
                        })
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 2 }}>No messages yet.</Typography>
                    )}
                </Stack>
            </Box>
            <MessageInput
                chatId={Number(chatId)}
                textAreaValue={textAreaValue}
                setTextAreaValue={setTextAreaValue}
                onSubmit={() => handleSendMessage(textAreaValue)}
            />
        </Sheet>
    );
}
