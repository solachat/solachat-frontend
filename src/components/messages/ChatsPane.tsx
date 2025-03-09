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

type ChatsPaneProps = {
    chats: ChatProps[];
    setSelectedChat: (chat: ChatProps) => void;
    selectedChatId: string;
    currentUser: { id: number };
};

export default function ChatsPane({ chats: initialChats, setSelectedChat, selectedChatId, currentUser }: ChatsPaneProps) {
    const {t} = useTranslation();
    const [chats, setChats] = useState<ChatProps[]>(initialChats);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<(UserProps & { lastMessage?: MessageProps; chatId?: number })[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [activeScreen, setActiveScreen] = useState<'chats' | 'settings'>('chats');

    const {wsRef, isConnecting} = useWebSocket((data) => {
        console.log("Received WebSocket message:", data);
        if (data.type === 'chatCreated' || data.type === 'groupChatCreated') {
            const newChat = data.chat;
            setChats((prevChats) => {
                if (prevChats.some((chat) => chat.id === newChat.id)) return prevChats;
                return [...prevChats, newChat].sort((a, b) => b.id - a.id);
            });
        }

        if (data.type === 'chatDeleted') {
            setChats((prevChats) => prevChats.filter((chat) => chat.id !== data.chatId));
            navigate('/chat');
        }

        if (data.type === 'newMessage') {
            const newMessage = data.message;

            setChats((prevChats) => {
                let chatExists = false;

                console.log("📩 Получено новое сообщение в чат:", newMessage.chatId);
                console.log("📝 Чаты до обновления:", prevChats.map(chat => chat.id));

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

                    const aUpdated = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                    const bUpdated = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                    return bUpdated - aUpdated;
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
            setChats((prevChats) => {
                const updatedChats = prevChats.map((chat) => ({
                    ...chat,
                    users: (chat.users || []).map((user) =>
                        user.public_key === data.publicKey ? { ...user, online: true } : user
                    ),
                }));
                console.log("Updated chats:", updatedChats);
                return updatedChats;
            });
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
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Authorization token is missing');

                const chatsFromServer: ChatProps[] = await fetchChatsFromServer(currentUser.id, token);
                setChats(chatsFromServer || []);

                // Сохраняем сессионный ключ для каждого чата, если он есть
                chatsFromServer.forEach(chat => {
                    if (chat.session && chat.session.sessionKey) {
                        localStorage.setItem(`sessionKey-${chat.id}`, chat.session.sessionKey);
                        console.log(`🔑 Ключ для чата ${chat.id} сохранён в localStorage.`);
                    }
                });
            } catch (error) {
                console.error(error);
                setError('Failed to fetch chats');
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
                        console.log(`Chat ${chat.id} messages:`, chat.messages); // отладка: что приходит в messages

                        const user = chat.users.find(user => user.id !== currentUser.id);
                        if (!user) return null;

                        // Если chat.lastMessage не установлен, вычисляем последнее сообщение по максимальной дате
                        const lastMessage =
                            chat.lastMessage ||
                            (chat.messages && chat.messages.length > 0
                                ? chat.messages.reduce((prev: MessageProps, curr: MessageProps) =>
                                    new Date(curr.createdAt).getTime() > new Date(prev.createdAt).getTime() ? curr : prev
                                )
                                : null);

                        console.log(`Chat ${chat.id} lastMessage:`, lastMessage); // отладка: что получилось

                        return {
                            ...user,
                            lastMessage,
                            chatId: chat.id,
                        };
                    })
                    .filter(Boolean) as (UserProps & { lastMessage?: MessageProps; chatId?: number })[];


                const mergedResults = Array.from(
                    new Map([...chatResults, ...userResults].map(user => [user.id, user])).values()
                );

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

    return (
        <CssVarsProvider>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "auto",
                    maxWidth: "100%",

                }}
            >
                {activeScreen === 'settings' ? (
                    <SettingsScreen onBack={handleCloseSettings} />
                ) : (
                    <>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        height: "56px",
                        width: "100%",
                        flexShrink: 0,
                    }}
                >
                    <IconButton
                        sx={{
                            borderRadius: '50%',
                            mr: 2,
                            ml: "16px",
                            backgroundColor: isSidebarOpen ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
                            startDecorator={isConnecting ? <CircularProgress size="sm" /> : <SearchRoundedIcon />}
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
                                borderRadius: "12px",
                                textAlign: "center",
                            }}
                        />
                    </Box>
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        top: "56px",
                        left: 0,
                        width: "auto",
                        zIndex: 9,
                        borderRadius: "12px",
                        boxShadow: "4px 4px 20px rgba(0, 0, 0, 0.5)",
                        maxHeight: isSidebarOpen ? "400px" : "0px",
                        opacity: isSidebarOpen ? 1 : 0,
                        overflow: "hidden",
                        transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
                        ml: 2,
                    }}
                >
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        setActiveScreen={setActiveScreen}
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        overflowY: "auto",
                        maxWidth: "100%",
                        pb: 2,
                    }}
                >
                    {searchResults.length > 0 ? (
                        <List>
                            {searchResults
                                .filter((user) => user.id !== currentUser.id)
                                .map((user) => (
                                    <ChatListItem
                                        key={user.id}
                                        id={user.id.toString()}
                                        sender={user}
                                        messages={user.lastMessage ? [user.lastMessage] : []}
                                        setSelectedChat={setSelectedChat}
                                        currentUserId={currentUser.id}
                                        chats={chats}
                                        setChats={setChats}
                                    />
                                ))}
                        </List>
                    ) : chats.length > 0 ? (
                        <List>
                            {chats.map((chat) => (
                                <ChatListItem
                                    key={chat.id}
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
                            ))}
                        </List>
                    ) : (
                        <Typography sx={{ textAlign: "center", mt: 3 }}>{t("")}</Typography>
                    )}
                </Box>
                    </>
                    )}
            </Box>
        </CssVarsProvider>
    );
}
