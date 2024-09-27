import * as React from 'react';
import { Editor, EditorState, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useTranslation } from 'react-i18next';
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
    filePath: string;
};

export type MessageInputProps = {
    chatId: number;
    textAreaValue: string;
    setTextAreaValue: (value: string) => void;
    onSubmit: (newMessage: any) => void;
    editingMessage: { id: number | null, content: string | null } | null;
    setEditingMessage: (message: { id: number | null, content: string | null } | null) => void;
};

export default function MessageInput(props: MessageInputProps) {
    const { t } = useTranslation();
    const { setTextAreaValue, chatId, textAreaValue, editingMessage, setEditingMessage } = props;

    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const editorRef = useRef<Editor | null>(null);
    const [isFileUploadOpen, setFileUploadOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]);

    // Обработчик изменений в редакторе текста
    const handleEditorChange = (newState: EditorState) => {
        setEditorState(newState);
        const currentContent = newState.getCurrentContent().getPlainText();
        setTextAreaValue(currentContent);
    };

    // Обработка нажатий клавиш, включая отправку по Enter
    const keyBindingFn = (e: React.KeyboardEvent): string | null => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleClick(); // Отправляем сообщение при нажатии Enter
            return 'submit-message';
        }
        return getDefaultKeyBinding(e);
    };

    // Обработчик отправки или редактирования сообщения
    const handleClick = async () => {
        if (!chatId || isNaN(chatId)) {
            console.error('Invalid chatId:', chatId);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Authorization token is missing');
            return;
        }

        if (editingMessage && editingMessage.id !== null) {
            // Если редактируем сообщение
            try {
                await editMessage(editingMessage.id, textAreaValue, token);
                setTextAreaValue(''); // Очищаем текстовое поле
                setEditorState(EditorState.createEmpty()); // Очищаем Draft.js редактор
                setUploadedFiles([]); // Очищаем файлы после отправки
                setEditingMessage(null); // Сбрасываем редактируемое сообщение
            } catch (error) {
                console.error('Ошибка при редактировании сообщения:', error);
            }
        } else {
            // Отправка нового сообщения
            if (textAreaValue.trim() !== '' || uploadedFiles.length > 0) {
                try {
                    const filePaths = uploadedFiles.map((fileData) => fileData.filePath);
                    const newMessage = await sendMessage(
                        chatId,
                        textAreaValue,
                        token as string,
                        filePaths.length > 0 ? filePaths[0] : undefined
                    );
                    setTextAreaValue(''); // Очищаем текстовое поле
                    setEditorState(EditorState.createEmpty()); // Очищаем Draft.js редактор
                    setUploadedFiles([]); // Очищаем файлы после отправки
                } catch (error) {
                    console.error('Ошибка при отправке сообщения:', error);
                }
            }
        }
    };

    // Обработчик успешной загрузки файла
    const handleFileUploadSuccess = (filePath: string) => {
        setUploadedFiles((prevFiles) => [...prevFiles, { filePath }]);
    };

    // Удаление файла из списка загруженных
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
                    {/* Если редактируемое сообщение есть, отображаем его над полем ввода */}
                    {editingMessage && editingMessage.content && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                                width: '100%',
                                height: '40px', // Установите фиксированную высоту
                                padding: '8px',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                mr: '1px',
                                overflow: 'hidden', // Скрыть переполнение
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

                    {/* Основное поле ввода */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ width: '100%' }}
                    >
                        {/* Иконка загрузки (скрепка) */}
                        <IconButton
                            size="sm"
                            variant="plain"
                            color="neutral"
                            onClick={() => setFileUploadOpen(true)}
                            sx={{ mr: 1 }}
                        >
                            <AttachFileIcon />
                        </IconButton>

                        {/* Текстовое поле */}
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
                                    placeholder={t('writeMessage')}
                                    ref={editorRef}
                                    spellCheck={true}
                                    stripPastedStyles={true}
                                />
                            </Box>
                        </Box>

                        {/* Плавное появление иконки отправки */}
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

            {/* Отображение прикрепленных файлов */}
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
                                        {file.filePath.split('/').pop()}
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

            {/* Модальное окно для загрузки файла */}
            <FileUploadModal
                chatId={chatId}
                open={isFileUploadOpen}
                handleClose={() => setFileUploadOpen(false)}
                onFileUploadSuccess={handleFileUploadSuccess}
            />
        </Box>
    );
}
