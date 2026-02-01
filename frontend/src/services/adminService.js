import api from './api';

const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getAllBuildings: async () => {
        const response = await api.get('/buildings');
        return response.data;
    },

    createBuilding: async (data) => {
        const response = await api.post('/buildings', data);
        return response.data;
    },

    addStaff: async (data) => {
        const response = await api.post('/admin/staff/add', data);
        return response.data;
    },

    listStaff: async () => {
        const response = await api.get('/admin/staff/list');
        return response.data;
    },

    updateStaff: async (staffId, data) => {
        const response = await api.put(`/admin/staff/update/${staffId}`, data);
        return response.data;
    },

    deleteUser: async (username) => {
        const response = await api.delete(`/admin/users/${username}`);
        return response.data;
    },

    listStaffByType: async (type) => {
        const response = await api.get(`/staff/type/${type}`);
        return response.data;
    },

    getAllWardens: async () => {
        return adminService.listStaffByType('WARDEN');
    },

    getUnassignedWardens: async () => {
        const response = await api.get('/admin/wardens/unassigned');
        return response.data;
    },

    getUnassignedBuildings: async () => {
        const response = await api.get('/admin/buildings/unassigned');
        return response.data;
    },

    allocateStaff: async (data) => {
        const response = await api.post('/admin/staff/allocation', data);
        return response.data;
    },

    assignWarden: async (buildingId, wardenId) => {
        return adminService.allocateStaff({ buildingId, staffId: wardenId });
    },

    generateQR: async (username) => {
        const response = await api.get(`/admin/qr/generate?username=${username}`);
        return response.data;
    }
};

export default adminService;
