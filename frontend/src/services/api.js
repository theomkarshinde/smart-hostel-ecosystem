import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8084/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        let message = 'An unexpected error occurred. Please try again.';

        if (error.response) {
            const data = error.response.data;
            if (typeof data === 'string') {
                message = data;
            } else if (data && data.message) {
                message = data.message;
            } else if (data && data.error) {
                message = data.error;
            }
        } else if (error.request) {
            message = 'Unable to connect to the server. Please check your internet connection.';
        } else {
            message = error.message;
        }
        error.message = message;

        return Promise.reject(error);
    }
);

export default api;
