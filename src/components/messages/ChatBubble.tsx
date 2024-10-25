import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { IconButton, Slider } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { deleteMessage } from '../../api/api';
import ContextMenu from './ContextMenu';
import { MessageProps } from '../core/types';
import {jwtDecode} from "jwt-decode";
import {JwtPayload} from "jsonwebtoken";
import CustomAudioPlayer from '../core/CustomAudioPlayer';

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
};

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
    const { content, attachment, variant, createdAt, id, isEdited, onEditMessage, messageCreatorId, user, isGroupChat } = props;
    const isSent = variant === 'sent';
    const formattedTime = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudioTime, setCurrentAudioTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const [currentVolume, setCurrentVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const messageVideoRef = useRef<HTMLVideoElement>(null);
    const modalVideoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const getAttachmentUrl = () => {
        if (!attachment) return '';
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        return `${baseUrl}/${attachment.filePath.replace(/\\/g, '/')}?cache-control=max-age=3600`;
    };

    const isImage = isImageFile(attachment?.fileName || '');
    const isVideo = isVideoFile(attachment?.fileName || '');
    const isAudio = isAudioFile(attachment?.fileName || '');

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleAudioTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentAudioTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleVolumeChange = (event: Event, newValue: number | number[]) => {
        const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

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
                px: 1,
                width: { xs: '90%', sm: '70%', md: '55%' },
                flexDirection: 'column',
                alignItems: isSent ? 'flex-end' : 'flex-start',
            }}
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
                                paddingTop: '2px'
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
                                mb: content ? 2 : 0,
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

                    {isAudio && !isVideo && (
                        <CustomAudioPlayer audioSrc={getAttachmentUrl()} isSent={isSent} />
                    )}

                    {content && (
                        <Typography
                            sx={{
                                fontSize: { xs: '14px', sm: '14px' },
                                lineHeight: 1.6,
                                color: isSent ? 'var(--joy-palette-common-white)' : 'var(--joy-palette-text-primary)',
                                marginLeft: isImage || isVideo || isAudio ? '12px' : '0px',
                                marginBottom: isImage || isVideo || isAudio ? '8px' : '4px',
                                textAlign: 'left',
                                transition: 'color 0.3s ease',
                                maxWidth: { xs: '300px', md: '480px' },
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                display: 'inline-block',
                                paddingRight: isEdited ? '100px' : '40px',
                            }}
                        >
                            {renderMessageContent(content)}
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

                    {/* Вложение файла */}
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

            {/* Контекстное меню */}
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
