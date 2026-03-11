import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiGrid, FiUsers } from 'react-icons/fi';
import api from '../../services/api';
import { TABLE_STATUS } from '../../utils/constants';
import { getStatusBadge } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ManageTables = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch tables
  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get('/tables');
      return response;
    }
  });

  // Create table mutation
  const createTable = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/tables', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table created successfully');
      setIsModalOpen(false);
      reset();
      setPreviewImage(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create table');
    }
  });

  // Update table mutation
  const updateTable = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/tables/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table updated successfully');
      setIsModalOpen(false);
      reset();
      setPreviewImage(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update table');
    }
  });

  // Delete table mutation
  const deleteTable = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/tables/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete table');
    }
  });

  const handleOpenModal = (table = null) => {
    if (table) {
      setSelectedTable(table);
      setValue('tableNumber', table.tableNumber);
      setValue('seats', table.seats);
      setValue('status', table.status);
      if (table.image) {
        setPreviewImage(table.image);
      }
    } else {
      setSelectedTable(null);
      reset();
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('tableNumber', data.tableNumber);
    formData.append('seats', data.seats);
    formData.append('status', data.status);

    if (data.image?.[0]) {
      formData.append('image', data.image[0]);
    }

    if (selectedTable) {
      await updateTable.mutateAsync({ id: selectedTable._id, data: formData });
    } else {
      await createTable.mutateAsync(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      await deleteTable.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Tables</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
          <FiPlus />
          <span>Add New Table</span>
        </Button>
      </div>

      {/* Tables Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables?.map((table, index) => (
          <motion.div
            key={table._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 z-10">
                <button
                  onClick={() => handleOpenModal(table)}
                  className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(table._id)}
                  className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative h-40 mb-4 overflow-hidden rounded-lg">
                <img
                  src={table.image}
                  alt={`Table ${table.tableNumber}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Table {table.tableNumber}</h3>
                
                <div className="flex justify-center items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <FiUsers className="w-4 h-4" />
                    <span>{table.seats} seats</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <FiGrid className="w-4 h-4" />
                    <span>#{table.tableNumber}</span>
                  </div>
                </div>

                <span className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusBadge(table.status)}`}>
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Table Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTable ? 'Edit Table' : 'Add New Table'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Table Number"
            type="number"
            placeholder="Enter table number"
            icon={FiGrid}
            error={errors.tableNumber?.message}
            {...register('tableNumber', { 
              required: 'Table number is required',
              min: { value: 1, message: 'Table number must be at least 1' }
            })}
          />

          <Input
            label="Number of Seats"
            type="number"
            placeholder="Enter number of seats"
            icon={FiUsers}
            error={errors.seats?.message}
            {...register('seats', { 
              required: 'Number of seats is required',
              min: { value: 1, message: 'At least 1 seat required' },
              max: { value: 20, message: 'Maximum 20 seats allowed' }
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              className="input-field"
              {...register('status', { required: 'Status is required' })}
            >
              {Object.values(TABLE_STATUS).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Table Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="input-field"
              onChange={handleImageChange}
              {...register('image')}
            />
            {previewImage && (
              <div className="mt-2">
                <img src={previewImage} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createTable.isPending || updateTable.isPending}
            >
              {selectedTable ? 'Update' : 'Create'} Table
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTables;