import * as React from 'react';
import { Editor, EditorState, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import { IconButton, Stack, Typography, Avatar } from '@mui/joy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileUploadModal from './FileUploadModal';
import { sendMessage, editMessage } from '../../api/api';
import { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

export type UploadedFileData = {
    file: File;
};

export type MessageInputProps = {
    chatId: number;
    textAreaValue: string;
    setTextAreaValue: (value: string) => void;
    onSubmit: (newMessage: any) => void;
    editingMessage?: { id: number | null, content: string | null } | null;
    setEditingMessage: (message: { id: number | null, content: string | null } | null) => void;
};

export default function MessageInput(props: MessageInputProps) {
    const { setTextAreaValue, chatId, textAreaValue, editingMessage, setEditingMessage } = props;

    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const editorRef = useRef<Editor | null>(null);
    const [isFileUploadOpen, setFileUploadOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]);

    // Обработчик изменения редактора
    const handleEditorChange = (newState: EditorState) => {
        setEditorState(newState);
        const currentContent = newState.getCurrentContent().getPlainText();
        console.log('Editor content:', currentContent); // Логирование содержимого редактора
        setTextAreaValue(currentContent); // Обновляем состояние с текстом
    };

    const keyBindingFn = (e: React.KeyboardEvent): string | null => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleClick();
            return 'submit-message';
        }
        return getDefaultKeyBinding(e);
    };

    const handleClick = async () => {
        if (textAreaValue.trim() !== '' || uploadedFiles.length > 0) {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authorization token is missing');
                return;
            }

            const formData = new FormData();
            formData.append('content', textAreaValue);
            uploadedFiles.forEach((fileData, index) => {
                formData.append('file', fileData.file);
            });

            try {
                await sendMessage(chatId, formData, token);
                setTextAreaValue('');
                setEditorState(EditorState.createEmpty());
                setUploadedFiles([]);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };


    const handleFileSelect = (file: File) => {
        setUploadedFiles((prevFiles) => [...prevFiles, { file }]);
    };

    const removeUploadedFile = (index: number) => {
        setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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
                    }}
                >
                    {editingMessage && editingMessage.content && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                                width: '100%',
                                height: '40px',
                                padding: '8px',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                mr: '1px',
                                overflow: 'hidden',
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
                                <Typography>
                                    Редактирование <br /> {editingMessage.content}
                                </Typography>
                            </Box>
                            <IconButton
                                size="sm"
                                onClick={() => setEditingMessage(null)}
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
                            color="neutral"
                            onClick={() => setFileUploadOpen(true)}
                            sx={{ mr: 1 }}
                        >
                            <AttachFileIcon />
                        </IconButton>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                flexGrow: 1,
                                minHeight: 'auto',
                                cursor: 'text',
                                paddingLeft: '10px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%',
                            }}
                            onClick={() => editorRef.current?.focus()}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    maxWidth: '800px',
                                    minWidth: '300px',
                                }}
                            >
                                <Editor
                                    editorState={editorState}
                                    keyBindingFn={keyBindingFn}
                                    onChange={handleEditorChange}
                                    placeholder="Write a message..."
                                    ref={editorRef}
                                    spellCheck={true}
                                    stripPastedStyles={true}
                                />
                            </Box>
                        </Box>

                        <IconButton
                            size="sm"
                            color="primary"
                            onClick={handleClick}
                            sx={{
                                ml: 1,
                                opacity: textAreaValue.trim() !== '' || uploadedFiles.length > 0 ? 1 : 0,
                                transition: 'opacity 0.1s ease',
                            }}
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
                                    justifyContent: 'space-between',
                                    padding: '8px 16px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: '8px',
                                    backgroundColor: 'background.level2',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
                                    minWidth: '200px',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.1)',
                                    },
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
