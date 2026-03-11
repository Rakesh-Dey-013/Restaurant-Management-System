import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as inventoryService from '../services/inventoryService';
import toast from 'react-hot-toast';

export const useInventory = (params = {}) => {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.getInventory(params)
  });
};

export const useInventoryItem = (id) => {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: !!id
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryService.getLowStockItems()
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryService.createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory item created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create item');
    }
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => inventoryService.updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory item updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryService.deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory item deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  });
};

export const useUpdateInventoryQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity, operation }) => 
      inventoryService.updateInventoryQuantity(id, quantity, operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Quantity updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  });
};