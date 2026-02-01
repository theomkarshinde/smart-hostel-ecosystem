import api from './api';

const wardenService = {
    getStats: async () => {
        const response = await api.get('/warden/stats');
        return response.data;
    },

    getPendingStudents: async () => {
        const response = await api.get('/students/status/PENDING');
        return response.data;
    },

    getMyBuildings: async () => {
        const response = await api.get('/buildings/my');
        return response.data;
    },

    getRooms: async (buildingId) => {
        const response = await api.get(`/buildings/${buildingId}/rooms`);
        return response.data;
    },

    approveStudent: async (studentId, buildingId, feeData) => {
        const response = await api.put(`/students/${studentId}/approve/${buildingId}`, feeData);
        return response.data;
    },

    rejectStudent: async (studentId) => {
        const response = await api.put(`/students/${studentId}/reject`);
        return response.data;
    },

    generateQR: async (username) => {
        const response = await api.get(`/admin/qr/generate?username=${username}`);
        return response.data;
    },

    getMessPlans: async () => {
        const response = await api.get('/mess/plans');
        return response.data;
    },

    createMessPlan: async (data) => {
        const response = await api.post('/mess/plans', data);
        return response.data;
    },

    updateMessPlan: async (id, data) => {
        const response = await api.put(`/mess/plans/${id}`, data);
        return response.data;
    },

    deleteMessPlan: async (id) => {
        const response = await api.delete(`/mess/plans/${id}`);
        return response.data;
    },

    addMessMenu: async (data) => {
        const response = await api.post('/mess/menu', data);
        return response.data;
    },

    getMessMenu: async (date) => {
        const response = await api.get(`/mess/menu/${date}`);
        return response.data;
    },

    getAllLaundry: async () => {
        const response = await api.get('/laundry/all');
        return response.data;
    },

    updateLaundryStatus: async (id, status) => {
        const response = await api.put(`/laundry/${id}/status/${status}`);
        return response.data;
    },

    addCashPayment: async (data) => {
        const response = await api.post('/payments/add-cash', data);
        return response.data;
    },

    markQrAttendance: async (qrString, type) => {
        const response = await api.post(`/attendance/qr?token=${qrString}&type=${type}`);
        return response.data;
    },

    getStaffByType: async (type) => {
        const response = await api.get(`/staff/type/${type}`);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/warden/profile');
        return response.data;
    },

    getPendingVisitors: async (buildingId) => {
        const response = await api.get(`/visitors/building/${buildingId}/pending`);
        return response.data;
    },

    updateVisitorStatus: async (visitorId, status) => {
        const response = await api.put(`/visitors/${visitorId}/status/${status}`);
        return response.data;
    },

    getStudents: async () => {
        const response = await api.get('/warden/students');
        return response.data;
    },

    updateStudent: async (id, data) => {
        const response = await api.put(`/warden/students/${id}`, data);
        return response.data;
    },

    registerStudent: async (data) => {
        const response = await api.post('/warden/students/register', data);
        return response.data;
    },

    getAllocatedRooms: async (buildingId) => {
        const response = await api.get(`/students/allocated-rooms/${buildingId}`);
        return response.data;
    }
};

export default wardenService;
