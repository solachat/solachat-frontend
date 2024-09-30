import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { updateUserStatus } from './api';
import {jwtDecode} from 'jwt-decode';

const WS_URL = process.env.WS_URL || 'ws://localhost:4005';
const RECONNECT_INTERVAL = 3000;
const HEARTBEAT_INTERVAL = 120000;

export const useWebSocket = (onMessage: (message: any) => void) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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
        if (isConnected) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authorization token is missing');
            return;
        }

        const ws = new WebSocket(`${WS_URL.replace(/^http/, 'ws')}/ws?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            setIsConnected(true); // Фиксируем состояние соединения

            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }

            if (!heartbeatInterval.current) {
                heartbeatInterval.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
            }

            updateStatusIfChanged(true); // Устанавливаем статус "онлайн" при подключении
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);

            switch (message.type) {
                case 'newMessage':
                case 'editMessage':
                    onMessage(message);
                    break;
                case 'deleteMessage':
                    console.log(`Message with ID ${message.messageId} deleted from chat ${message.chatId}`);
                    onMessage({
                        type: 'deleteMessage',
                        messageId: message.messageId,
                        chatId: message.chatId,
                    });
                    break;
                case 'userAdded':
                    toast.info(`User with ID ${message.userId} added to chat ${message.chatId}`);
                    break;
                case 'userRemoved':
                    toast.info(`User with ID ${message.userId} removed from chat ${message.chatId}`);
                    break;
                case 'roleChange':
                    toast.info(`User with ID ${message.userId} assigned role ${message.newRole}`);
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
            setIsConnected(false); // Сбрасываем статус соединения
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
                heartbeatInterval.current = null;
            }

            updateStatusIfChanged(false); // Устанавливаем статус "оффлайн" при отключении
            wsRef.current = null;
            handleReconnection();
        };
    }, [onMessage, sendHeartbeat, updateStatusIfChanged, isConnected]);

    // Попытка переподключения при разрыве соединения
    const handleReconnection = useCallback(() => {
        if (!reconnectTimeout.current) {
            reconnectTimeout.current = setTimeout(() => {
                console.log('Attempting to reconnect WebSocket...');
                connectWebSocket();
            }, RECONNECT_INTERVAL);
        }
    }, [connectWebSocket]);

    // Инициализация WebSocket при наличии токена
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

    // Подключение WebSocket при наличии пользователя
    useEffect(() => {
        if (currentUserId !== null && !isConnected) {
            connectWebSocket();
        }
    }, [currentUserId, connectWebSocket, isConnected]);

    return wsRef.current;
};
