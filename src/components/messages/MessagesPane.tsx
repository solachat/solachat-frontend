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
import { useState, useEffect } from 'react';
import { useWebSocket } from '../../api/useWebSocket';

type MessagesPaneProps = {
    chat: ChatProps | null;
};

export default function MessagesPane({ chat }: MessagesPaneProps) {
    const [chatMessages, setChatMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [textAreaValue, setTextAreaValue] = useState<string>('');

    useEffect(() => {
        if (chat) {
            console.log('Chat updated in MessagesPane with messages:', chat.messages);
            setChatMessages(chat.messages || []);
            if (chat.messages?.length === 0) {
                console.log('No messages in the chat');
            }
        } else {
            setChatMessages([]);
        }
    }, [chat]);

    const handleNewMessage = (newMessage: MessageProps) => {
        setChatMessages((prevMessages) => {
            const exists = prevMessages.some(message => message.id === newMessage.id);
            if (exists) {
                return prevMessages;
            }
            return [...prevMessages, newMessage];
        });
    };

    useWebSocket((message) => {
        if (message.type === 'newMessage' && message.message.chatId === chat?.id) {
            handleNewMessage(message.message);
        }
    });

    const currentUser = chat?.users?.find(user => user.username === 'current_user');
    const interlocutor = chat?.users?.find(user => user.id !== currentUser?.id);


    return (
        <Sheet
            sx={{
                height: { xs: 'calc(100dvh - var(--Header-height))', md: '100dvh' },
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.level1',
            }}
        >
            {interlocutor && <MessagesPaneHeader sender={interlocutor} />}

            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: chatMessages.length > 0 ? 'column-reverse' : 'column',
                    px: 2,
                    py: 3,
                    overflowY: 'auto',
                    justifyContent: chatMessages.length > 0 ? 'flex-start' : 'center',
                    alignItems: 'center',
                }}
            >
                {chatMessages.length > 0 ? (
                    <Stack spacing={2} justifyContent="flex-end" sx={{ width: '100%' }}>
                        {chatMessages.map((message: MessageProps, index: number) => {
                            const isCurrentUser = message.sender && message.sender.id === currentUser?.id;

                            return (
                                <Stack
                                    key={index}
                                    direction="row"
                                    spacing={2}
                                    flexDirection={isCurrentUser ? 'row-reverse' : 'row'}
                                >
                                    {!isCurrentUser && message.sender && (
                                        <AvatarWithStatus online={message.sender.online} src={message.sender.avatar} />
                                    )}
                                    <ChatBubble
                                        id={message.id}
                                        variant={isCurrentUser ? 'sent' : 'received'}
                                        sender={message.sender}
                                        content={message.content}
                                        timestamp={message.timestamp}
                                        attachment={message.attachment}
                                    />
                                </Stack>
                            );
                        })}
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
                        }}
                    >
                        No messages yet. Start the conversation!
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
                            sender: currentUser!,
                            content: textAreaValue,
                            timestamp: new Date().toISOString(),
                        };
                        handleNewMessage(newMessage);
                        setTextAreaValue('');
                    }}
                />
            )}
        </Sheet>
    );
}
