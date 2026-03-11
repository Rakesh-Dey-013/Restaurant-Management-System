import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiUser, FiMail, FiPhone, FiShield } from 'react-icons/fi';
import api from '../../services/api';
import { ROLES } from '../../utils/constants';
import { getInitials, formatDate } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader, { SkeletonLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response;
    }
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/users', userData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/users/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/users/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('phone', user.phone);
      setValue('role', user.role);
    } else {
      setSelectedUser(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    if (selectedUser) {
      await updateUser.mutateAsync({ id: selectedUser._id, data });
    } else {
      await createUser.mutateAsync(data);
    }
  };

  const handleDelete = async (id, role) => {
    if (role === ROLES.ADMIN) {
      toast.error('Cannot delete admin user');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser.mutateAsync(id);
    }
  };

  // Filter users
  const filteredUsers = usersData?.users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      [ROLES.ADMIN]: 'bg-purple-500/20 text-purple-500',
      [ROLES.MANAGER]: 'bg-blue-500/20 text-blue-500',
      [ROLES.STAFF]: 'bg-green-500/20 text-green-500',
      [ROLES.CUSTOMER]: 'bg-gray-500/20 text-gray-400'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400';
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
          <FiPlus />
          <span>Add New User</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid md:grid-cols-2 gap-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FiUser}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Roles</option>
          {Object.values(ROLES).map(role => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers?.map((user, index) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={() => handleOpenModal(user)}
                  className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(user._id, user.role)}
                  disabled={user.role === ROLES.ADMIN}
                  className={`p-2 rounded-lg transition-colors ${
                    user.role === ROLES.ADMIN 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(user.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FiMail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <FiPhone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FiShield className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            icon={FiUser}
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            icon={FiMail}
            error={errors.email?.message}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
              }
            })}
          />

          <Input
            label="Phone (Optional)"
            type="tel"
            placeholder="Enter phone number"
            icon={FiPhone}
            error={errors.phone?.message}
            {...register('phone')}
          />

          {!selectedUser && (
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              icon={FiShield}
              error={errors.password?.message}
              {...register('password', { 
                required: !selectedUser && 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Role
            </label>
            <select
              className="input-field"
              {...register('role', { required: 'Role is required' })}
            >
              <option value="">Select role</option>
              {Object.values(ROLES).filter(role => role !== ROLES.CUSTOMER).map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
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
              isLoading={createUser.isPending || updateUser.isPending}
            >
              {selectedUser ? 'Update' : 'Create'} User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUsers;