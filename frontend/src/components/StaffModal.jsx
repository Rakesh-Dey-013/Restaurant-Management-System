import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const StaffModal = ({ isOpen, onClose, onSave, staff }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: staff || {
            name: '',
            email: '',
            password: '',
            role: 'waiter',
            phone: '',
            isActive: true,
        },
    });

    useEffect(() => {
        if (staff) {
            reset(staff);
        } else {
            reset({
                name: '',
                email: '',
                password: '',
                role: 'waiter',
                phone: '',
                isActive: true,
            });
        }
    }, [staff, reset]);

    const onSubmit = async (data) => {
        try {
            if (staff) {
                // Update existing staff
                await axios.put(`/api/staff/${staff._id}`, data, { withCredentials: true });
                toast.success('Staff updated successfully');
            } else {
                // Create new staff
                await axios.post('/api/staff', data, { withCredentials: true });
                toast.success('Staff created successfully');
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
                                    {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
                                </Dialog.Title>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                                                    message: 'Invalid email address'
                                                }
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Password {staff && '(Leave blank to keep current)'}
                                        </label>
                                        <input
                                            type="password"
                                            {...register('password', {
                                                required: staff ? false : 'Password is required',
                                                minLength: {
                                                    value: 6,
                                                    message: 'Password must be at least 6 characters'
                                                }
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            {...register('phone', { required: 'Phone number is required' })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Role
                                        </label>
                                        <select
                                            {...register('role', { required: 'Role is required' })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/20"
                                        >
                                            <option value="waiter">Waiter</option>
                                            <option value="chef">Chef</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    {staff && (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                {...register('isActive')}
                                                id="isActive"
                                                className="h-4 w-4 rounded border-white/10 bg-white/5 text-white focus:ring-0"
                                            />
                                            <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                                                Active
                                            </label>
                                        </div>
                                    )}

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
                                            {isSubmitting ? 'Saving...' : staff ? 'Update' : 'Create'}
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

export default StaffModal;