import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bookingService from '../services/bookingService';
import toast from 'react-hot-toast';

export const useBookings = (params = {}) => {
    return useQuery({
        queryKey: ['bookings', params],
        queryFn: () => bookingService.getBookings(params)
    });
};

export const useUserBookings = () => {
    return useQuery({
        queryKey: ['userBookings'],
        queryFn: () => bookingService.getUserBookings()
    });
};

export const useBooking = (id) => {
    return useQuery({
        queryKey: ['bookings', id],
        queryFn: () => bookingService.getBooking(id),
        enabled: !!id
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bookingService.createBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['userBookings'] });
            toast.success('Booking created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        }
    });
};

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => bookingService.updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Booking status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update booking');
        }
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bookingService.cancelBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['userBookings'] });
            toast.success('Booking cancelled successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    });
};

export const useCheckAvailability = () => {
    return useMutation({
        mutationFn: bookingService.checkAvailability
    });
};