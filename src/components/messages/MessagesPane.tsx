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
import {getSessionKey, sendMessage, updateMessageStatus} from '../../api/api';
import {decryptChatMessage} from "../../api/e2ee";

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
    const [messages, setMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [userStatuses, setUserStatuses] = React.useState<Record<string, Pick<UserProps, 'online' | 'lastOnline'>>>({});

    const scrollToBottom = (smooth: boolean = true) => {
        requestAnimationFrame(() => {
            const container = messagesContainerRef.current;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto',
                });
            }
        });
    };


    const markMessagesAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authorization token is missing');

            const decodedToken: { id: number } = jwtDecode(token);
            const currentUserId = decodedToken.id;

            const messageIds = chatMessages
                .filter(msg => !msg.isRead && msg.userId !== currentUserId && Number.isInteger(msg.id))
                .map(msg => msg.id);

            if (messageIds.length === 0) return;

            console.log("📤 Отправляем запрос на обновление прочитанности сообщений:", messageIds);

            await Promise.all(messageIds.map(id =>
                updateMessageStatus(Number(id), { isRead: true }, token)
            ));

            setChatMessages(prevMessages =>
                prevMessages.map(msg =>
                    messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
                )
            );
        } catch (error) {
            console.error('❌ Ошибка при отметке сообщений как прочитанных:', error);
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
        if (!chatIdFromUrl || chatIdRef.current === Number(chatIdFromUrl)) {
            return;
        }

        const chatFromUrl = findChatById(chatIdFromUrl);
        if (chatFromUrl) {
            setSelectedChat(chatFromUrl);
        }
    }, [chatIdFromUrl, chats, setSelectedChat]);


    useEffect(() => {
        if (chat && chat.id !== chatIdRef.current) {
            chatIdRef.current = chat.id;
            const newMessages = chat.messages || [];

            if (JSON.stringify(newMessages) !== JSON.stringify(chatMessagesRef.current)) {
                chatMessagesRef.current = newMessages;
                setChatMessages([...newMessages]);
            }

            scrollToBottom(false);
        } else if (!chat) {
            chatMessagesRef.current = [];
            setChatMessages([]);
            chatIdRef.current = null;
        }
    }, [chat]);


    useEffect(() => {
        const resendPendingMessages = async () => {
            console.log("Соединение восстановлено. Проверяем pending сообщения...");
            const token = localStorage.getItem("token");
            if (!token) return;
            const pendingMessages = messages.filter(msg => msg.pending);
            for (const msg of pendingMessages) {
                try {
                    const formData = new FormData();
                    formData.append("content", msg.content);
                    await sendMessage(msg.chatId, formData, token);
                    console.log(`Сообщение ${msg.id} успешно повторно отправлено.`);
                    setMessages(prev =>
                        prev.map(m => (m.id === msg.id ? { ...m, pending: false } : m))
                    );
                } catch (err) {
                    console.error(`Ошибка повторной отправки сообщения ${msg.id}:`, err);
                }
            }
        };

        window.addEventListener("online", resendPendingMessages);
        return () => {
            window.removeEventListener("online", resendPendingMessages);
        };
    }, [messages]);


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

    const decryptMessages = async (messages: MessageProps[], chatId: number) => {
        let sessionKey = sessionStorage.getItem(`sessionKey-${chatId}`);

        if (!sessionKey) {
            console.warn(`⚠️ Ключ для чата ${chatId} не найден в sessionStorage. Запрашиваем у сервера...`);
            try {
                const response = await getSessionKey(chatId);
                sessionKey = response?.sessionKey || null;

                if (sessionKey) {
                    sessionStorage.setItem(`sessionKey-${chatId}`, sessionKey);
                } else {
                    console.error(`❌ Ошибка: Не удалось получить ключ для чата ${chatId}`);
                    return messages; // Возвращаем зашифрованные сообщения
                }
            } catch (error) {
                console.error(`❌ Ошибка запроса сессионного ключа для чата ${chatId}:`, error);
                return messages;
            }
        }

        console.log(`🔓 Дешифруем ${messages.length} сообщений с ключом ${sessionKey}`);

        return messages.map(msg => ({
            ...msg,
            content: decryptChatMessage(msg.content, sessionKey!, sessionKey!)
        }));
    };

    const handleDeleteMessageInList = (messageId: number) => {
        setChatMessages((prevMessages) => prevMessages.filter((msg) => Number(msg.id) !== messageId));
    };

    useEffect(() => {
        if (chat?.id && chat.messages.length > 0) {
            decryptMessages(chat.messages, chat.id).then(decryptedMessages => {
                setChatMessages(decryptedMessages);
            });
        }
    }, [chat]);


    useWebSocket((data) => {
        if (data.type === 'newMessage' && data.message) {
            const serverMessage = data.message;

            if (chatIdRef.current !== serverMessage.chatId) {
                console.log(`📩 Сообщение ID ${serverMessage.id} пришло в другой чат (ID: ${serverMessage.chatId}), игнорируем.`);
                return;
            }

            console.log("📥 Получено новое сообщение (зашифрованное):", serverMessage);

            // ✅ Расшифровываем и добавляем в UI
            decryptMessages([serverMessage], serverMessage.chatId).then(decryptedMessages => {
                setChatMessages(prevMessages => [...prevMessages, ...decryptedMessages]);
            });


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
            const userFromDb = chat?.users?.find((user) => user.id !== currentUserId);
            if (userFromDb) {
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
                    px: 1,
                    py: { xs: 2, sm: 2 },
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
                    <Stack spacing={1} sx={{ width: { xs: '100%', sm: '80%', md: '80%' } }}>
                        {chatMessages
                            .filter((message) => message.content || (message.attachment && message.attachment.filePath))
                            .map((message: MessageProps, index: number) => {
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
                                            pending={message.pending}
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
                <Box sx={{ width: { xs: '100%', sm: '80%', md: '80%' }, margin: '0 auto' }}>
                    <MessageInput
                        chatId={chat?.id ?? null}
                        selectedChat={chat}
                        setSelectedChat={setSelectedChat}
                        currentUserId={currentUserId!}
                        onSubmit={(newMessage: MessageProps) => {
                            setChatMessages((prevMessages) => [...prevMessages, newMessage]);
                            setTextAreaValue("");
                            setEditingMessageId(null);
                        }}
                        editingMessage={
                            editingMessageId !== null
                                ? {
                                    id: editingMessageId,
                                    content:
                                        chatMessages.find((msg) => msg.id === editingMessageId)?.content || "",
                                }
                                : { id: null, content: "" }
                        }
                        setEditingMessage={(msg) => {
                            if (!msg) {
                                setEditingMessageId(null);
                            } else {
                                const messageToEdit = chatMessages.find(
                                    (msgItem) => msgItem.content === msg.content
                                );
                                if (messageToEdit) {
                                    setEditingMessageId(messageToEdit.id);
                                }
                            }
                        }}
                    />


                </Box>
            )}
        </Sheet>
    );
}
