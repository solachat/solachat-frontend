import * as React from 'react';
import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import {IconButton, Stack, Typography, Avatar, Modal, ModalDialog} from '@mui/joy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileUploadModal from './FileUploadModal';
import {sendMessage, editMessage, createPrivateChat, sendMessageViaSecuLine} from '../../api/api';
import { useState, useCallback, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import CustomTextarea from "./CustomTextarea";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import EmojiPickerPopover from "./EmojiPickerPopover";
import {toast} from "react-toastify";
import {ChatProps, MessageProps} from "../core/types";
import {motion} from "framer-motion";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {useWebSocket} from "../../api/useWebSocket";

export type UploadedFileData = {
    file: File;
};

export type MessageInputProps = {
    chatId: number | null;
    selectedChat: ChatProps | null;
    setSelectedChat: (chat: ChatProps) => void;
    currentUserId: number;
    onSubmit: (newMessage: any) => void;
    editingMessage?: { id: number | null; content: string | null } | null;
    setEditingMessage: (message: { id: number | null; content: string | null } | null) => void;
};

export default function MessageInput(props: MessageInputProps): JSX.Element | null {
    const { t } = useTranslation();
    const {
        chatId, selectedChat, setSelectedChat, currentUserId,
        editingMessage, setEditingMessage, onSubmit
    } = props;

    const [message, setMessage] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]);
    const [isFileUploadOpen, setFileUploadOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const navigate = useNavigate();
    const { wsRef } = useWebSocket(() => {});
    const handleFileSelect = useCallback((file: File) => {
        setUploadedFiles((prevFiles) => [...prevFiles, { file }]);
    }, []);

    const removeUploadedFile = useCallback((index: number) => {
        setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }, []);

    const handleImageClick = (imageUrl: string) => {
        setImageSrc(imageUrl);
        setIsImageOpen(true);
    };

    const handleVideoClick = (src: string) => {
        setVideoSrc(src);
        setIsVideoOpen(true);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsImageOpen(false);
            setIsVideoOpen(false);
            setIsClosing(false);
        }, 100);
    };

    useEffect(() => {
        if (editingMessage?.content) {
            setMessage(editingMessage.content);
        } else {
            setMessage("");
        }
        setUploadedFiles([]);
    }, [editingMessage, chatId]);

    const [isSending, setIsSending] = useState(false);
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("❌ Токен отсутствует");
        return null; // ✅ корректно для React-компонентов
    }

    const decoded: any = jwtDecode(token);
    const userPublicKey = decoded.public_key;

    const sessionMap: Record<number, string> = {};

    const getSessionIdForChat = async (chatId: number): Promise<string | null> => {
        return sessionMap[chatId] || null;
    };

    const setSessionIdForChat = (chatId: number, sessionId: string) => {
        sessionMap[chatId] = sessionId;
    };


    const handleClick = async () => {
        if (isSending) return;
        setIsSending(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("❌ Ошибка: Authorization token is missing");
                return;
            }

            const decoded: any = jwtDecode(token);
            const userPublicKey = decoded.public_key;

            const content = message.trim();
            if (content === "" && uploadedFiles.length === 0) {
                console.warn("⚠️ Нельзя отправить пустое сообщение");
                return;
            }

            let finalChatId = selectedChat?.id;

            if (editingMessage && editingMessage.id !== null) {
                console.log("✏️ Обновление сообщения:", editingMessage.id);

                const updatedMessage = await editMessage(editingMessage.id as number, content, token);

                if (updatedMessage) {
                    console.log("✅ Сообщение обновлено:", updatedMessage);

                    onSubmit((prevMessages: MessageProps[]) =>
                        prevMessages.map((msg: MessageProps) =>
                            msg.id === editingMessage.id ? { ...msg, content: updatedMessage.content } : msg
                        )
                    );
                } else {
                    console.error("❌ Ошибка при обновлении сообщения");
                }

                setEditingMessage(null);
                setMessage("");
                setIsSending(false);
                return;
            }

            if (!finalChatId || finalChatId === -1) {
                const recipientId = Number(window.location.hash.replace("#", ""));

                if (!recipientId || recipientId === currentUserId) {
                    console.error("❌ Ошибка: Получатель не найден.");
                    return;
                }

                console.log(`🔄 Создаем новый чат с userId ${recipientId} перед отправкой...`);
                const newChat = await createPrivateChat(currentUserId, recipientId, token);

                if (!newChat || !newChat.id) {
                    console.error("❌ Ошибка: Сервер не вернул ID нового чата!");
                    return;
                }

                finalChatId = newChat.id;

                console.log(`✅ Чат создан с ID: ${newChat.id}, обновляем selectedChat.`);

                if (!selectedChat || selectedChat.id !== newChat.id) {
                    console.log(`🔄 Устанавливаем selectedChat: ${newChat.id}`);
                    setSelectedChat(newChat);
                }

                navigate(`/chat/#${recipientId}`);
            }

            if (!finalChatId) {
                console.error("❌ Ошибка: Chat ID отсутствует. Сообщение не отправлено.");
                return;
            }

            const tempId = Date.now();
            console.log(`📝 Создано временное сообщение с tempId: ${tempId}`);

            const optimisticFiles = uploadedFiles.map(fileData => ({
                fileName: fileData.file.name,
                filePath: URL.createObjectURL(fileData.file),
                fileType: fileData.file.type,
            }));

            const optimisticMessage = {
                id: tempId,
                chatId: finalChatId,
                userId: currentUserId,
                content,
                createdAt: new Date().toISOString(),
                pending: true,
                isRead: false,
                attachment: optimisticFiles.length > 0 ? optimisticFiles : [],
            };

            console.log("📩 Добавляем оптимистичное сообщение в UI:", optimisticMessage);
            onSubmit(optimisticMessage);

            const pendingMessages = JSON.parse(localStorage.getItem("pendingMessages") || "[]");
            localStorage.setItem("pendingMessages", JSON.stringify([...pendingMessages, optimisticMessage]));


            const sessionId = await getSessionIdForChat(finalChatId);
            if (!sessionId) {
                console.error("❌ Сессия для чата не найдена");
                return;
            }

            if (!wsRef) return;
            await sendMessageViaSecuLine(finalChatId, content, userPublicKey, sessionId, wsRef);


            const updatedPendingMessages = JSON.parse(localStorage.getItem("pendingMessages") || "[]")
                .filter((msg: any) => msg.id !== tempId);
            localStorage.setItem("pendingMessages", JSON.stringify(updatedPendingMessages));

            console.log("🧹 Очищаем поле ввода");
            setMessage("");
            setUploadedFiles([]);
        } catch (error) {
            console.error("❌ Ошибка при отправке сообщения:", error);
        } finally {
            setIsSending(false);
        }
    };


    const handleEmojiSelect = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        setAnchorEl(null);
    };

    const toggleEmojiMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const keyboardOption = sessionStorage.getItem("keyboardOption") || "enter";

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (keyboardOption === 'ctrlEnter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleClick();
            } else if (keyboardOption === 'enter' && !e.shiftKey) {
                e.preventDefault();
                handleClick();
            }
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) {
                    handleFileSelect(file);
                }
            }
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        setIsDragging(false);
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => handleFileSelect(file));
            event.dataTransfer.clearData();
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };


    return (
        <Box
            sx={{ position: 'relative', px: 2, pb: 1 }}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {isDragging && (
                <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0, 168, 255, 0.1)',
                        color: '#00a8ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        zIndex: 20,
                        border: '2px dashed rgba(0, 168, 255, 0.3)',
                        borderRadius: 'lg',
                    }}
                >
                    {t('Drop your files here')}
                </Box>
            )}

            <FormControl sx={{ position: 'sticky', zIndex: 10 }}>
                <Stack
                    direction="column"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        border: '1px solid rgba(0, 168, 255, 0.3)',
                        borderRadius: 'lg',
                        padding: '8px',
                        bgcolor: 'rgba(0, 168, 255, 0.05)',
                        maxWidth: '100%',
                        boxShadow: '0 4px 16px rgba(0, 168, 255, 0.1)',
                    }}
                >
                    {editingMessage && editingMessage.content && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                                width: '100%',
                                height: '100%',
                                padding: '8px',
                                borderRadius: 'lg',
                                marginBottom: '8px',

                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EditIcon
                                    sx={{
                                        marginRight: '20px',
                                        marginLeft: '5px',
                                        color: '#00a8ff',
                                        fontSize: '1.50rem',
                                    }}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography sx={{ color: '#00a8ff' }}>{t('Editing')}</Typography>
                                    <Typography
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '1000px',
                                            color: '#a0d4ff',
                                        }}
                                    >
                                        {editingMessage.content}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton
                                size="sm"
                                onClick={() => setEditingMessage(null)}
                                sx={{ color: '#00a8ff' }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    )}

                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ width: '100%' }}
                    >
                        <IconButton
                            size="sm"
                            variant="plain"
                            sx={{
                                mr: 1,
                                color: '#00a8ff',
                                '&:hover': { bgcolor: 'rgba(0, 168, 255, 0.1)' }
                            }}
                            onClick={() => setFileUploadOpen(true)}
                        >
                            <AttachFileIcon />
                        </IconButton>

                        <CustomTextarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('writeMessage')}
                            onKeyDown={handleKeyDown}
                            sx={{
                                flexGrow: 1,
                                minHeight: 'auto',
                                resize: 'none',
                                maxWidth: '100%',
                                border: 'none',
                                outline: 'none',
                                color: '#a0d4ff',
                                bgcolor: 'transparent',
                                '&::placeholder': { color: '#8ab4f8' },
                                '--Textarea-focusedHighlight': 'transparent',
                                '&:focus': { outline: 'none', boxShadow: 'none' },
                            }}
                        />

                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <IconButton
                                sx={{ color: '#00a8ff', '&:hover': { bgcolor: 'rgba(0, 168, 255, 0.1)' } }}
                                onClick={toggleEmojiMenu}
                            >
                                <EmojiEmotionsIcon />
                            </IconButton>
                            <EmojiPickerPopover
                                onEmojiSelect={handleEmojiSelect}
                                anchorEl={anchorEl}
                                onClose={() => setAnchorEl(null)}
                            />
                        </Box>

                        <IconButton
                            size="sm"
                            sx={{
                                ml: 1,
                                color: (message.trim() !== '' || uploadedFiles.length > 0) ? '#00a8ff' : '#8ab4f8',
                                '&:hover': { bgcolor: 'rgba(0, 168, 255, 0.1)' }
                            }}
                            onClick={handleClick}
                        >
                            <SendRoundedIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </FormControl>

            {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Stack direction="row" flexWrap="wrap" spacing={2} sx={{ mt: 1 }}>
                        {uploadedFiles.map((file, index) => {
                            const isImage = file.file.type.startsWith('image/');
                            const isVideo = file.file.type.startsWith('video/');
                            const fileUrl = URL.createObjectURL(file.file);

                            return (
                                <Box
                                    key={index}
                                    component={motion.div}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                        border: '1px solid rgba(0, 168, 255, 0.3)',
                                        borderRadius: 'lg',
                                        bgcolor: 'rgba(0, 168, 255, 0.05)',
                                        minWidth: '200px',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {isImage ? (
                                            <Avatar
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '4px',
                                                    objectFit: 'cover',
                                                    cursor: 'pointer',
                                                    border: '1px solid rgba(0, 168, 255, 0.3)',
                                                }}
                                                src={fileUrl}
                                                alt="preview"
                                                onClick={() => handleImageClick(fileUrl)}
                                            />
                                        ) : isVideo ? (
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: '1px solid rgba(0, 168, 255, 0.3)',
                                                }}
                                                onClick={() => handleVideoClick(fileUrl)}
                                            >
                                                <video width="40" height="40" style={{ objectFit: 'cover' }}>
                                                    <source src={fileUrl} type={file.file.type} />
                                                </video>
                                            </Box>
                                        ) : (
                                            <Avatar sx={{ bgcolor: 'rgba(0, 168, 255, 0.1)', color: '#00a8ff' }}>
                                                <InsertDriveFileIcon />
                                            </Avatar>
                                        )}
                                        <Typography noWrap sx={{ maxWidth: '120px', color: '#a0d4ff' }}>
                                            {file.file.name}
                                        </Typography>
                                    </Stack>
                                    <IconButton
                                        onClick={() => removeUploadedFile(index)}
                                        size="sm"
                                        sx={{ color: '#00a8ff' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            {isImageOpen && imageSrc && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999,
                        cursor: 'pointer',
                        animation: `${isClosing ? 'fade-out' : 'fade-in'} 0.2s ease-in-out`,
                    }}
                    onClick={handleClose}
                >
                    <Box sx={{                            position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center', }}>
                        <img
                            src={imageSrc}
                            alt="attachment-preview"
                            style={{
                                maxWidth: '70%',
                                maxHeight: '70%',
                                height: 'auto',
                                objectFit: 'contain',
                            }}
                        />
                    </Box>
                </Box>
            )}

            {isVideoOpen && videoSrc && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        fleft: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999,
                        cursor: 'pointer',
                    }}
                    onClick={handleClose}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <video
                            controls
                            autoPlay
                            style={{
                                maxWidth: '70%',
                                maxHeight: '70%',
                                height: 'auto',
                                objectFit: 'contain',
                            }}
                        >
                            <source src={videoSrc} type="video/mp4" />
                        </video>
                    </Box>
                </Box>
            )}

            <FileUploadModal
                open={isFileUploadOpen}
                handleClose={() => setFileUploadOpen(false)}
                onFileSelect={handleFileSelect}
            />
        </Box>
    );
}
