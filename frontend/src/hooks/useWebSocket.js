import { useEffect, useState } from 'react';
import notificationService from '../services/notificationService';

const useWebSocket = (url, onMessageReceived) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        notificationService.connect((message) => {
            if (onMessageReceived) {
                onMessageReceived(message);
            }
        });
        setIsConnected(true);

        return () => {
            notificationService.disconnect();
            setIsConnected(false);
        };
    }, [url, onMessageReceived]);

    const sendMessage = (msg) => {
        console.warn("Sending messages via WebSocket is not yet implemented in notificationService.");
    };

    return { isConnected, sendMessage };
};

export default useWebSocket;
