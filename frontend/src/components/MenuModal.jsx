import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MenuModal = ({ isOpen, onClose, onSave, menuItem }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: menuItem || {
      name: '',
      description: '',
      price: '',
      category: 'main-course',
      type: 'veg',
      isAvailable: true,
    },
  });

  useEffect(() => {
    if (menuItem) {
      reset(menuItem);
      // Set image preview if exists
      if (menuItem.imageUrl) {
        setImagePreview(menuItem.imageUrl);
      } else if (menuItem.image) {
        // For cases where we only have filename
        setImagePreview(`http://localhost:5000/uploads/${menuItem.image}`);
      }
    } else {
      reset({
        name: '',
        description: '',
        price: '',
        category: 'main-course',
        type: 'veg',
        isAvailable: true,
      });
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [menuItem, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    // Reset file input
    document.getElementById('image-upload').value = '';
  };

  const onSubmit = async (data) => {
    try {
      // Convert price to number
      data.price = parseFloat(data.price);

      // Create FormData for file upload
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Append file if selected
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      };

      if (menuItem) {
        // Update existing menu item
        await axios.put(`/api/menu/${menuItem._id}`, formData, config);
        toast.success('Menu item updated successfully');
      } else {
        // Create new menu item
        await axios.post('/api/menu', formData, config);
        toast.success('Menu item created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium text-white mb-4">
                  {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Food Image
                    </label>
                    
                    {imagePreview ? (
                      <div className="relative mb-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-all"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-all"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <PhotoIcon className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="mb-2 text-sm text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows="3"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { 
                        required: 'Price is required',
                        min: {
                          value: 0,
                          message: 'Price must be positive'
                        }
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                    >
                      <option value="appetizer">Appetizer</option>
                      <option value="main-course">Main Course</option>
                      <option value="dessert">Dessert</option>
                      <option value="beverage">Beverage</option>
                      <option value="soup">Soup</option>
                      <option value="salad">Salad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="veg"
                          {...register('type', { required: 'Type is required' })}
                          className="h-4 w-4 text-white focus:ring-0 bg-white/5 border-white/10"
                        />
                        <span className="ml-2 text-sm text-gray-300">Veg</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="non-veg"
                          {...register('type', { required: 'Type is required' })}
                          className="h-4 w-4 text-white focus:ring-0 bg-white/5 border-white/10"
                        />
                        <span className="ml-2 text-sm text-gray-300">Non-Veg</span>
                      </label>
                    </div>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-400">{errors.type.message}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isAvailable')}
                      id="isAvailable"
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-white focus:ring-0"
                    />
                    <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-300">
                      Available
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : menuItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MenuModal;