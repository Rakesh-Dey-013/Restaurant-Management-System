import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { MENU_CATEGORIES } from '../../utils/constants';

const MenuForm = ({ initialData, onSubmit, isLoading, onCancel }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: '',
      description: '',
      price: '',
      category: '',
      availability: true
    }
  });

  useEffect(() => {
    if (initialData?.image) {
      setImagePreview(initialData.image);
    }
  }, [initialData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('image', null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Food Image
        </label>
        <div className="flex items-center space-x-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <FiUpload className="w-8 h-8 mb-2" />
              <span className="text-xs">Upload Image</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload"
            {...register('image')}
            onChange={handleImageChange}
          />
          <label
            htmlFor="image-upload"
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Choose File
          </label>
        </div>
      </div>

      {/* Name */}
      <Input
        label="Item Name"
        placeholder="Enter item name"
        error={errors.name?.message}
        {...register('name', { 
          required: 'Item name is required',
          minLength: {
            value: 2,
            message: 'Name must be at least 2 characters'
          }
        })}
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          className="input-field"
          rows="4"
          placeholder="Enter item description"
          {...register('description', { 
            required: 'Description is required',
            maxLength: {
              value: 500,
              message: 'Description cannot exceed 500 characters'
            }
          })}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Price and Category */}
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
            {Object.values(MENU_CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="availability"
          className="rounded bg-zinc-800 border-zinc-700"
          {...register('availability')}
        />
        <label htmlFor="availability" className="text-sm text-gray-300">
          Available for ordering
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {initialData ? 'Update' : 'Create'} Item
        </Button>
      </div>
    </form>
  );
};

export default MenuForm;