import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiPackage, FiAlertCircle, FiMinus, FiPlus as FiPlusIcon } from 'react-icons/fi';
import api from '../../services/api';
import { INVENTORY_UNITS } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityOperation, setQuantityOperation] = useState('add');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { register: quantityRegister, handleSubmit: handleQuantitySubmit, reset: resetQuantity } = useForm();

  // Fetch inventory
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/inventory');
      return response;
    }
  });

  // Create item mutation
  const createItem = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/inventory', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item added successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add item');
    }
  });

  // Update item mutation
  const updateItem = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/inventory/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item updated successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  });

  // Delete item mutation
  const deleteItem = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/inventory/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  });

  // Update quantity mutation
  const updateQuantity = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/inventory/${id}/quantity`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Quantity updated successfully');
      setIsQuantityModalOpen(false);
      resetQuantity();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setValue('itemName', item.itemName);
      setValue('quantity', item.quantity);
      setValue('unit', item.unit);
      setValue('supplier', item.supplier);
      setValue('minThreshold', item.minThreshold);
    } else {
      setSelectedItem(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleOpenQuantityModal = (item) => {
    setSelectedItem(item);
    setIsQuantityModalOpen(true);
  };

  const onSubmit = async (data) => {
    if (selectedItem) {
      await updateItem.mutateAsync({ id: selectedItem._id, data });
    } else {
      await createItem.mutateAsync(data);
    }
  };

  const onQuantitySubmit = async (data) => {
    await updateQuantity.mutateAsync({
      id: selectedItem._id,
      data: {
        quantity: data.quantity,
        operation: quantityOperation
      }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem.mutateAsync(id);
    }
  };

  const lowStockItems = inventory?.filter(item => item.quantity <= item.minThreshold) || [];

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
          <FiPlus />
          <span>Add New Item</span>
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-orange-500/30">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-orange-400 mb-2">Low Stock Alert ({lowStockItems.length} items)</h3>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <span key={item._id} className="text-sm bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
                    {item.itemName}: {item.quantity} {item.unit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Inventory Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory?.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`group relative ${item.quantity <= item.minThreshold ? 'border-orange-500/30' : ''}`}>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={() => handleOpenQuantityModal(item)}
                  className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  title="Update Quantity"
                >
                  <FiPackage className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{item.itemName}</h3>
                  <p className="text-sm text-gray-400">{item.supplier}</p>
                </div>
                <FiPackage className="w-8 h-8 text-gray-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Quantity:</span>
                  <span className={`font-bold ${item.quantity <= item.minThreshold ? 'text-orange-400' : 'text-green-400'}`}>
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Min Threshold:</span>
                  <span className="text-gray-300">{item.minThreshold} {item.unit}</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.quantity <= item.minThreshold ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((item.quantity / item.minThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setQuantityOperation('subtract');
                    setIsQuantityModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors flex items-center justify-center space-x-1"
                >
                  <FiMinus className="w-4 h-4" />
                  <span>Use</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setQuantityOperation('add');
                    setIsQuantityModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors flex items-center justify-center space-x-1"
                >
                  <FiPlusIcon className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Edit Inventory Item' : 'Add New Item'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Item Name"
            placeholder="Enter item name"
            error={errors.itemName?.message}
            {...register('itemName', { required: 'Item name is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              step="0.01"
              placeholder="0"
              error={errors.quantity?.message}
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity must be positive' }
              })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Unit
              </label>
              <select
                className="input-field"
                {...register('unit', { required: 'Unit is required' })}
              >
                <option value="">Select unit</option>
                {INVENTORY_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Supplier"
            placeholder="Enter supplier name"
            error={errors.supplier?.message}
            {...register('supplier', { required: 'Supplier is required' })}
          />

          <Input
            label="Minimum Threshold"
            type="number"
            placeholder="10"
            error={errors.minThreshold?.message}
            {...register('minThreshold', { 
              required: 'Minimum threshold is required',
              min: { value: 0, message: 'Threshold must be positive' }
            })}
          />

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
              isLoading={createItem.isPending || updateItem.isPending}
            >
              {selectedItem ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Quantity Modal */}
      <Modal
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        title={`Update Quantity - ${selectedItem?.itemName}`}
        size="sm"
      >
        <form onSubmit={handleQuantitySubmit(onQuantitySubmit)} className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Current Quantity:</p>
            <p className="text-2xl font-bold">{selectedItem?.quantity} {selectedItem?.unit}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Operation
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setQuantityOperation('add')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  quantityOperation === 'add'
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                }`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setQuantityOperation('subtract')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  quantityOperation === 'subtract'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                }`}
              >
                Use
              </button>
            </div>
          </div>

          <Input
            label={`Quantity to ${quantityOperation === 'add' ? 'Add' : 'Use'}`}
            type="number"
            step="0.01"
            placeholder="Enter quantity"
            {...quantityRegister('quantity', { 
              required: 'Quantity is required',
              min: { value: 0.01, message: 'Quantity must be greater than 0' }
            })}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsQuantityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateQuantity.isPending}
            >
              Update Quantity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;