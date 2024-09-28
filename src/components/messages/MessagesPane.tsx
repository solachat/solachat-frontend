import * as React from 'react';
import Box from '@mui/joy/Box';
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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import IconButton from '@mui/joy/IconButton';

type MessagesPaneProps = {
    chat: ChatProps | null;
    members?: UserProps[];
};

export default function MessagesPane({ chat, members = [] }: MessagesPaneProps) {
    const { t } = useTranslation();
    const [chatMessages, setChatMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [textAreaValue, setTextAreaValue] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [isFarFromBottom, setIsFarFromBottom] = useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container) {
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
            setIsFarFromBottom(!isNearBottom);
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

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleNewMessage = (newMessage: MessageProps) => {
        setChatMessages((prevMessages) => {
            const exists = prevMessages.some((message) => message.id === newMessage.id);
            if (!exists) {
                return [...prevMessages, newMessage];
            }
            return prevMessages;
        });
    };

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

    useWebSocket((message) => {
        if (message.type === 'newMessage') {
            if (message.message.chatId === chat?.id) {
                handleNewMessage(message.message);
            } else {
                console.log(`Received message for chat ID ${message.message.chatId}, but current chat ID is ${chat?.id}. Ignoring.`);
            }
        } else if (message.type === 'editMessage') {
            handleEditMessageInList(message.message);
        }
    });

    const handleEditMessage = (messageId: number, content: string) => {
        setEditingMessageId(messageId);
        setTextAreaValue(content);
    };

    const interlocutor = chat?.isGroup
        ? undefined
        : chat?.users?.find((user) => user.id !== currentUserId);

    console.log('chat.isGroup:', chat?.isGroup);
    console.log('chat.groupAvatar:', chat?.groupAvatar);

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
            {chat?.id && (
                <MessagesPaneHeader
                    sender={interlocutor}
                    chatId={chat.id}
                    isGroup={chat.isGroup}
                    chatName={chat.isGroup ? chat.name : undefined}
                    groupAvatar={chat.isGroup ? chat.avatar || 'path/to/default-group-avatar.jpg' : undefined}
                    members={chat?.users || []}
                />
            )}

            <Box
                ref={messagesContainerRef}
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
                                        userId={message.userId}
                                        variant={isCurrentUser ? 'sent' : 'received'}
                                        user={message.user}
                                        content={message.content}
                                        createdAt={message.createdAt}
                                        attachment={message.attachment}
                                        isEdited={message.isEdited}
                                        onEditMessage={handleEditMessage}
                                        messageCreatorId={messageCreatorId} // Передаем messageCreatorId
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

            {isFarFromBottom && (
                <IconButton
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 10,
                        backgroundColor: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                    }}
                    onClick={scrollToBottom}
                >
                    <ArrowDownwardIcon />
                </IconButton>
            )}

            {chat && (
                <MessageInput
                    chatId={Number(chat?.id ?? 0)}
                    textAreaValue={textAreaValue}
                    setTextAreaValue={setTextAreaValue}
                    onSubmit={() => {
                        const newMessage: MessageProps = {
                            id: (chatMessages.length + 1).toString(),
                            user: chat?.users?.find((user) => user.id === currentUserId)!,
                            userId: currentUserId!,
                            content: textAreaValue,
                            createdAt: new Date().toISOString(),
                        };
                        handleNewMessage(newMessage);
                        setTextAreaValue('');
                        setEditingMessageId(null);
                    }}
                    editingMessage={
                        editingMessageId !== null
                            ? {
                                id: editingMessageId,
                                content: chatMessages.find(
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
            )}
        </Sheet>
    );
}
