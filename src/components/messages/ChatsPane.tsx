import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/joy/Typography';
import {Box, CircularProgress, Input, List} from '@mui/joy';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChatListItem from './ChatListItem';
import {ChatProps, MessageProps, UserProps} from '../core/types';
import { searchUsers, fetchChatsFromServer } from '../../api/api';
import { CssVarsProvider } from '@mui/joy/styles';
import Sidebar from '../core/Sidebar';
import { useWebSocket } from '../../api/useWebSocket';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import SettingsScreen from '../screen/SettingsScreen';
import {useState} from "react";
import {cacheChats, getCachedChats} from "../../utils/cacheChats";
import {cacheMedia, getCachedMedia} from "../../utils/cacheMedia";
import { motion } from 'framer-motion';
import LanguageScreen from "../screen/LanguageScreen";

type ChatsPaneProps = {
    chats: ChatProps[];
    setSelectedChat: (chat: ChatProps) => void;
    selectedChatId: string;
    selectedChat: ChatProps | null;
    currentUser: { id: number };
};

export default function ChatsPane({ chats: initialChats, setSelectedChat, selectedChatId, currentUser, selectedChat }: ChatsPaneProps) {
    const {t} = useTranslation();
    const [chats, setChats] = useState<ChatProps[]>(initialChats);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<(UserProps & { lastMessage?: MessageProps; chatId?: number })[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [activeScreen, setActiveScreen] = useState<'chats' | 'settings' | 'language'>('chats');

    React.useEffect(() => {
        if (selectedChat) {
            console.log(`🔄 selectedChat обновлён в ChatsPane: ${selectedChat.id}`);
        } else {
            console.warn("⚠️ selectedChat всё ещё не установлен в ChatsPane!");
        }
    }, [selectedChat]);


    const {wsRef, isConnecting} = useWebSocket((data) => {
        console.log("Received WebSocket message:", data);
        if (data.type === 'chatCreated') {
            const newChat = data.chat;
            setChats((prevChats) => {
                if (prevChats.some((chat) => chat.id === newChat.id)) return prevChats;
                return [...prevChats, newChat].sort((a, b) => b.id - a.id);
            });


            if (selectedChat?.id === -1) {
                console.log(`✅ Принудительно обновляем selectedChat: ${newChat.id}`);
                setSelectedChat(newChat);
            }
        }

        if (data.type === 'chatDeleted') {
            setChats((prevChats) => prevChats.filter((chat) => chat.id !== data.chatId));
            navigate('/chat');
        }

        if (data.type === 'newMessage') {
            const newMessage = data.message;

            setChats((prevChats) => {
                let chatExists = false;


                let updatedChats = prevChats.map((chat) => {
                    if (chat.id === newMessage.chatId) {
                        chatExists = true;
                        return {
                            ...chat,
                            messages: [...(chat.messages || []), newMessage],
                            lastMessage: newMessage,
                        };
                    }
                    return chat;
                });

                if (!chatExists) {
                    console.log(`🆕 Чат ${newMessage.chatId} не найден, создаем временный`);
                    updatedChats.push({
                        id: newMessage.chatId,
                        messages: [newMessage],
                        lastMessage: newMessage,
                        users: [newMessage.user],
                        user: newMessage.user,
                        isGroup: false,
                    });
                }

                console.log(`🎯 Текущий активный чат: ${selectedChatId}`);

                const selectedChatIdNum = Number(selectedChatId);
                console.log(`🔍 Приведенный selectedChatIdNum: ${selectedChatIdNum}`);

                updatedChats = updatedChats.sort((a, b) => {
                    if (a.id === selectedChatIdNum) return -1;
                    if (b.id === selectedChatIdNum) return 1;

                    return (b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0) -
                        (a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0);
                });

                console.log("✅ Чаты после сортировки:", updatedChats.map(chat => chat.id));

                return updatedChats;
            });
        }

        if (data.type === 'deleteMessage') {
            const messageIdToDelete = data.messageId;
            const chatId = data.chatId;

            setChats((prevChats) => {
                return [
                    ...prevChats
                        .map((chat) =>
                            chat.id === chatId
                                ? {
                                    ...chat,
                                    messages: (chat.messages || []).filter(
                                        (msg) => msg.id !== messageIdToDelete
                                    ),
                                    lastMessage:
                                        chat.lastMessage && chat.lastMessage.id === messageIdToDelete
                                            ? undefined
                                            : chat.lastMessage,
                                }
                                : chat
                        )
                ];
            });
        }

        if (data.type === 'editMessage') {
            const editedMessage = data.message;
            const chatId = data.message.chatId;

            setChats((prevChats) => {
                return prevChats.map((chat) =>
                    chat.id === chatId
                        ? {
                            ...chat,
                            messages: (chat.messages || []).map((msg) =>
                                msg.id === editedMessage.id ? {...msg, ...editedMessage} : msg
                            ),
                            lastMessage:
                                chat.lastMessage && chat.lastMessage.id === editedMessage.id
                                    ? {...chat.lastMessage, ...editedMessage}
                                    : chat.lastMessage,
                        }
                        : chat
                );
            });
        }

        if (data.type === 'messageRead' && data.messageId) {
            const messageId = data.messageId;
            setChats((prevChats) =>
                prevChats.map((chat) => ({
                    ...chat,
                    messages: (chat.messages || []).map((msg) =>
                        msg.id === messageId ? {...msg, isRead: true} : msg
                    ),
                    lastMessage:
                        chat.lastMessage && chat.lastMessage.id === messageId
                            ? {...chat.lastMessage, isRead: true}
                            : chat.lastMessage,
                }))
            );
        }

        if (data.type === 'USER_CONNECTED' && 'publicKey' in data) {
            setChats((prevChats) =>
                prevChats.map((chat) => {
                    if (!chat.users) return chat;

                    const updatedUsers = chat.users.map((user) =>
                        user.public_key === data.publicKey ? { ...user, online: true } : user
                    );

                    return { ...chat, users: updatedUsers };
                })
            );

            console.log("✅ Обновленный статус пользователя в чатах:", data.publicKey);
        }


        if (data.type === 'USER_DISCONNECTED' && 'publicKey' in data) {
            const publicKey = data.publicKey;
            setChats((prevChats) =>
                prevChats.map((chat) => ({
                    ...chat,
                    users: (chat.users || []).map((user) =>
                        user.public_key === publicKey ? {...user, online: false} : user
                    ),
                }))
            );
        }

    }, []);

    React.useEffect(() => {
        const loadChats = async () => {
            setLoadingChats(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("⛔ Authorization token is missing");

                let cachedChats = await getCachedChats() || [];
                let chats = cachedChats;

                const chatsFromServer = await fetchChatsFromServer(currentUser.id, token);
                if (chatsFromServer) {
                    chats = chatsFromServer;
                    await cacheChats(chatsFromServer);
                }

                const updatedChats = await Promise.all(
                    chats.map(async (chat) => {
                        if (!chat.messages) return chat;

                        const updatedUsers = await Promise.all(
                            chat.users.map(async (user: any) => {
                                if (user.avatar) {
                                    const cachedAvatar = await getCachedMedia(user.avatar);
                                    return { ...user, avatar: cachedAvatar || user.avatar };
                                }
                                return user;
                            })
                        );

                        const updatedMessages = await Promise.all(
                            chat.messages.map(async (msg: any) => {
                                if (msg.attachment?.filePath) {
                                    const cachedFile = await getCachedMedia(msg.attachment.filePath);
                                    return cachedFile
                                        ? { ...msg, attachment: { ...msg.attachment, filePath: cachedFile } }
                                        : msg;
                                }
                                return msg;
                            })
                        );

                        return { ...chat, users: updatedUsers, messages: updatedMessages };
                    })
                );

                console.log("📌 Обновлённые чаты:", updatedChats);
                setChats([...updatedChats]);

            } catch (error) {
                console.error("❌ Ошибка загрузки чатов:", error);
                setError("Failed to fetch chats");
            } finally {
                setLoadingChats(false);
            }
        };

        loadChats();
    }, [currentUser.id]);


    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim()) {
            try {
                const userResults = await searchUsers(term);

                const chatResults = chats
                    .map(chat => {
                        const user = chat.users.find(user => user.id !== currentUser.id);
                        if (!user) return null;

                        const lastMessage =
                            chat.lastMessage ??
                            (Array.isArray(chat.messages) && chat.messages.length > 0
                                ? chat.messages.reduce((prev, curr) =>
                                    new Date(curr.timestamp || curr.createdAt).getTime() > new Date(prev.timestamp || prev.createdAt).getTime()
                                        ? curr
                                        : prev
                                )
                                : null);

                        return {
                            ...user,
                            lastMessage,
                            chatId: chat.id,
                        };
                    })
                    .filter(Boolean) as (UserProps & { lastMessage?: MessageProps; chatId?: number })[];

                const mergedResults = Array.from(
                    new Map<string, UserProps & { lastMessage?: MessageProps; chatId?: number }>(
                        [...userResults, ...chatResults].map(user => [user.id.toString(), user])
                    ).values()
                ).sort((a: UserProps & { lastMessage?: MessageProps }, b: UserProps & { lastMessage?: MessageProps }) => {
                    const timeA: number = a.lastMessage?.timestamp
                        ? new Date(a.lastMessage.timestamp).getTime()
                        : 0;
                    const timeB: number = b.lastMessage?.timestamp
                        ? new Date(b.lastMessage.timestamp).getTime()
                        : 0;
                    return timeB - timeA;
                });

                setSearchResults(mergedResults);
            } catch (error) {
                console.error("Ошибка поиска пользователей:", error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleCloseSettings = () => {
        setActiveScreen('chats');
        setIsSidebarOpen(false);
    };

    const headerHeight = 68; // Общая высота заголовков
    const borderStyle = '1px solid rgba(0, 168, 255, 0.3)';
    const gradientBorder = 'linear-gradient(90deg, transparent 0%, rgba(0, 168, 255, 0.4) 50%, transparent 100%)';
    const backdropStyles = {
        backgroundColor: 'rgba(0, 22, 45, 0.85)',
        backdropFilter: 'blur(20px)',
    };


    return (
        <CssVarsProvider defaultMode="dark">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "auto",
                    maxWidth: "100%",
                    background: 'radial-gradient(circle at center, #0a192f 0%, #081428 100%)',
                    minHeight: '100vh',
                }}
            >
                {activeScreen === 'settings' ? (
                    <SettingsScreen onBack={handleCloseSettings} />
                ) : activeScreen === 'language' ? (
                    <LanguageScreen onBack={() => setActiveScreen('settings')} />
                ) : (
                    <>
                        {/* Header Section */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                height: `${headerHeight}px`,
                                width: "100%",
                                flexShrink: 0,
                                borderBottom: borderStyle,
                                position: 'relative',
                                ...backdropStyles,
                                '&:after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '1px',
                                    background: gradientBorder,
                                },
                            }}
                        >
                            <IconButton
                                component={motion.div}
                                whileHover={{ scale: 1.05 }}
                                sx={{
                                    mr: 2,
                                    ml: "16px",
                                    color: '#00a8ff',
                                    bgcolor: isSidebarOpen ? 'rgba(0, 168, 255, 0.1)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 168, 255, 0.2)',
                                    },
                                }}
                                onClick={() => {
                                    setIsSidebarOpen(!isSidebarOpen);
                                    setActiveScreen('chats');
                                }}
                            >
                                <MenuIcon />
                            </IconButton>

                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Input
                                    size="sm"
                                    startDecorator={isConnecting ?
                                        <CircularProgress size="sm" sx={{ color: '#00a8ff' }} /> :
                                        <SearchRoundedIcon sx={{ color: '#00a8ff' }} />
                                    }
                                    onChange={handleSearchChange}
                                    value={searchTerm}
                                    aria-label={isConnecting ? "Connecting" : "Search"}
                                    placeholder={isConnecting ? t("Connecting") : t("Search")}
                                    sx={{
                                        flex: 1,
                                        maxWidth: "600px",
                                        minWidth: "420px",
                                        height: "40px",
                                        fontSize: "16px",
                                        bgcolor: 'rgba(0, 168, 255, 0.05)',
                                        borderColor: 'rgba(0, 168, 255, 0.3)',
                                        color: '#a0d4ff',
                                        '&:focus-within': {
                                            borderColor: '#00a8ff',
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Sidebar */}
                        <Box
                            component={motion.div}
                            initial={false}
                            animate={{
                                maxHeight: isSidebarOpen ? "400px" : "0px",
                                opacity: isSidebarOpen ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            sx={{
                                position: "absolute",
                                top: "56px",
                                left: 0,
                                width: "auto",
                                zIndex: 9,
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(0, 168, 255, 0.3)',
                                boxShadow: '0 8px 32px rgba(0, 168, 255, 0.2)',
                                borderRadius: 'lg',
                                overflow: "hidden",
                                ml: 2,
                            }}
                        >
                            <Sidebar
                                isOpen={isSidebarOpen}
                                onClose={() => setIsSidebarOpen(false)}
                                setActiveScreen={setActiveScreen}
                            />
                        </Box>

                        {/* Chat List */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                overflowY: "auto",
                                maxWidth: "100%",
                                pb: 2,
                                px: 2,
                            }}
                        >
                            {searchResults.length > 0 ? (
                                <List sx={{ gap: 1 }}>
                                    {searchResults
                                        .filter((user) => user.id !== currentUser.id)
                                        .map((user) => (
                                            <motion.div
                                                key={user.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <ChatListItem
                                                    id={user.id.toString()}
                                                    sender={user}
                                                    messages={user.lastMessage ? [{ ...user.lastMessage }] : []}
                                                    setSelectedChat={setSelectedChat}
                                                    currentUserId={currentUser.id}
                                                    chats={chats}
                                                    setChats={setChats}
                                                />
                                            </motion.div>
                                        ))}
                                </List>
                            ) : chats.length > 0 ? (
                                <List sx={{ gap: 1 }}>
                                    {chats.map((chat) => (
                                        <motion.div
                                            key={chat.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <ChatListItem
                                                id={chat.id.toString()}
                                                sender={
                                                    chat.isGroup
                                                        ? undefined
                                                        : chat.users.find((user) => user.id !== currentUser.id)
                                                }
                                                messages={chat.messages || []}
                                                setSelectedChat={setSelectedChat}
                                                currentUserId={currentUser.id}
                                                chats={chats}
                                                setChats={setChats}
                                                selectedChatId={selectedChatId}
                                                isGroup={chat.isGroup}
                                            />
                                        </motion.div>
                                    ))}
                                </List>
                            ) : (
                                <Typography
                                    sx={{
                                        textAlign: "center",
                                        mt: 3,
                                        color: '#a0d4ff',
                                        background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {t('')}
                                </Typography>
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </CssVarsProvider>
    );
}
