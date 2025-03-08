import * as React from 'react';
import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import {IconButton, Stack, Typography, Avatar, Modal, ModalDialog} from '@mui/joy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileUploadModal from './FileUploadModal';
import {sendMessage, editMessage, createPrivateChat} from '../../api/api';
import { useState, useCallback, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import CustomTextarea from "./CustomTextarea";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import EmojiPickerPopover from "./EmojiPickerPopover";
import {toast} from "react-toastify";
import {ChatProps} from "../core/types";

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

export default function MessageInput(props: MessageInputProps) {
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

    const handleImageClick = (imageUrl: string) => {
        setImageSrc(imageUrl);
        setIsImageOpen(true);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsImageOpen(false);
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


    const handleClick = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error('❌ Ошибка: Authorization token is missing');
            return;
        }

        const content = message.trim();
        if (content === '' && uploadedFiles.length === 0) {
            console.warn('⚠️ Нельзя отправить пустое сообщение');
            return;
        }

        try {
            let finalChatId = selectedChat?.id;

            console.log(`📌 Отправка сообщения. Текущий chatId: ${finalChatId}`);

            if (!finalChatId || finalChatId === -1) {
                const recipient = selectedChat?.users.find(user => user.id !== currentUserId);
                if (!recipient) {
                    console.error("❌ Ошибка: Получатель не найден.");
                    return;
                }

                console.log("🔄 Создаём новый чат перед отправкой...");
                const newChat = await createPrivateChat(currentUserId, recipient.id, token);
                finalChatId = newChat.id;
                setSelectedChat(newChat);
                console.log("✅ Новый чат создан:", newChat);
            }


            if (!finalChatId) {
                console.error("❌ Ошибка: Chat ID отсутствует. Сообщение не отправлено.");
                return;
            }

            console.log("📤 Отправляем сообщение в чат ID:", finalChatId);

            const formData = new FormData();
            formData.append('content', content);
            uploadedFiles.forEach(fileData => formData.append("file", fileData.file));

            await sendMessage(finalChatId, formData, token);

            setMessage('');
            setUploadedFiles([]);
            console.log(`✅ Сообщение успешно отправлено в чат ID: ${finalChatId}`);
        } catch (error) {
            console.error('❌ Ошибка при отправке сообщения:', error);
        }
    };


    const handleEmojiSelect = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        setAnchorEl(null);
    };

    const toggleEmojiMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleFileSelect = useCallback((file: File) => {
        setUploadedFiles((prevFiles) => [...prevFiles, { file }]);
    }, []);

    const removeUploadedFile = useCallback((index: number) => {
        setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleClick();
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
            sx={{ position: 'relative', px: 3, pb: 1 }}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {isDragging && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        zIndex: 20,
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
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        padding: '6px',
                        backgroundColor: 'background.level1',
                        maxWidth: '100%',
                    }}
                >
                    {editingMessage && editingMessage.content && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                padding: '8px',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                mr: '1px',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EditIcon
                                    sx={{
                                        marginRight: '20px',
                                        marginLeft: '5px',
                                        color: 'neutral.main',
                                        fontSize: '1.50rem',
                                    }}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography>{t('Editing')}</Typography>
                                    <Typography
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '1000px',
                                        }}
                                    >
                                        {editingMessage.content}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton size="sm" onClick={() => setEditingMessage(null)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    )}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                        <IconButton
                            size="sm"
                            variant="plain"
                            color="neutral"
                            onClick={() => setFileUploadOpen(true)}
                            sx={{ mr: 1 }}
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
                                boxShadow: 'none',
                                '--Textarea-focusedHighlight': 'transparent',
                                '&:focus': {
                                    outline: 'none',
                                    boxShadow: 'none',
                                },
                            }}
                        />

                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <IconButton onClick={toggleEmojiMenu}>
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
                            color={message.trim() !== '' || uploadedFiles.length > 0 ? 'primary' : 'neutral'}
                            onClick={handleClick}
                            sx={{ ml: 1 }}
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
                            const fileUrl = URL.createObjectURL(file.file);

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: '8px',
                                        backgroundColor: 'background.level2',
                                        minWidth: '200px',
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
                                                }}
                                                src={fileUrl}
                                                alt="preview"
                                                onClick={() => handleImageClick(fileUrl)}
                                            />
                                        ) : (
                                            <Avatar sx={{ backgroundColor: 'primary.main' }}>
                                                <InsertDriveFileIcon />
                                            </Avatar>
                                        )}
                                        <Typography noWrap sx={{ maxWidth: '120px' }}>
                                            {file.file.name}
                                        </Typography>
                                    </Stack>
                                    <IconButton onClick={() => removeUploadedFile(index)} size="sm">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            {/* Модальное окно с анимацией */}
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
                    <Box sx={{ position: 'relative', display: 'inline-flex', maxWidth: '90%', maxHeight: '90%' }}>
                        <img
                            src={imageSrc}
                            alt="attachment-preview"
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                            }}
                        />
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
