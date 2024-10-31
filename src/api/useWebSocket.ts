import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { updateUserStatus } from './api';
import { jwtDecode } from 'jwt-decode';

const WS_URL = process.env.WS_URL || 'ws://localhost:4005';
const RECONNECT_INTERVAL = 3000;
const HEARTBEAT_INTERVAL = 120000;

export const useWebSocket = (onMessage: (message: any) => void, dependencies: any[] = []) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);

    const sendHeartbeat = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
            console.log('Heartbeat sent');
        }
    }, []);

    const updateStatusIfChanged = useCallback(
        async (isOnline: boolean) => {
            try {
                if (currentUserId !== null) {
                    console.log(`Updating status to ${isOnline ? 'online' : 'offline'}`);
                    await updateUserStatus(currentUserId, isOnline, localStorage.getItem('token') || '');
                }
            } catch (error) {
                console.error(`Failed to update user status to ${isOnline ? 'online' : 'offline'}`, error);
            }
        },
        [currentUserId]
    );

    const connectWebSocket = useCallback(() => {
        if (isConnected || wsRef.current) return;

        setIsConnecting(true);

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authorization token is missing');
            setIsConnecting(false);
            return;
        }

        const ws = new WebSocket(`${WS_URL.replace(/^http/, 'ws')}/ws?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            setIsConnected(true);
            setIsConnecting(false);

            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }

            if (!heartbeatInterval.current) {
                heartbeatInterval.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
            }

            updateStatusIfChanged(true);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);

            if (message.targetUserId && message.targetUserId !== currentUserId) {
                return;
            }

            if (message.type === 'chatCreated') {
                const currentUserInChat = message.chat.users.some((user: { id: number }) => user.id === currentUserId);
                if (!currentUserInChat) {
                    return;
                }
            }

            switch (message.type) {
                case 'newMessage':
                case 'editMessage':
                    onMessage(message);
                    break;
                case 'deleteMessage':
                    onMessage({
                        type: 'deleteMessage',
                        messageId: message.messageId,
                        chatId: message.chatId,
                    });
                    break;
                case 'messageRead':
                        onMessage({
                            type: 'messageRead',
                            messageId: message.messageId,
                            chatId: message.chatId,
                        });
                    break;
                case 'chatCreated':
                    onMessage(message);
                    break;
                case 'USER_DISCONNECTED':
                    onMessage(message);
                    break;
                case 'USER_CONNECTED':
                    onMessage(message);
                    break;
                case 'chatDeleted':
                    onMessage(message);
                    break;
                case 'groupChatCreated':
                    onMessage(message);
                    break
                case 'callOffer':
                    if (message.toUserId === currentUserId) {
                        onMessage({
                            type: 'callOffer',
                            fromUserId: message.fromUserId,
                            fromUsername: message.fromUsername,
                            fromAvatar: message.fromAvatar,
                            toUserId: message.toUserId,
                            toUsername: message.toUsername,
                            toAvatar: message.toAvatar,
                            callId: message.callId,
                            status: 'incoming'
                        });
                    } else if (message.fromUserId === currentUserId) {
                        onMessage({
                            type: 'callOffer',
                            fromUserId: message.fromUserId,
                            fromUsername: message.fromUsername,
                            fromAvatar: message.fromAvatar,
                            toUserId: message.toUserId,
                            toUsername: message.toUsername,
                            toAvatar: message.toAvatar,
                            callId: message.callId,
                            status: 'outgoing'
                        });
                    }
                    break;
                case 'callAccepted':
                    onMessage({
                        type: 'callAccepted',
                        fromUserId: message.fromUserId,
                        toUserId: message.toUserId,
                    });
                    break;
                case 'callRejected':
                    onMessage({
                        type: 'callRejected',
                        fromUserId: message.fromUserId,
                        toUserId: message.toUserId,
                    });
                    break;
                default:
                    console.warn('Unknown message type:', message.type);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = (event) => {
            console.error('WebSocket connection closed with code', event.code, 'reason:', event.reason);
            setIsConnected(false);
            setIsConnecting(false);
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
                heartbeatInterval.current = null;
            }

            updateStatusIfChanged(false);
            wsRef.current = null;
            handleReconnection();
        };
    }, [onMessage, sendHeartbeat, updateStatusIfChanged, isConnected, currentUserId]);

    const handleReconnection = useCallback(() => {
        if (!reconnectTimeout.current) {
            reconnectTimeout.current = setTimeout(() => {
                console.log('Attempting to reconnect WebSocket...');
                connectWebSocket();
            }, RECONNECT_INTERVAL);
        }
    }, [connectWebSocket]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken: { id: number } = jwtDecode(token);
                setCurrentUserId(decodedToken.id);
                console.log('Current user (ID):', decodedToken.id);
            } catch (error) {
                console.error('Failed to decode token', error);
            }
        }
    }, []);

    useEffect(() => {
        if (currentUserId !== null && !isConnected) {
            connectWebSocket();
        }
    }, [currentUserId, connectWebSocket, isConnected, ...dependencies]);

    return { wsRef: wsRef.current, isConnecting, connectWebSocket };
};
