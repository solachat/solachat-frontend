import * as React from 'react';
import { Modal, Box, Typography, IconButton, Avatar, Stack } from '@mui/joy';
import VideoCallRoundedIcon from '@mui/icons-material/VideoCallRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import { UserProps } from '../core/types';
import { useEffect, useRef, useState } from "react";

type CallModalProps = {
    open: boolean;
    onClose: () => void;
    sender: UserProps;
    receiverId: number;
    isGroup?: boolean;
    ws: WebSocket | null;
};

export default function CallModal({ open, onClose, sender, receiverId, isGroup, ws }: CallModalProps) {
    const [isWaiting, setIsWaiting] = useState(false); // Ожидание ответа
    const [isCallActive, setIsCallActive] = useState(false); // Статус активного звонка
    const ringToneRef = useRef<HTMLAudioElement | null>(null); // Ссылка на аудиофайл звонка

    useEffect(() => {
        ringToneRef.current = new Audio('/sounds/ringtone.mp3');
        ringToneRef.current.loop = true; // Звук будет повторяться
        ringToneRef.current.volume = 0.2; // Устанавливаем громкость звука на 20%

        return () => {
            ringToneRef.current?.pause();
            ringToneRef.current = null;
        };
    }, []);

    const handleCallClick = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const callMessage = {
                type: 'callOffer',
                fromUserId: sender.id,
                toUserId: receiverId,
                isGroupCall: !!isGroup,
            };
            ws.send(JSON.stringify(callMessage));
            console.log('Call offer sent:', callMessage);
            setIsWaiting(true);
            ringToneRef.current?.play(); // Воспроизводим звук звонка
        } else {
            console.error('WebSocket connection is not open.');
        }
    };

    const handleEndCall = () => {
        // Логика завершения звонка
        if (ws && ws.readyState === WebSocket.OPEN) {
            const cancelMessage = {
                type: 'callCancel',
                fromUserId: sender.id,
                toUserId: receiverId,
            };
            ws.send(JSON.stringify(cancelMessage));
            console.log('Call cancelled:', cancelMessage);
        }
        setIsCallActive(false);
        setIsWaiting(false);
        ringToneRef.current?.pause(); // Останавливаем звук звонка
        onClose(); // Закрываем модалку
    };

    const handleAcceptCall = () => {
        setIsCallActive(true);
        setIsWaiting(false);
        ringToneRef.current?.pause(); // Останавливаем звук, если звонок принят
    };

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'callAccepted' && message.toUserId === sender.id) {
                    handleAcceptCall();
                }
            };
        }
    }, [ws]);

    return (
        <Modal open={open} onClose={handleEndCall} aria-labelledby="call-modal-title">
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '40%',
                    maxWidth: 500,
                    backgroundColor: 'background.body',
                    borderRadius: 'md',
                    padding: 4,
                    textAlign: 'center',
                    boxShadow: 'lg',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '300px', // Минимальная высота для вытягивания окна
                    justifyContent: 'space-between', // Распределяем контент по вертикали
                }}
            >
                <Avatar
                    src={sender.avatar}
                    alt={sender.realname}
                    sx={{
                        width: 140,
                        height: 140,
                        marginBottom: 5,
                    }}
                />
                <Typography fontWeight="lg" fontSize="xl" id="call-modal-title">
                    {sender.realname}
                </Typography>
                <Typography level="body-md" sx={{ marginBottom: 6 }}>
                    {isWaiting && !isCallActive
                        ? 'Ожидание ответа...'
                        : <>Если вы хотите начать видеозвонок,<br />нажмите на значок камеры.</>}
                </Typography>

                <Box sx={{ flexGrow: 1 }} /> {/* Для создания отступа между контентом и иконками */}

                {isWaiting && !isCallActive ? (
                    <Stack direction="row" spacing={4} justifyContent="center" alignItems="center" sx={{ marginBottom: 0 }}>
                        <Stack alignItems="center">
                            <IconButton variant="outlined" color="neutral" onClick={handleEndCall}>
                                <CloseRoundedIcon sx={{ fontSize: 30 }} />
                            </IconButton>
                            <Typography level="body-xs">Отменить</Typography>
                        </Stack>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={4} justifyContent="center" alignItems="center" sx={{ marginBottom: 0 }}>
                        <Stack alignItems="center">
                            <IconButton variant="outlined" color="neutral" onClick={handleCallClick}>
                                <CallRoundedIcon sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography level="body-xs">Позвонить</Typography>
                        </Stack>
                        <Stack alignItems="center">
                            <IconButton variant="outlined" color="neutral" onClick={onClose}>
                                <CloseRoundedIcon sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography level="body-xs">Отменить</Typography>
                        </Stack>
                    </Stack>
                )}

                {isCallActive && (
                    <Stack direction="row" spacing={4} justifyContent="center" alignItems="center" sx={{ marginBottom: 0 }}>
                        <Stack alignItems="center">
                            <IconButton variant="outlined" color="neutral">
                                <VideoCallRoundedIcon sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography level="body-xs">Вкл.видео</Typography>
                        </Stack>
                        <Stack alignItems="center">
                            <IconButton variant="outlined" color="neutral" onClick={handleEndCall}>
                                <CloseRoundedIcon sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography level="body-xs">Завершить</Typography>
                        </Stack>
                        <Stack alignItems="center">
                            <IconButton variant="outlined" color="neutral">
                                <MicOffRoundedIcon sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography level="body-xs">Выкл. звук</Typography>
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Modal>
    );
}
