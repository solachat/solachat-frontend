import * as React from 'react';
import { useState } from 'react';
import { Button, Modal, ModalDialog, Typography, IconButton } from '@mui/joy';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { uploadFileToChat } from '../../api/api';

interface FileUploadModalProps {
    chatId: number;
    onFileUploadSuccess: (filePath: string) => void;  // Оставляем только filePath
    open: boolean;
    handleClose: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ chatId, onFileUploadSuccess, open, handleClose }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
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
                // Загрузка файла
                const response = await uploadFileToChat(chatId, formData, token);

                // После успешной загрузки файла
                onFileUploadSuccess(response.filePath);  // Передаем только путь к файлу
                setSelectedFile(null);
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
