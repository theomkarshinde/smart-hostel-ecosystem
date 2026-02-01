import api from './api';

const studentService = {
    getStats: async () => {
        const response = await api.get('/students/stats');
        return response.data;
    },

    getProfile: async (username) => {
        const response = await api.get(`/users/by-username/${username}`);
        return response.data;
    },

    getStudentProfile: async () => {
        const response = await api.get('/students/profile');
        return response.data;
    },

    raiseComplaint: async (data) => {
        const response = await api.post('/complaints', data);
        return response.data;
    },

    getMyComplaints: async (studentId) => {
        const response = await api.get(`/complaints/student/${studentId}`);
        return response.data;
    },

    subscribeMess: async (data) => {
        const response = await api.post('/mess/subscription', data);
        return response.data;
    },

    bookLaundry: async (data) => {
        const response = await api.post('/laundry/book', data);
        return response.data;
    },

    getAttendance: async () => {
        const response = await api.get('/attendance/student');
        return response.data;
    },

    markAttendance: async () => {
        const response = await api.post('/attendance/student', {
            attendanceType: 'HOSTEL',
            hostelAction: 'IN'
        });
        return response.data;
    },

    getMessInfo: async () => {
        const response = await api.get('/mess/subscription');
        return response.data;
    },

    getQrCode: async () => {
        const response = await api.get('/students/qr');
        return response.data;
    },

    getLaundryBookings: async () => {
        const response = await api.get('/laundry');
        return response.data;
    },

    getPayments: async () => {
        const response = await api.get('/payments/history');
        return response.data;
    },

    createOrder: async (data) => {
        const response = await api.post('/payments/create-order', data);
        return response.data;
    },

    verifyPayment: async (data) => {
        const response = await api.post('/payments/confirm', data);
        return response.data;
    },

    getMessPlans: async () => {
        const response = await api.get('/mess/plans');
        return response.data;
    },

    getMessMenu: async (date) => {
        const response = await api.get(`/mess/menu/${date}`);
        return response.data;
    },

    searchStudents: async (query) => {
        const response = await api.get(`/students/search?query=${query}`);
        return response.data;
    },

    getMyVisitors: async (studentId) => {
        const response = await api.get(`/visitors/student/${studentId}`);
        return response.data;
    },

    requestVisitor: async (data) => {
        const response = await api.post('/visitors/request', data);
        return response.data;
    },

    setupPayment: async (studentId, isEmi, emiAmount) => {
        const response = await api.patch(`/students/${studentId}/payment-setup`, null, {
            params: { isEmi, emiAmount }
        });
        return response.data;
    },

    payFromWallet: async (studentId, amount) => {
        const response = await api.post(`/payments/${studentId}/pay-from-wallet`, amount);
        return response.data;
    }
};

export default studentService;
