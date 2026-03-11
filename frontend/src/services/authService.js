import api from './api';

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
};

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response;
};

export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response;
};

export const updateProfile = async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response;
};