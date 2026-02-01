import api from './api';

const authService = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                userId: response.data.userId,
                roleId: response.data.roleId,
                role: response.data.role,
                username: username
            }));
        }
        return response.data;
    },

    registerStudent: async (data) => {
        const response = await api.post('/auth/register', { ...data, isActive: true });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
};

export default authService;
