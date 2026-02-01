import api from './api';

const guardService = {
    getStats: async () => {
        const response = await api.get('/guard/stats');
        return response.data;
    },

    getRecentVisitors: async () => {
        const response = await api.get('/guard/visitors/recent');
        return response.data;
    },

    logVisitor: async (data) => {
        const response = await api.post('/guard/visitor', data);
        return response.data;
    },

    markQrAttendance: async (qrString, type) => {
        const response = await api.post(`/attendance/qr?token=${qrString}&type=${type}`);
        return response.data;
    },

    manualStudentEntry: async (username, data) => {
        const response = await api.post(`/attendance/student/manual/${username}`, data);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/staff/profile');
        return response.data;
    },

    checkoutVisitor: async (visitorId) => {
        const response = await api.put(`/visitors/${visitorId}/status/CHECKED_OUT`);
        return response.data;
    },

    searchStudents: async (query) => {
        const response = await api.get(`/students/search?query=${query}`);
        return response.data;
    }
};

export default guardService;
