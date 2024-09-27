import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import DownloadIcon from '@mui/icons-material/Download';
import { MessageProps } from '../core/types';
import { IconButton } from '@mui/joy';
import ContextMenu from './ContextMenu';
import { useTranslation } from 'react-i18next';

type ChatBubbleProps = MessageProps & {
    variant: 'sent' | 'received';
    onEditMessage: (messageId: number, content: string) => void;
};

const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(fileExtension || '');
};

export default function ChatBubble(props: ChatBubbleProps) {
    const { t } = useTranslation();
    const { content, attachment, variant, createdAt, id, isEdited, onEditMessage } = props;
    const isSent = variant === 'sent';
    const formattedTime = new Date(createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    const [isImageOpen, setIsImageOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);

    const handleImageClick = () => {
        setImageSrc(getAttachmentUrl());
        setIsImageOpen(true);
    };

    const handleClose = () => {
        setIsImageOpen(false);
        setTimeout(() => setImageSrc(null), 300);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    const handleForward = () => {
        console.log('Forwarding:', content);
    };

    const getAttachmentUrl = () => {
        if (!attachment) return '';

        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        return `${baseUrl}/${attachment.filePath.replace('.enc', '')}`;
    };

    const isImage = isImageFile(attachment?.fileName || '');

    const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setAnchorPosition({
            mouseX: event.clientX,
            mouseY: event.clientY,
        });
    };



    const handleEdit = () => {
        onEditMessage(Number(id), content);
        setAnchorPosition(null);
    };

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                mb: { xs: 1, sm: 1 },
                px: 1,
                width: '45%',
                '@media (max-width: 600px)': {
                    flexDirection: 'column',
                },
            }}
            onContextMenu={handleContextMenu}
        >
            <Sheet
                color={isSent ? 'primary' : 'neutral'}
                variant={isSent ? 'solid' : 'soft'}
                sx={{
                    maxWidth: isEdited ? '75%' : '70%',
                    minWidth: 'fit-content',
                    padding: !isImage ? { xs: '6px 10px', sm: '8px 14px' } : 0,
                    borderRadius: '18px',
                    borderBottomLeftRadius: isSent ? '18px' : '0px',
                    borderBottomRightRadius: isSent ? '0px' : '18px',
                    background: isImage && !content ? 'transparent' : (isSent ? 'linear-gradient(135deg, #76baff, #4778e2)' : 'var(--joy-palette-background-level2)'),
                    boxShadow: isImage ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.15)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    display: 'inline-block',
                    fontSize: '14px',
                    lineHeight: '18px',
                    '@media (max-width: 600px)': {
                        maxWidth: '90%',
                    },
                    position: 'relative',
                }}
            >
                {isImage && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            maxWidth: '100%',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            mb: content ? 2 : 0,
                        }}
                        onClick={handleImageClick}
                    >
                        <img
                            src={getAttachmentUrl()}
                            alt="attachment"
                            style={{
                                width: '100%',
                                maxWidth: '700px',
                                maxHeight: '500px',
                                borderRadius: '12px',
                                objectFit: 'contain',
                            }}
                        />
                    </Box>
                )}

                {content && (
                    <Typography
                        sx={{
                            fontSize: { xs: '14px', sm: '14px' },
                            lineHeight: 1.6,
                            color: isSent
                                ? 'var(--joy-palette-common-white)'
                                : 'var(--joy-palette-text-primary)',
                            marginLeft: isImage ? '12px' : '0px',
                            marginBottom: isImage ? '8px' : '4px',
                            textAlign: 'left',
                            transition: 'color 0.3s ease',
                            maxWidth: '100%',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            display: 'inline-block',
                            paddingRight: isEdited ? '100px' : '40px',
                        }}
                    >
                        {content}
                    </Typography>
                )}

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '10px',
                        alignItems: 'center',
                    }}
                >
                    {isEdited && (
                        <Typography
                            sx={{
                                fontSize: '12px',
                                color: isSent ? 'var(--joy-palette-common-white)' : 'var(--joy-palette-text-secondary)',
                            }}
                        >
                            {t('edited')}
                        </Typography>
                    )}

                    <Typography
                        sx={{
                            fontSize: '12px',
                            color: isSent ? 'var(--joy-palette-common-white)' : 'var(--joy-palette-text-secondary)',
                        }}
                    >
                        {formattedTime}
                    </Typography>
                </Stack>

                {!isImage && attachment && (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <InsertDriveFileRoundedIcon sx={{ fontSize: '24px' }} />
                        <Typography sx={{ fontSize: 'sm' }}>{attachment.fileName}</Typography>
                        <IconButton
                            component="a"
                            href={getAttachmentUrl()}
                            download={attachment?.fileName}
                            sx={{
                                ml: 0.5,
                                color: isSent ? 'white' : '#0B6BCB',
                                transition: 'color 0.3s ease',
                            }}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Stack>
                )}

                {isImageOpen && imageSrc && (
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 999,
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                            transform: isImageOpen ? 'scale(1)' : 'scale(0.95)',
                            opacity: isImageOpen ? 1 : 0,
                        }}
                        onClick={handleClose}
                    >
                        <img
                            src={imageSrc}
                            alt="attachment-preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                                transform: isImageOpen ? 'scale(1)' : 'scale(0.95)',
                                opacity: isImageOpen ? 1 : 0,
                            }}
                        />
                    </Box>
                )}
            </Sheet>

            <ContextMenu
                anchorPosition={
                    anchorPosition !== null ? { top: anchorPosition.mouseY, left: anchorPosition.mouseX } : undefined
                } // Теперь используем координаты клика
                open={Boolean(anchorPosition)}
                onClose={() => setAnchorPosition(null)} // Закрываем меню
                onEdit={handleEdit}
                onCopy={handleCopy}
                onForward={handleForward}
            />

        </Box>
    );
}
