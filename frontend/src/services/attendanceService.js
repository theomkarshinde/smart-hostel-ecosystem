import api from './api';

const attendanceService = {
    getMyAttendance: async () => {
        const response = await api.get('/attendance/student');
        return response.data;
    },

    markByQr: async (token, type) => {
        const response = await api.post(`/attendance/qr?token=${token}&type=${type}`);
        return response.data;
    },

    markStudentManual: async (data) => {
        const response = await api.post('/attendance/student', data);
        return response.data;
    },

    markStaff: async (staffId, buildingId, action) => {
        const response = await api.post('/attendance/staff', {
            staffId,
            buildingId,
            action
        });
        return response.data;
    },
    
    getMarkableStaff: async () => {
        const response = await api.get('/attendance/markable-staff');
        return response.data;
    }
};

export default attendanceService;
