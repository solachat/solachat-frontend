import * as React from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/joy/Avatar';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';  // Иконка для файлов
import DownloadIcon from '@mui/icons-material/Download';  // Иконка для скачивания
import CloseIcon from '@mui/icons-material/Close';  // Иконка для закрытия модального окна
import { MessageProps } from '../core/types';
import { IconButton } from "@mui/joy";
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { useState } from 'react';

type ChatBubbleProps = MessageProps & {
    variant: 'sent' | 'received';
};

export default function ChatBubble(props: ChatBubbleProps) {
    const { content, attachment, variant, createdAt } = props;
    const isSent = variant === 'sent';
    const formattedTime = new Date(createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Модальное окно для просмотра изображения
    const [isImageOpen, setIsImageOpen] = useState(false);

    const handleImageClick = () => {
        setIsImageOpen(true);
    };

    const handleClose = () => {
        setIsImageOpen(false);
    };

    const getAttachmentUrl = () => {
        if (!attachment) return '';

        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        return `${baseUrl}/download/${attachment.fileName}`;
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                mb: { xs: 1, sm: 1.5 },
                px: 1.5,
            }}
        >
            <Sheet
                color={isSent ? 'primary' : 'neutral'}
                variant={isSent ? 'solid' : 'soft'}
                sx={{
                    position: 'relative',
                    maxWidth: { xs: '85%', sm: '100%' },
                    padding: attachment?.type === 'jpg' || attachment?.type === 'png' ? 0 : { xs: '6px 10px', sm: '10px 25px' },
                    borderRadius: '10px',
                    borderTopRightRadius: isSent ? 0 : '12px',
                    borderTopLeftRadius: isSent ? '12px' : 0,
                    backgroundColor: attachment?.type === 'jpg' || attachment?.type === 'png' ? 'transparent' : isSent
                        ? 'var(--joy-palette-primary-solidBg)'
                        : 'background.body',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {/* Контент сообщения если это не изображение */}
                {(!attachment || (attachment?.type !== 'jpg' && attachment?.type !== 'png')) && (
                    <Typography
                        sx={{
                            fontSize: { xs: '12px', sm: '14px' },
                            color: isSent
                                ? 'var(--joy-palette-common-white)'
                                : 'var(--joy-palette-text-primary)',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            marginBottom: '4px',
                            textAlign: 'left',
                        }}
                    >
                        {content}
                    </Typography>
                )}

                {/* Если файл - это изображение */}
                {attachment?.type === 'jpg' || attachment?.type === 'png' ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mt: 1,
                            maxWidth: '100%',
                            cursor: 'pointer',
                        }}
                        onClick={handleImageClick}
                    >
                        <img
                            src={getAttachmentUrl()}
                            alt="attachment"
                            style={{ width: '100%', borderRadius: '8px' }}
                        />
                    </Box>
                ) : (
                    attachment && (
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <Avatar color="primary" size="lg">
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
                                    ml: 1,
                                    color: isSent ? 'white' : '#0B6BCB',
                                }}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </Stack>
                    )
                )}

                {/* Время сообщения */}
                <Stack
                    direction={isSent ? 'row-reverse' : 'row'}
                    spacing={1.5}
                    sx={{ position: 'absolute', bottom: 1, right: 8 }}
                >
                    <Typography
                        sx={{
                            fontSize: { xs: '10px', sm: '12px' },
                            color: isSent
                                ? 'var(--joy-palette-common-white)'
                                : 'var(--joy-palette-text-secondary)',
                        }}
                    >
                        {formattedTime}
                    </Typography>
                </Stack>

                {/* Модальное окно для просмотра изображения */}
                {attachment?.type === 'jpg' || attachment?.type === 'png' ? (
                    <Modal open={isImageOpen} onClose={handleClose}>
                        <ModalDialog
                            aria-labelledby="image-preview-dialog"
                            sx={{
                                maxWidth: '80%',
                                maxHeight: '80%',
                                overflow: 'auto',
                                position: 'relative',
                                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            }}
                        >
                            <IconButton
                                onClick={handleClose}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    color: 'white',
                                }}
                            >
                                <CloseIcon />
                            </IconButton>

                            <img
                                src={getAttachmentUrl()}
                                alt="attachment-preview"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </ModalDialog>
                    </Modal>
                ) : null}
            </Sheet>
        </Box>
    );
}
