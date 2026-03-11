import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as menuService from '../services/menuService';
import toast from 'react-hot-toast';

export const useMenu = (params = {}) => {
    return useQuery({
        queryKey: ['menu', params],
        queryFn: () => menuService.getMenuItems(params)
    });
};

export const useMenuItem = (id) => {
    return useQuery({
        queryKey: ['menu', id],
        queryFn: () => menuService.getMenuItem(id),
        enabled: !!id
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => menuService.getCategories()
    });
};

export const useCreateMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: menuService.createMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu'] });
            toast.success('Menu item created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create menu item');
        }
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => menuService.updateMenuItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu'] });
            toast.success('Menu item updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update menu item');
        }
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: menuService.deleteMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu'] });
            toast.success('Menu item deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete menu item');
        }
    });
};