import { useEffect } from 'react';

const WS_URL = process.env.WS_URL || 'ws://localhost:4005';

export const useWebSocket = (onMessage: (message: any) => void) => {
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Authorization token is missing');
            return;
        }

        let ws: WebSocket;
        const connectWebSocket = () => {
            ws = new WebSocket(`${WS_URL.replace(/^http/, 'ws')}/ws?token=${token}`);

            ws.onopen = () => {
                console.log('WebSocket connection opened');
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
                if (event.code === 1006 || event.code === 1005) {
                    // Попробовать переподключение после 1 секунды
                    console.log('Attempting to reconnect WebSocket...');
                    setTimeout(connectWebSocket, 1000);
                }
            };
        };

        connectWebSocket();

        return () => {
            ws.close();
        };
    }, [onMessage]);
};
