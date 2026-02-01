import { Client } from '@stomp/stompjs';

class NotificationService {
    constructor() {
        this.client = null;
        this.connected = false;
    }

    connect(onMessageReceived) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No token found, cannot connect to WebSocket.");
            return;
        }

        if (this.client && this.client.active) {
            console.log("WebSocket already connected.");
            return;
        }

        const BROKER_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8084/ws';

        this.client = new Client({
            brokerURL: BROKER_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                this.connected = true;

                this.client.subscribe('/user/queue/notifications', (message) => {
                    if (message.body) {
                        const parsedMessage = JSON.parse(message.body);
                        onMessageReceived(parsedMessage);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketClose: () => {
                this.connected = false;
                console.log('WebSocket connection closed');
            }
        });

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.connected = false;
        }
    }

    async sendNotification(data) {
        const { default: api } = await import('./api');
        const response = await api.post('/notifications', data);
        return response.data;
    }

    async getUnreadNotifications(userId) {
        const { default: api } = await import('./api');
        const response = await api.get(`/notifications/unread/${userId}`);
        return response.data;
    }

    async broadcast(data) {
        const { default: api } = await import('./api');
        const response = await api.post('/notifications/broadcast', data);
        return response.data;
    }
}

const notificationService = new NotificationService();
export default notificationService;
