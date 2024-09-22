import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const WS_URL = process.env.WS_URL || 'ws://localhost:4005';
const RECONNECT_INTERVAL = 3000;

export const useWebSocket = (onMessage: (message: any) => void) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const connectWebSocket = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authorization token is missing');
            return;
        }

        const ws = new WebSocket(`${WS_URL.replace(/^http/, 'ws')}/ws?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);
            onMessage(message);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = (event) => {
            console.error('WebSocket connection closed with code', event.code, 'reason:', event.reason);
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
            connectWebSocket();
        }, RECONNECT_INTERVAL);
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [onMessage]);

    return wsRef.current;
};
