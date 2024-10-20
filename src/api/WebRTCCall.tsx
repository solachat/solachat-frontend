import * as React from 'react';
import {useRef, useState} from "react";

type WebRTCProps = {
    ws: WebSocket;  // WebSocket для обмена сигналами
    onClose: () => void;
};

export default function WebRTCCall({ ws, onClose }: WebRTCProps) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    // Конфигурация STUN/TURN серверов
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ],
    };

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(configuration);

        // Добавляем обработчики для получения ICE-кандидатов
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                }));
            }
        };

        // Когда получаем медиапоток с другой стороны
        pc.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        return pc;
    };

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);

            if (localAudioRef.current) {
                localAudioRef.current.srcObject = stream;
            }

            const pc = createPeerConnection();
            peerConnectionRef.current = pc;

            // Добавляем локальные аудиотреки в PeerConnection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Отправляем offer через WebSocket
            ws.send(JSON.stringify({
                type: 'offer',
                offer: pc.localDescription,
            }));
        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        const pc = createPeerConnection();
        peerConnectionRef.current = pc;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);

        if (localAudioRef.current) {
            localAudioRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Отправляем answer через WebSocket
        ws.send(JSON.stringify({
            type: 'answer',
            answer: pc.localDescription,
        }));
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        const pc = peerConnectionRef.current;
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

// WebSocket обрабатывает входящие сообщения
    React.useEffect(() => {
        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);

            switch (data.type) {
                case 'offer':
                    handleOffer(data.offer);  // Обрабатываем offer
                    break;
                case 'answer':
                    handleAnswer(data.answer);  // Обрабатываем answer
                    break;
                case 'ice-candidate':
                    handleIceCandidate(data.candidate);  // Обрабатываем ice-candidate
                    break;
                case 'callAccepted':
                    console.log('Call accepted by', data.toUserId);
                    break;
                default:
                    break;
            }
        };

        return () => {
            ws.close();
        };
    }, [ws]);

    return (
        <div>
            <h3>WebRTC Call</h3>
            <audio ref={localAudioRef} autoPlay playsInline />
            <audio ref={remoteAudioRef} autoPlay playsInline />
            <button onClick={startCall}>Start Call</button>
            <button onClick={onClose}>End Call</button>
        </div>
    );
}
