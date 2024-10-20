import * as React from 'react';
import { useRef, useState } from 'react';

type WebRTCProps = {
    ws: WebSocket;  // WebSocket для обмена сигналами
    onClose: () => void;
};

export default function WebRTCCall({ ws, onClose }: WebRTCProps) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    // Конфигурация для ICE серверов (STUN/TURN)
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ],
    };

    const startCall = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);

        if (localAudioRef.current) {
            localAudioRef.current.srcObject = stream;
        }

        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Добавляем локальные аудио-треки в PeerConnection
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        // Обработчик для ICE кандидатов
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
            }
        };

        // Получение треков с другой стороны
        peerConnection.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        // Создаем offer и отправляем его через WebSocket
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: 'offer', offer }));
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);

        if (localAudioRef.current) {
            localAudioRef.current.srcObject = stream;
        }

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        // Обработчик для ICE кандидатов
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
            }
        };

        peerConnection.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        ws.send(JSON.stringify({ type: 'answer', answer: peerConnection.localDescription }));
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        const peerConnection = peerConnectionRef.current;
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        const peerConnection = peerConnectionRef.current;
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    React.useEffect(() => {
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
