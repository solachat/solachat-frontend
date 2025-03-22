import React, { useState, useEffect } from 'react';
import { Box, IconButton, CircularProgress, Typography, Avatar } from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageViewerProps {
    open: boolean;
    imageSrcList: string[];
    initialIndex?: number;
    senderAvatar: string;
    senderPublicKey: string;
    date: string;
    onClose: () => void;
    onDelete?: () => void;
    loading?: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
                                                     open,
                                                     imageSrcList,
                                                     initialIndex = 0,
                                                     senderAvatar,
                                                     senderPublicKey,
                                                     date,
                                                     onClose,
                                                     onDelete,
                                                     loading = false,
                                                 }) => {
    const [zoom, setZoom] = useState(1);
    const [shouldRender, setShouldRender] = useState(open);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            setCurrentIndex(initialIndex);
            setZoom(1);
        }
    }, [open, initialIndex]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setCurrentIndex(prev => (prev + 1 < imageSrcList.length ? prev + 1 : 0));
                setZoom(1);
            } else if (e.key === 'ArrowLeft') {
                setCurrentIndex(prev => (prev - 1 >= 0 ? prev - 1 : imageSrcList.length - 1));
                setZoom(1);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, imageSrcList.length]);

    if (!shouldRender) return null;

    const currentImage = imageSrcList[currentIndex];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 2000,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        sx={{
                            height: '64px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={senderAvatar} size="lg" />
                            <Box>
                                <Typography level="body-sm"                       sx={{
                                    cursor: 'pointer',
                                    color: '#a0d4ff',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        color: '#00a8ff',
                                        textShadow: '0 0 8px rgba(0, 168, 255, 0.4)',
                                    },
                                }}>
                                    {senderPublicKey}
                                </Typography>
                                <Typography level="body-xs" sx={{ color: 'rgba(160, 212, 255, 0.6)' }}>
                                    {date}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {loading && <CircularProgress size="sm" sx={{ color: 'white' }} />}
                            <IconButton onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.2))} sx={{ color: '#a0d4ff'}}>
                                <ZoomOutIcon />
                            </IconButton>
                            <IconButton onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))} sx={{ color: '#a0d4ff' }}>
                                <ZoomInIcon />
                            </IconButton>
                            {onDelete && (
                                <IconButton onClick={onDelete} sx={{ color: '#a0d4ff' }}>
                                    <DeleteIcon />
                                </IconButton>
                            )}
                            <IconButton onClick={onClose} sx={{ color: '#a0d4ff' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'zoom-in',
                        }}
                        onClick={onClose}
                    >
                        <motion.img
                            key={currentImage}
                            src={currentImage}
                            alt="preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: zoom }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{
                                maxWidth: '90%',
                                maxHeight: '90%',
                                objectFit: 'contain',
                                position: 'relative',
                            }}
                        />
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImageViewer;
