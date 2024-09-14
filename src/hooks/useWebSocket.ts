import { useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const useWebSocket = (onMessage: (message: any) => void) => {
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const ws = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws?token=${token}`);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            onMessage(message);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    }, [onMessage]);
};
