import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { updateUserStatus } from './api';
import {jwtDecode} from 'jwt-decode';

const WS_URL = process.env.WS_URL || 'ws://localhost:4005';
const RECONNECT_INTERVAL = 3000;
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 минут

export const useWebSocket = (onMessage: (message: any) => void) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const sendHeartbeat = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
            console.log('Heartbeat sent');
        } else {
            console.warn('WebSocket is not open. Skipping heartbeat.');
        }
    };

    const connectWebSocket = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Authorization token is missing');
            return;
        }

        const ws = new WebSocket(`${WS_URL.replace(/^http/, 'ws')}/ws?token=${token}`);
        wsRef.current = ws;

        ws.onopen = async () => {
            console.log('WebSocket connection opened');

            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }

            if (!heartbeatInterval.current) {
                heartbeatInterval.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
            }

            if (token && currentUserId !== null) {
                console.log('Attempting to update user status to online', { currentUserId, token });
                try {
                    await updateUserStatus(currentUserId, true, token);
                    console.log('User status updated to online');
                } catch (error) {
                    console.error('Failed to update user status:', error);
                }
            }
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);

            if (!message.message.sender) {
                console.error('Sender information is missing:', message);
            } else {
                console.log('Sender information:', message.message.sender);
            }

            onMessage(message);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = async (event) => {
            console.error('WebSocket connection closed with code', event.code, 'reason:', event.reason);

            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
                heartbeatInterval.current = null;
            }

            if (token && currentUserId !== null) {
                try {
                    await updateUserStatus(currentUserId, false, token);
                    console.log('User status updated to offline');
                } catch (error) {
                    console.error('Failed to update user status:', error);
                }
            }

            wsRef.current = null;
            handleReconnection();
        };
    };

    const handleReconnection = () => {
        if (reconnectTimeout.current) {
            return;
        }

        reconnectTimeout.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');

            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
                heartbeatInterval.current = null;
            }

            connectWebSocket();
        }, RECONNECT_INTERVAL);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken: { id: number } = jwtDecode(token);
                setCurrentUserId(decodedToken.id);
                console.log('Текущий пользователь (ID):', decodedToken.id);
            } catch (error) {
                console.error('Failed to decode token', error);
            }
        }
    }, []);

    useEffect(() => {
        if (currentUserId !== null) {
            connectWebSocket();
        }
    }, [currentUserId, onMessage]);

    return wsRef.current;
};
