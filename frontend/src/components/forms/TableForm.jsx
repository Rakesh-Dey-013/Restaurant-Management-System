import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiUpload, FiX } from 'react-icons/fi';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TABLE_STATUS } from '../../utils/constants';

const TableForm = ({ initialData, onSubmit, isLoading, onCancel }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      tableNumber: '',
      seats: '',
      status: 'available'
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
          Table Image
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

      {/* Table Number and Seats */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Table Number"
          type="number"
          placeholder="Enter table number"
          error={errors.tableNumber?.message}
          {...register('tableNumber', { 
            required: 'Table number is required',
            min: { value: 1, message: 'Table number must be at least 1' }
          })}
        />

        <Input
          label="Number of Seats"
          type="number"
          placeholder="Enter seats"
          error={errors.seats?.message}
          {...register('seats', { 
            required: 'Number of seats is required',
            min: { value: 1, message: 'At least 1 seat required' },
            max: { value: 20, message: 'Maximum 20 seats allowed' }
          })}
        />
      </div>

      {/* Status */}
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
        {errors.status && (
          <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
        )}
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
          {initialData ? 'Update' : 'Create'} Table
        </Button>
      </div>
    </form>
  );
};

export default TableForm;