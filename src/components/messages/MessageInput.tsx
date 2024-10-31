import * as React from 'react';
import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import { IconButton, Stack, Typography, Avatar, Textarea } from '@mui/joy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileUploadModal from './FileUploadModal';
import { sendMessage, editMessage } from '../../api/api';
import { useState, useCallback, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CustomTextarea from "./CustomTextarea";

export type UploadedFileData = {
    file: File;
};

export type MessageInputProps = {
    chatId: number;
    onSubmit: (newMessage: any) => void;
    editingMessage?: { id: number | null; content: string | null } | null;
    setEditingMessage: (message: { id: number | null; content: string | null } | null) => void;
};

export default function MessageInput(props: MessageInputProps) {
    const { t } = useTranslation();
    const { chatId, editingMessage, setEditingMessage, onSubmit } = props;

    const [message, setMessage] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]);
    const [isFileUploadOpen, setFileUploadOpen] = useState(false);

    useEffect(() => {
        if (editingMessage?.content) {
            setMessage(editingMessage.content);
        } else {
            setMessage("");
        }
        setUploadedFiles([]);
    }, [editingMessage, chatId]);

    const handleClick = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Authorization token is missing');
            return;
        }

        const content = message.trim();
        if (content === '' && uploadedFiles.length === 0) {
            console.warn('Cannot send an empty message');
            return;
        }

        try {
            if (editingMessage && editingMessage.id) {
                await editMessage(editingMessage.id, content, token);
                setEditingMessage(null);
            } else {
                const formData = new FormData();
                formData.append('content', content);
                uploadedFiles.forEach((fileData) => formData.append('file', fileData.file));
                await sendMessage(chatId, formData, token);
            }

            setMessage("");
            setUploadedFiles([]);
        } catch (error) {
            console.error('Error sending or editing message:', error);
        }
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

    return (
        <Box sx={{ position: 'relative', px: 3, pb: 1 }}>
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


                        <IconButton
                            size="sm"
                            sx={{ ml: 1 }}
                        >
                            <EmojiEmotionsIcon />
                        </IconButton>
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
                        {uploadedFiles.map((file, index) => (
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
                                    <Avatar sx={{ backgroundColor: 'primary.main' }}>
                                        <InsertDriveFileIcon />
                                    </Avatar>
                                    <Typography noWrap sx={{ maxWidth: '120px' }}>
                                        {file.file.name}
                                    </Typography>
                                </Stack>
                                <IconButton onClick={() => removeUploadedFile(index)} size="sm">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Stack>
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
