import * as React from 'react';
import Box from '@mui/joy/Box';
import {useLocation, useNavigate} from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessagesPaneHeader from './MessagesPaneHeader';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import {useState, useEffect, useRef, useLayoutEffect} from 'react';
import { useWebSocket } from '../../api/useWebSocket';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import { updateMessageStatus} from '../../api/api';
import dayjs from "dayjs";
import {AnimatePresence, motion} from "framer-motion";
import ChatInfoPanel from "./ChatInfoPane";

type MessagesPaneProps = {
    chat: ChatProps | null;
    members?: UserProps[];
    chats: ChatProps[];
    selectedChat: ChatProps | null;
    setSelectedChat: (chat: ChatProps | null) => void;
};

export default function MessagesPane({ chat, chats, members = [], setSelectedChat, selectedChat }: MessagesPaneProps) {
    const { t, i18n } = useTranslation();
    const [chatIdFromUrl, setChatIdFromUrl] = useState<string | undefined>();

    const [chatMessages, setChatMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [textAreaValue, setTextAreaValue] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const chatIdRef = useRef<number | null>(null);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [messages, setMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [userStatuses, setUserStatuses] = React.useState<Record<string, Pick<UserProps, 'online' | 'lastOnline'>>>({});
    const [visibleDate, setVisibleDate] = useState<string | null>(null);
    const chatMessagesRef = useRef<MessageProps[]>(chat?.messages || []);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const groupMessagesByDate = (messages: MessageProps[]) => {
        return messages.reduce((acc, message) => {
            const messageDate = dayjs(message.createdAt).format('DD MMMM YYYY');
            if (!acc[messageDate]) {
                acc[messageDate] = [];
            }
            acc[messageDate].push(message);
            return acc;
        }, {} as Record<string, MessageProps[]>);
    };
    const groupedMessages = groupMessagesByDate(chatMessages);

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

        const recipientId = Number(chatIdFromUrl);
        if (!recipientId || recipientId === currentUserId) {
            console.warn("⚠️ Некорректный recipientId:", recipientId);
            return;
        }

        const chatFromUrl = chats.find(chat =>
            !chat.isGroup && chat.users.some(user => user.id === recipientId)
        );
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

    const selectedChatRef = useRef<ChatProps | null>(null);

    useLayoutEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useWebSocket((data) => {
        if (data.type === 'newMessage' && data.message) {
            const serverMessage = data.message;

            const currentChatId = selectedChatRef.current?.id;
            console.log(`🎯 [newMessage] Текущий selectedChat: ${selectedChat?.id || "❌ не установлен"}`);
            console.log(`📩 Новое сообщение относится к чату: ${serverMessage.chatId}`);

            if (currentChatId !== data.message.chatId) {
                console.warn(`Сообщение для ${data.message.chatId}, текущий: ${currentChatId}`);
                return;
            }

            console.log(selectedChat + "Выбранный чат")
            console.log("📥 Получено новое сообщение:", serverMessage);

            console.log("Дата с сервера:", serverMessage.createdAt);

            let parsedDate = new Date(serverMessage.createdAt);
            if (isNaN(parsedDate.getTime())) {
                console.warn("❌ Невалидная дата с сервера, используем fallback.");
                parsedDate = new Date();
            }

            console.log("Используем дату:", parsedDate.toISOString());

            setChatMessages((prevMessages) => {
                const index = prevMessages.findIndex(msg => msg.id === Number(serverMessage.tempId));

                if (index !== -1) {
                    return prevMessages.map(msg =>
                        msg.id === Number(serverMessage.tempId)
                            ? {
                                ...msg,
                                id: serverMessage.id,
                                pending: false,
                                createdAt: parsedDate.toISOString(),
                                attachment: serverMessage.attachment || msg.attachment,
                            }
                            : msg
                    );
                }

                return [...prevMessages, serverMessage];
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString();
        const monthNumber = date.getMonth() + 1;
        const year = date.getFullYear();

        const monthKey = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;

        const translatedMonth = t(`months.${monthKey}`);

        const formatKey = year === new Date().getFullYear() ? "date_format" : "date_format_with_year";

        return t(formatKey, { day, month: translatedMonth, year });
    };

    const navigate = useNavigate();
    const location = useLocation();
    const previousPath = location.state?.from || '/chat';

    const [isClosing, setIsClosing] = useState(false);

    const handleBack = () => {
        setIsClosing(true);
        setSelectedChat(null);
        navigate(previousPath);
    };
    const [showInfoPanel, setShowInfoPanel] = React.useState(false);

    const handlePublicKeyClick = () => {
        setShowInfoPanel((prev) => !prev);
    };

    useEffect(() => {
        const savedState = sessionStorage.getItem('showInfoPanel');
        if (savedState === 'true') {
            setShowInfoPanel(true);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('showInfoPanel', showInfoPanel.toString());
    }, [showInfoPanel]);

    return (
        <Sheet
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                overflow: 'hidden',
                background: 'radial-gradient(circle at center, #0a192f 0%, #081428 100%)',
            }}
        >
            <Box
                sx={{
                    flex: '1 1 auto', // Занимает всю доступную ширину
                    maxWidth: showInfoPanel ? 'calc(100% - 450px)' : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {chat?.id && (
                    <MessagesPaneHeader
                        sender={interlocutor}
                        chatId={chat.id}
                        isGroup={chat.isGroup}
                        chatName={chat.isGroup ? chat.name : undefined}
                        groupAvatar={chat.isGroup ? chat.avatar || '/default-group-avatar.png' : undefined}
                        members={chat?.users || []}
                        onBack={handleBack}
                        onPublicKeyClick={handlePublicKeyClick}
                    />
                )}

                {visibleDate && (
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        sx={{
                            position: 'fixed',
                            top: 10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bgcolor: 'rgba(0, 168, 255, 0.2)',
                            color: '#00a8ff',
                            padding: '6px 12px',
                            borderRadius: 'lg',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            zIndex: 1000,
                            border: '1px solid rgba(0, 168, 255, 0.3)',
                            boxShadow: '0 4px 16px rgba(0, 168, 255, 0.2)',
                        }}
                    >
                        {visibleDate}
                    </Box>
                )}

                <Box
                    ref={messagesContainerRef}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        px: 1,
                        py: { xs: 2, sm: 1 },
                        overflowY: 'auto',
                        alignItems: 'center',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            bgcolor: 'rgba(0, 168, 255, 0.1)',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'rgba(0, 168, 255, 0.3)',
                            borderRadius: '4px',
                        },
                    }}
                >
                    <>
                        {chatMessages.length > 0 ? (
                            <Stack spacing={2} sx={{ width: { xs: '100%', sm: '80%', md: '60%' } }}>
                                {Object.entries(groupedMessages).map(([date, messages]) => (
                                    <div key={date}>
                                        <Typography
                                            sx={{
                                                textAlign: 'center',
                                                fontSize: '14px',
                                                color: '#a0d4ff',
                                                bgcolor: 'rgba(0, 168, 255, 0.1)',
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                maxWidth: 'fit-content',
                                                margin: '7px auto',
                                                border: '1px solid rgba(0, 168, 255, 0.3)',
                                                boxShadow: '0 2px 8px rgba(0, 168, 255, 0.2)',
                                            }}
                                        >
                                            {formatDate(date)}
                                        </Typography>

                                        <Stack spacing={1}>
                                            {messages
                                                .filter(
                                                    (message) =>
                                                        message.content ||
                                                        (message.attachment && message.attachment.length > 0)
                                                )
                                                .map((message: MessageProps) => {
                                                    const isCurrentUser = message.userId === currentUserId;
                                                    return (
                                                        <Stack
                                                            key={message.id}
                                                            direction="row"
                                                            spacing={1}
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
                                        </Stack>
                                    </div>
                                ))}
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
                    </>
                </Box>

                {chat && (
                    <Box sx={{ width: { xs: '100%', sm: '80%', md: '60%' }, margin: '0px auto' }}>
                        <MessageInput
                            chatId={chat?.id ?? null}
                            selectedChat={chat}
                            setSelectedChat={setSelectedChat}
                            currentUserId={currentUserId!}
                            onSubmit={(newMessage: MessageProps) => {
                                setChatMessages((prevMessages) => [...prevMessages, newMessage]);
                                setTextAreaValue('');
                                setEditingMessageId(null);
                            }}
                            editingMessage={
                                editingMessageId !== null
                                    ? {
                                        id: editingMessageId,
                                        content:
                                            chatMessages.find((msg) => msg.id === editingMessageId)?.content || '',
                                    }
                                    : { id: null, content: '' }
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
            </Box>


            <AnimatePresence>
                {showInfoPanel && (
                    <motion.div
                        initial={{ x: 450, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 450, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        style={{
                            width: 450,
                            height: '100vh',
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            borderLeft: '1px solid rgba(0, 168, 255, 0.3)',
                            overflowY: 'auto',
                            background: 'rgba(10, 25, 47, 0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000,
                        }}
                    >
                        <ChatInfoPanel
                            profile={{
                                avatar: interlocutor?.avatar || '/default-avatar.png',
                                username: interlocutor?.username,
                                publicKey: interlocutor?.public_key ?? '',
                            }}
                            messages={chatMessages}
                            onClose={() => setShowInfoPanel(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

        </Sheet>
    );
}
