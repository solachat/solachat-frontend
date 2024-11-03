import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import DownloadIcon from '@mui/icons-material/Download';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {CircularProgress, IconButton} from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { deleteMessage } from '../../api/api';
import ContextMenu from './ContextMenu';
import { MessageProps } from '../core/types';
import {jwtDecode} from "jwt-decode";
import {JwtPayload} from "jsonwebtoken";
import CustomAudioPlayer from '../core/CustomAudioPlayer';
import CheckIcon from "@mui/icons-material/Check";

type DecodedToken = JwtPayload & { id?: number };

type ChatBubbleProps = MessageProps & {
    variant: 'sent' | 'received';
    onEditMessage: (messageId: number, content: string) => void;
    messageCreatorId: number;
    user: {
        avatar: string;
        username: string;
    };
    isGroupChat: boolean;
    isRead: boolean;
    isDelivered: boolean;
};

const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(fileExtension || '');
};

const isVideoFile = (fileName: string) => {
    const videoExtensions = ['mp4', 'webm', 'ogg', "mov"];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(fileExtension || '');
};

const isAudioFile = (fileName: string) => {
    const audioExtensions = ['mp3'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return audioExtensions.includes(fileExtension || '');
};

const isLink = (text: string) => {
    const urlRegex = /(?:^|\s)(https?:\/\/[^\s]+|(?:[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:[\/\w.-]*)?)(?=\s|$)/g;
    return urlRegex.test(text.trim());
};


const renderMessageContent = (text: string) => {
    const parts = text.split(/((?:https?:\/\/[^\s]+|(?:[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:[\/\w.-]*)?)(?=\s|$))/g);

    return parts.map((part, index) => {
        if (isLink(part)) {
            let href = part;

            if (href.includes('@')) {
                href = `mailto:${part}`;
            } else if (!part.startsWith('http')) {
                href = `https://${part}`;
            }
            return (
                <a
                    href={part}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                    {part.trim()}
                </a>
            );
        }
        return <span key={index}>{part}</span>;
    });
};



export default function ChatBubble(props: ChatBubbleProps) {
    const { t } = useTranslation();
    const { content, attachment, variant, createdAt, id, isEdited, onEditMessage, messageCreatorId, user, isGroupChat, isRead } = props;
    const isSent = variant === 'sent';
    const formattedTime = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const [currentVolume, setCurrentVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

    const messageVideoRef = useRef<HTMLVideoElement>(null);
    const modalVideoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isClosing, setIsClosing] = useState(false);

    const getAttachmentUrl = () => {
        if (!attachment) return '';
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

        const cleanedPath = attachment.filePath
            .replace(/\\/g, '/')
            .replace(/\.enc|\.decrypted/g, '');

        return `${cleanedPath}`;
    };

    const isImage = isImageFile(attachment?.fileName || '');
    const isVideo = isVideoFile(attachment?.fileName || '');
    const isAudio = isAudioFile(attachment?.fileName || '');

    const handleImageClick = () => {
        setImageSrc(getAttachmentUrl());
        setIsImageOpen(true);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsImageOpen(false);
            setIsClosing(false);
        }, 100);
    };

    const syncVideoWithModal = () => {
        if (modalVideoRef.current) {
            modalVideoRef.current.currentTime = currentVideoTime;
            modalVideoRef.current.volume = currentVolume;
            modalVideoRef.current.muted = isMuted;
            modalVideoRef.current.play();
        }
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

    const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
        longPressTimeout.current = setTimeout(() => {
            const touch = event.touches[0];
            setAnchorPosition({
                mouseX: touch.clientX,
                mouseY: touch.clientY,
            });
        }, 200);
    };

    const handleTouchEnd = () => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
        }
    };

    const handleEdit = () => {
        onEditMessage(Number(id), content);
        setAnchorPosition(null);
    };

    const handleDelete = async () => {
        try {
            await deleteMessage(Number(id));
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const updateVideoState = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const video = event.currentTarget;
        if (video.currentTime !== currentVideoTime) {
            setCurrentVideoTime(video.currentTime);
        }
        if (video.volume !== currentVolume) {
            setCurrentVolume(video.volume);
        }
        if (video.muted !== isMuted) {
            setIsMuted(video.muted);
        }
    };

    useEffect(() => {
        if (isVideoOpen && modalVideoRef.current) {
            modalVideoRef.current.addEventListener('loadedmetadata', syncVideoWithModal);
            return () => {
                modalVideoRef.current?.removeEventListener('loadedmetadata', syncVideoWithModal);
            };
        }
    }, [isVideoOpen]);

    const token = localStorage.getItem('token');
    let currentUserId: number | null = null;

    if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        currentUserId = decodedToken.id || 0;
    }

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                mb: { xs: 1, sm: 1 },
                px: { xs: 0, sm: 1 },
                width: { xs: '90%', sm: '70%', md: '55%' },
                flexDirection: 'column',
                alignItems: isSent ? 'flex-end' : 'flex-start',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onContextMenu={handleContextMenu}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isSent ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    width: '100%',
                }}
            >
                {isGroupChat && !isSent && (
                    <Box
                        sx={{
                            marginRight: isSent ? '8px' : 0,
                            alignSelf: 'flex-end',
                            marginTop: '5px'
                        }}
                    >
                        <img
                            src={user.avatar || 'path/to/default-avatar.jpg'}
                            alt="avatar"
                            style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginRight: '2px',
                            }}
                        />
                    </Box>
                )}

                <Sheet
                    color={isSent ? 'primary' : 'neutral'}
                    variant={isSent ? 'solid' : 'soft'}
                    sx={{
                        maxWidth: isEdited ? '75%' : '70%',
                        minWidth: 'fit-content',
                        padding: !isImage && !isVideo && !isAudio ? { xs: '4px 8px', sm: '6px 10px' } : 0,
                        borderRadius: '12px',
                        borderBottomLeftRadius: isSent ? '18px' : '0px',
                        borderBottomRightRadius: isSent ? '0px' : '18px',
                        background: (isImage || isVideo || isAudio) && !content ? 'transparent' :
                            (isSent ? '#4F6D7A' : 'var(--joy-palette-background-level2)'),
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        display: 'inline-block',
                        fontSize: '14px',
                        lineHeight: '18px',
                        position: 'relative',
                        '@media (max-width: 600px)': {
                            maxWidth: '85%',
                            width: 'auto',
                        },
                    }}
                >
                    {isGroupChat && !isSent && (
                        <Typography>{user.username}</Typography>
                    )}

                    {isVideo && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                maxWidth: '100%',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                mb: content ? 1 : 0,
                                borderRadius: content ? '0px' : '12px',
                            }}
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
                                    borderTopLeftRadius: content ? '12px' : '0px',
                                    borderTopRightRadius: content ? '12px' : '0px',
                                    borderBottomLeftRadius: content ? '0px' : '12px',
                                    borderBottomRightRadius: content ? '0px' : '12px',
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
                                mb: content ? 1 : 0,
                                position: 'relative',
                                borderRadius: content ? '0px' : '12px',
                            }}
                            onClick={handleImageClick}
                        >
                            {imageLoading && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: '100px',
                                        height: '100px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '4px',
                                        zIndex: 1,
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            )}
                            <img
                                src={getAttachmentUrl()}
                                alt="attachment"
                                onLoad={handleImageLoad}
                                style={{
                                    width: '100%',
                                    maxWidth: '700px',
                                    maxHeight: '500px',
                                    objectFit: 'contain',
                                    borderTopLeftRadius: content ? '12px' : '0px',
                                    borderTopRightRadius: content ? '12px' : '0px',
                                    borderBottomLeftRadius: content ? '0px' : '12px',
                                    borderBottomRightRadius: content ? '0px' : '12px',
                                    opacity: imageLoading ? 0 : 1,
                                }}
                            />
                        </Box>
                    )}


                    {isAudio && !isVideo && (
                        <CustomAudioPlayer audioSrc={getAttachmentUrl()} isSent={isSent} />
                    )}

                    {content && (
                        <Typography
                            sx={{
                                fontSize: { xs: '14px', sm: '14px' },
                                color: isSent ? 'var(--joy-palette-common-white)' : 'var(--joy-palette-text-primary)',
                                marginLeft: isImage || isVideo || isAudio ? '12px' : '0px',
                                marginBottom: isImage || isVideo || isAudio ? '8px' : '4px',
                                textAlign: 'left',
                                transition: 'color 0.3s ease',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                maxWidth: { xs: '280px', md: '600px' },
                                display: 'inline-block',
                                paddingRight: isEdited
                                    ? (isSent ? '115px' : '90px')
                                    : (isSent ? '60px' : '40px'),
                            }}
                        >
                            {renderMessageContent(content)}
                        </Typography>
                    )}
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                            position: 'absolute',
                            bottom: '4px',
                            right:  '10px',
                            alignItems: 'center',
                            backgroundColor: (isImage && !content) || (isVideo && !content) ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
                            padding: (isImage && !content) || (isVideo && !content) ? '2px 6px' : '0px',
                            borderRadius: (isImage && !content) || (isVideo && !content) ? '10px' : '0px',
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
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '12px',
                                color: isSent ? 'var(--joy-palette-common-white)' : 'var(--joy-palette-text-secondary)',
                            }}
                        >
                            <Typography component="span" sx={{ fontSize: '12px', color: isSent ? 'var(--joy-palette-common-white)' : 'inherit' }}>
                                {formattedTime}
                            </Typography>
                            {isSent && (
                                isRead ? (
                                    <DoneAllIcon
                                        sx={{
                                            fontSize: '18px',
                                            marginLeft: { xs: '1px', sm: '4px' },
                                        }}
                                    />
                                ) : (
                                    <CheckIcon
                                        sx={{
                                            fontSize: '18px',
                                            marginLeft: { xs: '1px', sm: '4px' },
                                        }}
                                    />
                                )
                            )}
                        </Box>
                    </Stack>
                    {!isImage && !isVideo && !isAudio && attachment && (
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
                </Sheet>
            </Box>

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
                        animation: `${isClosing ? 'fade-out' : 'fade-in'} 0.2s ease-in-out`,
                    }}
                    onClick={handleClose}
                >
                    <Box sx={{ position: 'relative', display: 'inline-flex', maxWidth: '90%', maxHeight: '90%' }}>
                        <img
                            src={imageSrc}
                            alt="attachment-preview"
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',

                            }}
                        />
                        {content && (
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    bottom: '5px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    textAlign: 'center',
                                    padding: '6px',
                                    wordWrap: 'break-word',
                                    display: 'inline-block',
                                    borderRadius: '10px',
                                }}
                            >
                                {content}
                            </Typography>
                        )}
                    </Box>
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
