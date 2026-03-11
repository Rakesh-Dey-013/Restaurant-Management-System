import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tableService from '../services/tableService';
import toast from 'react-hot-toast';

export const useTables = (params = {}) => {
  return useQuery({
    queryKey: ['tables', params],
    queryFn: () => tableService.getTables(params)
  });
};

export const useTable = (id) => {
  return useQuery({
    queryKey: ['tables', id],
    queryFn: () => tableService.getTable(id),
    enabled: !!id
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableService.createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create table');
    }
  });
};

export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => tableService.updateTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update table');
    }
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tableService.deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete table');
    }
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => tableService.updateTableStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update table status');
    }
  });
};