import api from './api';

export const getTables = async (params = {}) => {
  const response = await api.get('/tables', { params });
  return response;
};

export const getTable = async (id) => {
  const response = await api.get(`/tables/${id}`);
  return response;
};

export const createTable = async (formData) => {
  const response = await api.post('/tables', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response;
};

export const updateTable = async (id, formData) => {
  const response = await api.put(`/tables/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response;
};

export const deleteTable = async (id) => {
  const response = await api.delete(`/tables/${id}`);
  return response;
};

export const updateTableStatus = async (id, status) => {
  const response = await api.patch(`/tables/${id}/status`, { status });
  return response;
};