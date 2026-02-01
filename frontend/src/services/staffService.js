import api from './api';

const staffService = {
    getStats: async () => {
        const response = await api.get('/staff/stats');
        return response.data;
    },

    getAttendance: async () => {
        const response = await api.get('/staff/attendance');
        return response.data;
    },

    markAttendance: async () => {
        const response = await api.post('/staff/attendance/mark');
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/staff/profile');
        return response.data;
    }
};

export default staffService;
