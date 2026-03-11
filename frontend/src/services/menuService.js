import api from './api';

export const getMenuItems = async (params = {}) => {
    const response = await api.get('/menu', { params });
    return response;
};

export const getMenuItem = async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response;
};

export const createMenuItem = async (formData) => {
    const response = await api.post('/menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
};

export const updateMenuItem = async (id, formData) => {
    const response = await api.put(`/menu/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
};

export const deleteMenuItem = async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response;
};

export const getCategories = async () => {
    const response = await api.get('/menu/categories/all');
    return response;
};