// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const verifyToken = async () => {
    const response = await api.get('/auth/verify');
    return response.data;
};

// Members APIs
export const fetchMembers = async ({ searchTerm = '', filterStatus = 'all', page = 1, limit = 20 }) => {
    const response = await api.get('/members', {
        params: { search: searchTerm, status: filterStatus, page, limit },
    });
    return response.data;
};

export const addMember = async (memberData) => {
    const formData = new FormData();
    Object.keys(memberData).forEach(key => {
        if (memberData[key] !== null && memberData[key] !== undefined) {
            formData.append(key, memberData[key]);
        }
    });

    const response = await api.post('/members', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateMember = async (id, memberData) => {
    const formData = new FormData();
    Object.keys(memberData).forEach(key => {
        if (memberData[key] !== null && memberData[key] !== undefined) {
            formData.append(key, memberData[key]);
        }
    });

    const response = await api.put(`/members/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteMember = async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
};

export const checkPhoneExists = async (phone, memberId = null) => {
    const response = await api.get('/members/check-phone', {
        params: { phone, memberId },
    });
    return response.data.exists;
};

export const checkEmailExists = async (email, memberId = null) => {
    const response = await api.get('/members/check-email', {
        params: { email, memberId },
    });
    return response.data.exists;
};

// Dashboard APIs
export const fetchStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const fetchExpiringMembers = async () => {
    const response = await api.get('/dashboard/expiring');
    return response.data;
};

export default api;
