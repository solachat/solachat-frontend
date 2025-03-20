import React, { useState, useCallback, useRef } from 'react';
import { Modal, Box, Button, Typography, IconButton, Slider, Stack } from '@mui/joy';
import Cropper from 'react-easy-crop';
import { Upload as UploadIcon, Close as CloseIcon, Image as InsertPhotoIcon, RotateLeft as RotateLeftIcon, ZoomOut as ZoomOutIcon, ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import getCroppedImg from '../../utils/cropImage';

interface AvatarUploadModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (avatarUrl: string) => void;
}

interface CroppedArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function AvatarUploadModal({ open, onClose, onSuccess }: AvatarUploadModalProps) {
    const {t} = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initialFileUrl = useRef<string | null>(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setFile(selectedFile);
            setPreviewUrl(objectUrl);
            initialFileUrl.current = objectUrl;
            setIsEditing(true);
        } else {
            setFile(null);
            setPreviewUrl(null);
            setIsEditing(false);
        }
    };

    const onCropComplete = useCallback((_: unknown, croppedPixels: CroppedArea) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleUpload = async () => {
        if (!file || !croppedAreaPixels) return;

        try {
            const croppedImageBlob = await getCroppedImg(previewUrl!, croppedAreaPixels, rotation);
            const formData = new FormData();
            formData.append('avatar', croppedImageBlob, 'avatar.jpg');

            const response = await axios.put(`${API_URL}/api/users/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const newAvatarUrl = response.data.avatar;
            const newToken = response.data.token;

            localStorage.setItem('token', newToken);

            onSuccess(newAvatarUrl);

            handleClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setFile(null);
            setPreviewUrl(null);
            setRotation(0);
            setZoom(1);
            setIsEditing(false);
            setIsClosing(false);
            onClose();
        }, 100);
    };

    const handleCancel = () => {
        setPreviewUrl(null);
        setFile(null);
        setIsEditing(false);
    };

    const handleReset = () => {
        if (initialFileUrl.current) {
            setPreviewUrl(initialFileUrl.current);
            setCrop({x: 0, y: 0});
            setZoom(1);
            setRotation(0);
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
        >
            <Box
                sx={{
                    p: 4,
                    backgroundColor: 'rgba(0, 22, 45, 0.85)',
                    borderRadius: '12px',
                    width: '460px',
                    mx: 'auto',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    border: '1px solid rgba(0, 168, 255, 0.3)',
                    boxShadow: '0px 4px 12px rgba(0, 168, 255, 0.2)',
                    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
                    outline: 'none',
                }}
            >
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        color: 'rgba(160, 212, 255, 0.8)',
                        transition: 'color 0.2s ease-in-out',
                        '&:hover': {color: '#00a8ff'},
                    }}
                    onClick={handleClose}
                >
                    <CloseIcon/>
                </IconButton>

                {isEditing && (
                    <Typography level="h4" sx={{position: 'absolute', top: 10, left: 20, color: '#a0d4ff'}}>
                        {t('editImage')}
                    </Typography>
                )}

                <Typography level="h4" sx={{mb: 2, color: '#a0d4ff'}}>
                    {previewUrl ? '' : t('uploadImage')}
                </Typography>

                {!previewUrl && (
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            mb: 2,
                            border: '1px solid rgba(0, 168, 255, 0.3)',
                            backgroundColor: 'rgba(0, 22, 45, 0.5)',
                            transition: 'background-color 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 30, 60, 0.8)',
                            },
                        }}
                    >
                        <InsertPhotoIcon sx={{fontSize: 40, mb: 1, color: '#a0d4ff'}}/>
                        {t('uploadImage')}
                    </Button>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange}
                       style={{display: 'none'}}/>

                {previewUrl && (
                    <>
                        <Box sx={{position: 'relative', width: 300, height: 300, mt: 2}}>
                            <Cropper
                                image={previewUrl}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={1}
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                onCropComplete={onCropComplete}
                                objectFit="contain"
                                style={{
                                    cropAreaStyle: {
                                        borderRadius: '50%',
                                        border: '3px solid rgba(160, 212, 255, 0.8)',
                                    },
                                    containerStyle: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    },
                                }}
                            />
                        </Box>

                        <Stack direction="row" spacing={1} sx={{mt: 2, alignItems: 'center', justifyContent: 'center'}}>
                            <ZoomOutIcon sx={{color: '#a0d4ff'}}/>
                            <Slider
                                sx={{
                                    width: 200,
                                    '& .MuiSlider-thumb': {backgroundColor: '#00a8ff'},
                                    '& .MuiSlider-track': {backgroundColor: 'rgba(0, 168, 255, 0.7)'},
                                }}
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(_, value) => setZoom(value as number)}
                            />
                            <ZoomInIcon sx={{color: '#a0d4ff'}}/>
                            <IconButton
                                sx={{
                                    ml: 2,
                                    color: '#a0d4ff',
                                    transition: 'color 0.2s ease-in-out',
                                    '&:hover': {color: '#00a8ff'},
                                }}
                                onClick={() => setRotation((r) => r + 90)}
                            >
                                <RotateLeftIcon/>
                            </IconButton>
                        </Stack>

                        <Stack direction="row" spacing={2} sx={{mt: 3, justifyContent: 'space-between', width: '100%'}}>
                            <Button
                                variant="outlined"
                                onClick={handleReset}
                                sx={{
                                    border: '1px solid rgba(0, 168, 255, 0.5)',
                                    color: '#a0d4ff',
                                    transition: 'background-color 0.2s ease-in-out',
                                    '&:hover': {backgroundColor: 'rgba(0, 30, 60, 0.8)'},
                                }}
                            >
                                {t('reset')}
                            </Button>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    sx={{
                                        border: '1px solid rgba(255, 80, 80, 0.5)',
                                        color: '#ff5050',
                                        transition: 'background-color 0.2s ease-in-out',
                                        '&:hover': {backgroundColor: 'rgba(60, 0, 0, 0.8)'},
                                    }}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    variant="solid"
                                    onClick={handleUpload}
                                    sx={{
                                        backgroundColor: '#00a8ff',
                                        color: 'white',
                                        transition: 'background-color 0.2s ease-in-out',
                                        '&:hover': {backgroundColor: '#0080cc'},
                                    }}
                                >
                                    {t('send')}
                                </Button>
                            </Stack>
                        </Stack>
                    </>
                )}
            </Box>
        </Modal>
    );
}
