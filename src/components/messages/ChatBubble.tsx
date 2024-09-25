import * as React from 'react';
import {MouseEvent as ReactMouseEvent, useState} from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/joy/Avatar';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import DownloadIcon from '@mui/icons-material/Download';
import { MessageProps } from '../core/types';
import { IconButton } from "@mui/joy";
import ContextMenu from './ContextMenu';

type ChatBubbleProps = MessageProps & {
    variant: 'sent' | 'received';
    onEditMessage: (messageId: number, content: string) => void; // Для редактирования сообщения
};

const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(fileExtension || '');
};

export default function ChatBubble(props: ChatBubbleProps) {
    const { content, attachment, variant, createdAt, id, onEditMessage } = props;
    const isSent = variant === 'sent';
    const formattedTime = new Date(createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    const [isImageOpen, setIsImageOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleImageClick = () => {
        setImageSrc(getAttachmentUrl());
        setIsImageOpen(true);
    };

    const handleClose = () => {
        setIsImageOpen(false);
        setImageSrc(null);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    const handleForward = () => {
        console.log('Forwarding:', content); // Здесь можно реализовать логику пересылки
    };

    const getAttachmentUrl = () => {
        if (!attachment) return '';

        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        return `${baseUrl}/${attachment.filePath.replace('.enc', '')}`;
    };

    const isImage = isImageFile(attachment?.fileName || '');

    const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget as HTMLElement); // Приводим к HTMLElement
    };

    const handleEdit = () => {
        onEditMessage(Number(id), content); // Преобразуем id в число
        setAnchorEl(null);
    };

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                mb: { xs: 2, sm: 2 },
                px: 1,
                position: 'relative',
            }}
            onContextMenu={handleContextMenu}
        >
        <Sheet
                color={isSent ? 'primary' : 'neutral'}
                variant={isSent ? 'solid' : 'soft'}
                sx={{
                    maxWidth: '70%',
                    minWidth: !isImage ? '140px' : 'auto',
                    padding: !isImage ? { xs: '8px 12px', sm: '8px 10px' } : 0,
                    borderRadius: '16px',
                    borderBottomLeftRadius: isSent ? '13px' : '0px',
                    borderBottomRightRadius: isSent ? '0px' : '13px',
                    borderTopRightRadius: '13px',
                    borderTopLeftRadius: isSent ? '13px' : '13px',
                    background: isImage && !content ? 'transparent' : (isSent ? 'linear-gradient(135deg, #76baff, #4778e2)' : 'var(--joy-palette-background-level2)'),
                    boxShadow: isImage ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.15)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                        boxShadow: !isImage ? '0 6px 20px rgba(0, 0, 0, 0.2)' : 'none',
                    }
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
                                borderRadius: '3px',
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
                        }}
                    >
                        {content}
                    </Typography>
                )}

                {!isImage && attachment && (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Avatar color="primary" size="md">
                            <InsertDriveFileRoundedIcon />
                        </Avatar>
                        <div>
                            <Typography sx={{ fontSize: 'sm' }}>{attachment.fileName}</Typography>
                            <Typography level="body-sm">{attachment.size}</Typography>
                        </div>
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

                <Stack
                    direction={isSent ? 'row-reverse' : 'row'}
                    spacing={1}
                    sx={{ position: 'absolute', bottom: 1, right: 8 }}
                >
                    <Typography
                        sx={{
                            fontSize: { xs: '12px', sm: '13px' },
                            color: isSent
                                ? 'var(--joy-palette-common-white)'
                                : 'var(--joy-palette-text-secondary)',
                        }}
                    >
                        {formattedTime}
                    </Typography>
                </Stack>

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
                        }}
                        onClick={handleClose}
                    >
                        <img
                            src={imageSrc}
                            alt="attachment-preview"
                            style={{
                                maxWidth: '90%',
                                maxHeight: '90%',
                                objectFit: 'contain',
                                borderRadius: '12px',
                                transition: 'transform 0.3s ease-in-out',
                            }}
                        />
                    </Box>
                )}
            </Sheet>

            <ContextMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onForward={handleForward}
            />
        </Box>
    );
}
