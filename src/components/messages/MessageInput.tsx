import * as React from 'react';
import { useState } from 'react';
import { Editor, EditorState, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useTranslation } from 'react-i18next';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import { IconButton, Stack, Typography } from '@mui/joy';
import UploadIcon from '@mui/icons-material/Upload';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import FileUploadModal from './FileUploadModal';
import CloseIcon from '@mui/icons-material/Close';
import { sendMessage } from '../../api/api';

export type UploadedFileData = {
    filePath: string;  // Теперь это единственное свойство
};

export type MessageInputProps = {
    chatId: number;
    textAreaValue: string;
    setTextAreaValue: (value: string) => void;
    onSubmit: (newMessage: any) => void;
};

export default function MessageInput(props: MessageInputProps) {
    const { t } = useTranslation();
    const { setTextAreaValue, chatId } = props;
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const editorRef = React.useRef<Editor | null>(null);
    const [isFileUploadOpen, setFileUploadOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]);  // Список загруженных файлов
    const [messageFromModal, setMessageFromModal] = useState<string>('');

    const handleEditorChange = (newState: EditorState) => {
        setEditorState(newState);
        const currentContent = newState.getCurrentContent().getPlainText();
        setTextAreaValue(currentContent);
    };

    const keyBindingFn = (e: React.KeyboardEvent): string | null => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleClick();
            return 'submit-message';
        }
        return getDefaultKeyBinding(e);
    };

    const handleClick = async () => {
        if (!chatId || isNaN(chatId)) {
            console.error('Invalid chatId:', chatId);
            return;
        }

        if (props.textAreaValue.trim() !== '' || uploadedFiles.length > 0) {
            const token = localStorage.getItem('token');
            try {
                const filePaths = uploadedFiles.map((fileData) => fileData.filePath); // Получаем все пути к файлам
                const newMessage = await sendMessage(
                    chatId,
                    messageFromModal || props.textAreaValue,
                    token as string,
                    filePaths.length > 0 ? filePaths[0] : undefined // Отправляем путь к первому файлу
                );
                setTextAreaValue('');
                setEditorState(EditorState.createEmpty());
                setUploadedFiles([]);  // Очищаем загруженные файлы
                setMessageFromModal('');
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
            }
        }
    };

    const handleFileUploadSuccess = (filePath: string) => {
        console.log('File uploaded successfully, filePath:', filePath);
        setUploadedFiles((prevFiles) => [...prevFiles, { filePath }]);
    };

    const removeUploadedFile = (index: number) => {
        setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <Box sx={{ px: 2, pb: 3 }}>
            <FormControl>
                <Box
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        padding: '8px',
                        minHeight: '100px',
                        cursor: 'text',
                        textAlign: 'left',
                    }}
                    onClick={() => editorRef.current?.focus()}
                >
                    <Editor
                        editorState={editorState}
                        keyBindingFn={keyBindingFn}
                        onChange={handleEditorChange}
                        placeholder={t('Type something here…')}
                        ref={editorRef}
                    />
                </Box>

                {uploadedFiles.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            mt: 2,
                            gap: 1,
                        }}
                    >
                        {uploadedFiles.map((fileData, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: 'background.level2',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    minWidth: '120px',
                                    maxWidth: '150px',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.875rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100px',
                                    }}
                                >
                                    {fileData.filePath.split('/').pop()}
                                </Typography>
                                <IconButton size="sm" color="danger" onClick={() => removeUploadedFile(index)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexGrow={1}
                    sx={{
                        py: 1,
                        pr: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <IconButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        onClick={() => setFileUploadOpen(true)}
                    >
                        <UploadIcon />
                    </IconButton>
                    <Button
                        size="sm"
                        color="primary"
                        sx={{ alignSelf: 'center', borderRadius: 'sm' }}
                        endDecorator={<SendRoundedIcon />}
                        onClick={handleClick}
                    >
                        {t('Send')}
                    </Button>
                </Stack>
            </FormControl>

            <FileUploadModal
                chatId={chatId}
                open={isFileUploadOpen}
                handleClose={() => setFileUploadOpen(false)}
                onFileUploadSuccess={handleFileUploadSuccess}
            />
        </Box>
    );
}
