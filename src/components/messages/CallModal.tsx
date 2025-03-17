import * as React from 'react';
import { Modal, Box, Typography, IconButton, Avatar, Stack } from '@mui/joy';
import VideoCallRoundedIcon from '@mui/icons-material/VideoCallRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import { useEffect, useRef, useState } from 'react';
import { initiateCall, endCall, acceptCall } from '../../api/api';

type CallModalProps = {
    open: boolean;
    onClose: () => void;
    sender: {
        id: number;
        username: string;
        avatar: string;
        online: boolean;
        role: string;
    };
    receiver: {
        id: number;
        username: string;
        avatar: string;
    };
    isGroup?: boolean;
    currentUserId: number | null;
    ws: WebSocket | null;
    incomingCall?: boolean;
    callId: number | null;
    status: 'incoming' | 'outgoing' | 'accepted' | 'rejected';
};

export default function CallModal({
                                      open,
                                      onClose,
                                      sender,
                                      receiver,
                                      isGroup,
                                      currentUserId,
                                      incomingCall = false,
                                      ws,
                                      callId,
                                      status,
                                  }: CallModalProps) {
    const [isWaiting, setIsWaiting] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const ringToneRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }, // STUN сервер
        ],
    };

    useEffect(() => {
        ringToneRef.current = new Audio('/sounds/ringtone.mp3');
        ringToneRef.current.loop = true;
        ringToneRef.current.volume = 0.2;

        return () => {
            ringToneRef.current?.pause();
            ringToneRef.current = null;
        };
    }, [status, open, receiver.id, currentUserId]);

    const handleCallClick = async () => {
        try {
            const response = await initiateCall(currentUserId, receiver.id);
            console.log('Call initiated:', response);
            setIsWaiting(true);
            ringToneRef.current?.play();
        } catch (error) {
            console.error('Failed to initiate call:', error);
        }
    };

    const handleEndCall = async () => {
        try {
            const response = await endCall(currentUserId, receiver.id, callId);
            console.log('Call ended:', response);
        } catch (error) {
            console.error('Failed to end call:', error);
        }

        setIsCallActive(false);
        setIsWaiting(false);
        ringToneRef.current?.pause();
        onClose();
    };

    const handleAcceptCall = async () => {
        try {
            const response = await acceptCall(currentUserId, sender.id, callId);
            console.log('Call accepted:', response);
            setIsCallActive(true);
            ringToneRef.current?.pause();

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'callAnswer',
                    fromUserId: sender.id,
                    toUserId: currentUserId,
                    callId: callId,
                }));


                const peerConnection = new RTCPeerConnection(configuration);
                peerConnectionRef.current = peerConnection;

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setLocalStream(stream);

                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream);
                });

                ws.onmessage = async (message) => {
                    const data = JSON.parse(message.data);

                    if (data.type === 'offer') {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);

                        ws.send(JSON.stringify({
                            type: 'answer',
                            answer: peerConnection.localDescription,
                        }));
                    } else if (data.type === 'ice-candidate') {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                };

                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        ws.send(JSON.stringify({
                            type: 'ice-candidate',
                            candidate: event.candidate,
                        }));
                    }
                };

                peerConnection.ontrack = (event) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                    }
                };
            }
        } catch (error) {
            console.error('Failed to accept call:', error);
        }
    };

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
                    minHeight: '300px',
                    justifyContent: 'space-between',
                }}
            >
                <Avatar
                    src={sender.avatar}
                    alt={sender.username}
                    sx={{
                        width: 140,
                        height: 140,
                        marginBottom: 5,
                    }}
                />
                <Typography fontWeight="lg" fontSize="xl" id="call-modal-title">
                    {sender.username}
                </Typography>
                <Typography level="body-md" sx={{ marginBottom: 6 }}>
                    {status === 'incoming' && !isCallActive
                        ? 'Входящий звонок...'
                        : isWaiting && !isCallActive
                            ? 'Ожидание ответа...'
                            : 'Если вы хотите начать видеозвонок, нажмите на значок камеры.'}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                {status === 'incoming' && !isCallActive && receiver.id === currentUserId ? (
                    <Stack direction="row" spacing={4} justifyContent="center" alignItems="center" sx={{ marginBottom: 0 }}>
                        <Stack alignItems="center">
                            <IconButton variant="outlined" color="neutral" onClick={handleAcceptCall}>
                                <CallRoundedIcon sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography level="body-xs">Принять</Typography>
                        </Stack>
                        <Stack alignItems="center">
                            <IconButton variant="outlined" color="neutral" onClick={handleEndCall}>
                                <CloseRoundedIcon sx={{ fontSize: 40 }} />
                            </IconButton>
                            <Typography level="body-xs">Отклонить</Typography>
                        </Stack>
                    </Stack>
                ) : isWaiting && !isCallActive ? (
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
                {/* Аудио для другой стороны */}
                <audio ref={remoteAudioRef} autoPlay playsInline />
            </Box>
        </Modal>
    );
}
