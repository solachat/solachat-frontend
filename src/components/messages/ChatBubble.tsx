import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
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
import { jwtDecode, JwtPayload } from 'jwt-decode';
import {deleteMessage} from "../../api/api";

type ChatBubbleProps = MessageProps & {
    variant: 'sent' | 'received';
    onEditMessage: (messageId: number, content: string) => void;
    messageCreatorId: number;
    user: {
        avatar: string;
        username: string;
    };
    isGroupChat: boolean;
};

type DecodedToken = JwtPayload & { id?: number };

const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(fileExtension || '');
};

const isVideoFile = (fileName: string) => {
    const videoExtensions = ['mp4', 'webm', 'ogg'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(fileExtension || '');
};

export default function ChatBubble(props: ChatBubbleProps) {
    const { t } = useTranslation();
    const { content, attachment, variant, createdAt, id, isEdited, onEditMessage, messageCreatorId, user, isGroupChat } = props;
    const isSent = variant === 'sent';
    const formattedTime = new Date(createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const [currentVolume, setCurrentVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const messageVideoRef = useRef<HTMLVideoElement>(null);
    const modalVideoRef = useRef<HTMLVideoElement>(null);

    const token = localStorage.getItem('token');
    let currentUserId: number | null = null;
    if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        currentUserId = decodedToken.id || 0;
    }

    const getAttachmentUrl = () => {
        if (!attachment) return '';
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        return `${baseUrl}/${attachment.filePath.replace(/\\/g, '/')}?cache-control=max-age=3600`;
    };

    const isImage = isImageFile(attachment?.fileName || '');
    const isVideo = isVideoFile(attachment?.fileName || '');

    const handleImageClick = () => {
        setImageSrc(getAttachmentUrl());
        setIsImageOpen(true);
    };

    const handleVideoClick = () => {
        setVideoSrc(getAttachmentUrl());
        if (messageVideoRef.current) {
            setCurrentVideoTime(messageVideoRef.current.currentTime);
            setCurrentVolume(messageVideoRef.current.volume);
            setIsMuted(messageVideoRef.current.muted);
        }
        setIsVideoOpen(true);
    };

    const handleClose = () => {
        setIsImageOpen(false);
        setIsVideoOpen(false);
        setTimeout(() => {
            setImageSrc(null);
            setVideoSrc(null);
        }, 300);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    const handleForward = () => {
        console.log('Forwarding:', content);
    };

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

    const handleDelete = async () => {
        try {
            await deleteMessage(Number(id));
            console.log('Message deleted');
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };


    const syncVideoWithModal = () => {
        if (modalVideoRef.current) {
            modalVideoRef.current.currentTime = currentVideoTime;
            modalVideoRef.current.volume = currentVolume;
            modalVideoRef.current.muted = isMuted;
            modalVideoRef.current.play();
        }
    };

    const updateVideoState = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const video = event.currentTarget;
        setCurrentVideoTime(video.currentTime);
        setCurrentVolume(video.volume);
        setIsMuted(video.muted);
    };

    useEffect(() => {
        if (isVideoOpen && modalVideoRef.current) {
            modalVideoRef.current.currentTime = currentVideoTime;
            modalVideoRef.current.volume = currentVolume;
            modalVideoRef.current.muted = isMuted;
        }
    }, [isVideoOpen, currentVideoTime, currentVolume, isMuted]);

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                mb: { xs: 1, sm: 1 },
                px: 1,
                width: '45%',
                flexDirection: 'column',
                alignItems: isSent ? 'flex-end' : 'flex-start',
            }}
            onContextMenu={handleContextMenu}
        >
            {isGroupChat && !isSent && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <img
                        src={user.avatar || 'path/to/default-avatar.jpg'}
                        alt="avatar"
                        style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '8px' }}
                    />
                    <Typography>{user.username}</Typography>
                </Box>
            )}

            <Sheet
                color={isSent ? 'primary' : 'neutral'}
                variant={isSent ? 'solid' : 'soft'}
                sx={{
                    maxWidth: isEdited ? '75%' : '70%',
                    minWidth: 'fit-content',
                    padding: !isImage && !isVideo ? { xs: '6px 10px', sm: '8px 14px' } : 0,
                    borderRadius: '18px',
                    borderBottomLeftRadius: isSent ? '18px' : '0px',
                    borderBottomRightRadius: isSent ? '0px' : '18px',
                    background: (isImage || isVideo) && !content ? 'transparent' : (isSent ? 'linear-gradient(135deg, #76baff, #4778e2)' : 'var(--joy-palette-background-level2)'),
                    boxShadow: isImage || isVideo ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.15)',
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
                {/* Отображение видеофайлов без border-radius для сообщения */}
                {isVideo && (
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
                        onClick={handleVideoClick}
                    >
                        <video
                            ref={messageVideoRef}
                            src={getAttachmentUrl()}
                            style={{
                                width: '100%',
                                maxWidth: '700px',
                                maxHeight: '500px',
                                objectFit: 'contain',
                                borderRadius: 0,
                            }}
                            controls
                            onTimeUpdate={updateVideoState}
                            onVolumeChange={updateVideoState}
                        />
                    </Box>
                )}

                {isImage && !isVideo && (
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
                                objectFit: 'contain',
                                borderRadius: 0,
                            }}
                        />
                    </Box>
                )}

                {content && (
                    <Typography
                        sx={{
                            fontSize: { xs: '14px', sm: '14px' },
                            lineHeight: 1.6,
                            color: isSent ? 'var(--joy-palette-common-white)' : 'var(--joy-palette-text-primary)',
                            marginLeft: isImage || isVideo ? '12px' : '0px',
                            marginBottom: isImage || isVideo ? '8px' : '4px',
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

                {!isImage && !isVideo && attachment && (
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
                                borderRadius: '12px',
                            }}
                        />
                    </Box>
                )}

                {isVideoOpen && videoSrc && (
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
                        <video
                            ref={modalVideoRef}
                            src={videoSrc}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                borderRadius: '12px',
                            }}
                            controls
                            onPlay={syncVideoWithModal}
                            onTimeUpdate={updateVideoState}
                            onVolumeChange={updateVideoState}
                        />
                    </Box>
                )}
            </Sheet>

            <ContextMenu
                anchorPosition={
                    anchorPosition !== null ? { top: anchorPosition.mouseY, left: anchorPosition.mouseX } : undefined
                }
                open={Boolean(anchorPosition)}
                onClose={() => setAnchorPosition(null)}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onForward={handleForward}
                onDelete={handleDelete}
                currentUserId={currentUserId ?? 0}
                messageCreatorId={messageCreatorId}
            />
        </Box>
    );
}
