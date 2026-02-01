import api from './api';

const complaintService = {
    raiseComplaint: async (data) => {
        return await api.post('/complaints', data);
    },

    getStudentComplaints: async (studentId) => {
        return await api.get(`/complaints/student/${studentId}`);
    },

    getMessComplaints: async () => {
        return await api.get('/complaints/mess');
    },

    getBuildingComplaints: async (buildingId, status) => {
        if (status === 'ALL') {
            return await api.get(`/complaints/building/${buildingId}/all`);
        }
        return await api.get(`/complaints/building/${buildingId}/status/${status}`);
    },

    updateComplaintStatus: async (complaintId, status, comment) => {
        return await api.put(`/complaints/${complaintId}/status/${status}`, null, {
            params: { comment: comment }
        });
    },

    assignStaff: async (data) => {
        return await api.post('/complaints/action', data);
    }
};

export default complaintService;
