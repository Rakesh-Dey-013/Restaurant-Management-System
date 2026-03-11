import api from './api';

export const getInventory = async (params = {}) => {
  const response = await api.get('/inventory', { params });
  return response;
};

export const getInventoryItem = async (id) => {
  const response = await api.get(`/inventory/${id}`);
  return response;
};

export const createInventoryItem = async (data) => {
  const response = await api.post('/inventory', data);
  return response;
};

export const updateInventoryItem = async (id, data) => {
  const response = await api.put(`/inventory/${id}`, data);
  return response;
};

export const deleteInventoryItem = async (id) => {
  const response = await api.delete(`/inventory/${id}`);
  return response;
};

export const updateInventoryQuantity = async (id, quantity, operation) => {
  const response = await api.patch(`/inventory/${id}/quantity`, { quantity, operation });
  return response;
};

export const getLowStockItems = async () => {
  const response = await api.get('/inventory/low-stock/all');
  return response;
};