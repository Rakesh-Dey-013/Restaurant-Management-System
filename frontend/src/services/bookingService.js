import api from './api';

export const getBookings = async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response;
};

export const getBooking = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response;
};

export const createBooking = async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response;
};

export const updateBookingStatus = async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response;
};

export const cancelBooking = async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response;
};

export const getUserBookings = async () => {
    const response = await api.get('/bookings/user/my-bookings');
    return response;
};

export const checkAvailability = async (data) => {
    const response = await api.post('/bookings/check-availability', data);
    return response;
};