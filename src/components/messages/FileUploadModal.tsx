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
            <ModalDialog
                sx={{
                    border: '2px solid rgba(0, 168, 255, 0.3)',
                    backgroundColor: 'rgba(0, 168, 255, 0.05)',
                    boxShadow: '0 4px 16px rgba(0, 168, 255, 0.1)',
                    borderRadius: 'lg',

                }}
            >
                <IconButton
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: '#00a8ff',
                        '&:hover': { bgcolor: 'rgba(0, 168, 255, 0.1)' }
                    }}
                    onClick={handleClose}
                >
                    <CloseIcon />
                </IconButton>

                <Typography
                    component="h2"
                    sx={{
                        mb: 2,
                        color: '#00a8ff',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}
                >
                    {selectedFile ? selectedFile.name : t('fileUpload.uploadFile')}
                </Typography>

                {preview && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 2,
                            border: '1px solid rgba(0, 168, 255, 0.2)',
                            borderRadius: 'md',
                            padding: '4px',
                            backgroundColor: 'rgba(0, 168, 255, 0.03)'
                        }}
                    >
                        <img
                            src={preview}
                            alt={t('fileUpload.preview')}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '6px',
                                boxShadow: '0 2px 8px rgba(0, 168, 255, 0.1)'
                            }}
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

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    alignItems: 'center'
                }}>
                    <label htmlFor="file-upload">
                        <Button
                            component="span"
                            variant="outlined"
                            startDecorator={<UploadIcon sx={{ color: '#00a8ff' }} />}
                            sx={{
                                color: '#00a8ff',
                                borderColor: 'rgba(0, 168, 255, 0.3)',
                                '&:hover': {
                                    bgcolor: 'rgba(0, 168, 255, 0.05)',
                                    borderColor: 'rgba(0, 168, 255, 0.5)'
                                }
                            }}
                        >
                            {t('fileUpload.selectFile')}
                        </Button>
                    </label>

                    <Button
                        onClick={handleFileSelectClick}
                        disabled={!selectedFile}
                        sx={{
                            mt: 1,
                            bgcolor: 'rgba(0, 168, 255, 0.1)',
                            color: '#00a8ff',
                            '&:hover': {
                                bgcolor: 'rgba(0, 168, 255, 0.2)'
                            },
                            '&:disabled': {
                                bgcolor: 'rgba(0, 168, 255, 0.05)',
                                color: 'rgba(0, 168, 255, 0.3)'
                            }
                        }}
                    >
                        {t('fileUpload.attachFile')}
                    </Button>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default FileUploadModal;
