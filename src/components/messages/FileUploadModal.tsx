import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalDialog, Typography, IconButton, Box } from '@mui/joy';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';

interface FileUploadModalProps {
    onFileSelect: (file: File) => void;
    open: boolean;
    handleClose: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ onFileSelect, open, handleClose }) => {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            if (file.type.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(file);
                setPreview(imageUrl);
            } else {
                setPreview(null);
            }
        }
    };

    const handleFileSelectClick = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
            setSelectedFile(null);
            setPreview(null);
            handleClose();
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
                    {selectedFile ? selectedFile.name : t('fileUpload.uploadFile')}
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
                            alt={t('fileUpload.preview')}
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                        />
                    </Box>
                )}

                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".mp3,.mp4,.jpeg,.jpg,.png,.gif,.zip,.mov"
                    style={{ display: 'none' }}
                    id="file-upload"
                />
                <label htmlFor="file-upload">
                    <Button
                        component="span"
                        variant="outlined"
                        startDecorator={<UploadIcon />}
                    >
                        {t('fileUpload.selectFile')}
                    </Button>
                </label>
                <Button
                    onClick={handleFileSelectClick}
                    disabled={!selectedFile}
                    sx={{ mt: 2 }}
                >
                    {t('fileUpload.attachFile')}
                </Button>
            </ModalDialog>
        </Modal>
    );
};

export default FileUploadModal;
