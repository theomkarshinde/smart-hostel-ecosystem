import api from './api';

const qrcodeService = {
    generateQRCode: async (username) => {
        try {
            const response = await api.get(`/qrcode/generate`, {
                params: { username }
            });
            return response.data;
        } catch (error) {
            console.error("Error generating QR code:", error);
            throw error;
        }
    },

    markAttendance: async (qrData) => {
        try {
            const response = await api.post('/attendance/qr', { token: qrData });
            return response.data;
        } catch (error) {
            console.error("Error marking attendance:", error);
            throw error;
        }
    }
};

export default qrcodeService;
