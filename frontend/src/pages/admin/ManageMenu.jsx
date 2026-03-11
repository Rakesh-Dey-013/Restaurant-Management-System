import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import {
  useMenu,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useCategories
} from '../../hooks/useMenu';
import { formatCurrency, handleImageError, getStatusBadge } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader, { SkeletonLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ManageMenu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const { data: menuItems, isLoading } = useMenu();
  const { data: categories } = useCategories();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const handleOpenModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setValue('name', item.name);
      setValue('description', item.description);
      setValue('price', item.price);
      setValue('category', item.category);
      setValue('availability', item.availability);
      if (item.image) {
        setPreviewImage(item.image);
      }
    } else {
      setSelectedItem(null);
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
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('availability', data.availability);

    if (data.image?.[0]) {
      formData.append('image', data.image[0]);
    }

    if (selectedItem) {
      await updateMenuItem.mutateAsync({ id: selectedItem._id, data: formData });
    } else {
      await createMenuItem.mutateAsync(formData);
    }

    setIsModalOpen(false);
    reset();
    setPreviewImage(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteMenuItem.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonLoader type="card" count={6} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Menu</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
          <FiPlus />
          <span>Add New Item</span>
        </Button>
      </div>

      {/* Menu Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems?.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
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
                {!item.availability && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/90 text-xs rounded-full">
                    Unavailable
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className="text-blue-400 font-bold">{formatCurrency(item.price)}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full">
                    {item.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(item.availability ? 'available' : 'cancelled')}`}>
                    {item.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Item Name"
            placeholder="Enter item name"
            error={errors.name?.message}
            {...register('name', { required: 'Item name is required' })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="input-field"
              rows="3"
              placeholder="Enter item description"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.price?.message}
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                className="input-field"
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select category</option>
                {categories?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Image
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="availability"
              className="rounded bg-zinc-800 border-zinc-700"
              {...register('availability')}
            />
            <label htmlFor="availability" className="text-sm text-gray-300">
              Available for order
            </label>
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
              isLoading={createMenuItem.isPending || updateMenuItem.isPending}
            >
              {selectedItem ? 'Update' : 'Create'} Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageMenu;