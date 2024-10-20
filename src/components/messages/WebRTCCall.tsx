import * as React from 'react';
import { Modal, Box, Typography, IconButton, Avatar, Stack } from '@mui/joy';
import { initiateCall, endCall, acceptCall } from '../../api/api';
import {useEffect, useRef, useState} from "react";

type WebRTCCallProps = {
    open: boolean;
    onClose: () => void;
    sender: {
        id: number;
        username: string;
        realname: string;
        avatar: string;
        online: boolean;
        role: string;
    };
    receiver: {
        id: number;
        username: string;
        avatar: string;
    };
    currentUserId: number | null;
    ws: WebSocket;
    callId: number | null;
    status: 'incoming' | 'outgoing' | 'accepted' | 'rejected';
};

export default function WebRTCCall({
                                       open,
                                       onClose,
                                       sender,
                                       receiver,
                                       currentUserId,
                                       ws,
                                       callId,
                                       status
                                   }: WebRTCCallProps) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    // Конфигурация STUN-сервера
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };

    // Создаем PeerConnection и обрабатываем события
    const createPeerConnection = () => {
        const peerConnection = new RTCPeerConnection(configuration);

        // Обрабатываем входящие ICE-кандидаты
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    callId,
                }));
            }
        };

        // Получаем удаленный медиапоток
        peerConnection.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        return peerConnection;
    };

    // Инициализация звонка
    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);

            if (localAudioRef.current) {
                localAudioRef.current.srcObject = stream;
            }

            const peerConnection = createPeerConnection();
            peerConnectionRef.current = peerConnection;

            // Добавляем локальный аудиопоток в PeerConnection
            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, stream);
            });

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            ws.send(JSON.stringify({
                type: 'offer',
                offer: peerConnection.localDescription,
                callId,
            }));
        } catch (error) {
            console.error('Error starting call:', error);
        }
    };

    // Принятие входящего звонка
    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        const peerConnection = peerConnectionRef.current;
        if (!peerConnection) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    };

    // Обработка входящего предложения
    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        const peerConnection = createPeerConnection();
        peerConnectionRef.current = peerConnection;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);

        if (localAudioRef.current) {
            localAudioRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
        });

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        ws.send(JSON.stringify({
            type: 'answer',
            answer: peerConnection.localDescription,
            callId,
        }));
    };

    // Обрабатываем входящие ICE-кандидаты
    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        const peerConnection = peerConnectionRef.current;
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    // Слушаем сообщения WebSocket
    useEffect(() => {
        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);

            switch (data.type) {
                case 'offer':
                    handleOffer(data.offer);
                    break;
                case 'answer':
                    handleAnswer(data.answer);
                    break;
                case 'ice-candidate':
                    handleIceCandidate(data.candidate);
                    break;
                default:
                    console.warn('Unknown WebSocket message type:', data.type);
                    break;
            }
        };

        return () => {
            ws.close();
        };
    }, [ws]);

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="call-modal-title">
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'background.body', padding: 4 }}>
                <Typography fontWeight="lg" fontSize="xl" id="call-modal-title">
                    {sender.realname}
                </Typography>
                <audio ref={localAudioRef} autoPlay playsInline />
                <audio ref={remoteAudioRef} autoPlay playsInline />
                <button onClick={startCall}>Start Call</button>
                <button onClick={onClose}>End Call</button>
            </Box>
        </Modal>
    );
}
