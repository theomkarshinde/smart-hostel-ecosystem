export const ROLES = {
    ADMIN: 'admin',
    WARDEN: 'warden',
    STUDENT: 'student',
    STAFF: 'staff',
    GUARD: 'guard',
};

export const STUDENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
