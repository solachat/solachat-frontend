import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalDialog, Typography, IconButton, Box } from '@mui/joy';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { uploadFileToChat } from '../../api/api';

interface FileUploadModalProps {
    chatId: number;
    onFileUploadSuccess: (filePath: string) => void; // Оставляем только filePath
    open: boolean;
    handleClose: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ chatId, onFileUploadSuccess, open, handleClose }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null); // Для хранения превью изображения

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            // Если файл является изображением, создаем его превью
            if (file.type.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(file);
                setPreview(imageUrl); // Сохраняем URL для отображения
            } else {
                setPreview(null); // Удаляем превью, если файл не является изображением
            }
        }
    };

    const handleUploadClick = async () => {
        if (selectedFile) {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authorization token is missing');
                return;
            }

            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await uploadFileToChat(chatId, formData, token);

                onFileUploadSuccess(response.filePath);
                setSelectedFile(null);
                setPreview(null); // Убираем превью после успешной загрузки
                handleClose();
            } catch (error) {
                console.error('Failed to upload file:', error);
            }
        } else {
            toast.error('Please select a file first');
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <ModalDialog>
                <IconButton
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                    onClick={handleClose}
                >
                    <CloseIcon />
                </IconButton>
                <Typography component="h2" sx={{ mb: 2 }}>
                    {selectedFile ? selectedFile.name : 'Upload a file'}
                </Typography>

                {preview && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <img
                            src={preview}
                            alt="preview"
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                        />
                    </Box>
                )}

                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".mp3,.mp4,.jpeg,.jpg,.png,.gif,.zip"
                    style={{ display: 'none' }}
                    id="file-upload"
                />
                <label htmlFor="file-upload">
                    <Button
                        component="span"
                        variant="outlined"
                        startDecorator={<UploadIcon />}
                    >
                        Select File
                    </Button>
                </label>
                <Button
                    onClick={handleUploadClick}
                    disabled={!selectedFile}
                    sx={{ mt: 2 }}
                >
                    Upload
                </Button>
            </ModalDialog>
        </Modal>
    );
};

export default FileUploadModal;
