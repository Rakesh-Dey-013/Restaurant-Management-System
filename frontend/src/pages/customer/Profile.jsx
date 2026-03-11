import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useAuth as useAuthHook } from '../../hooks/useAuth';
import api from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getInitials, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, login } = useAuth();
  const { updateProfile } = useAuthHook();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      phone: user?.phone || ''
    }
  });

  const { register: passwordRegister, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/auth/profile', data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      login(data.email, ''); // Update context with new data
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/auth/profile', { password: data.newPassword });
      return response;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      resetPassword();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });

  const onProfileSubmit = async (data) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    await changePasswordMutation.mutateAsync(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
            {getInitials(user?.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-gray-400 capitalize">{user?.role}</p>
            <p className="text-sm text-gray-500 mt-1">Member since {formatDate(user?.createdAt)}</p>
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardBody>
          {isEditing ? (
            <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                icon={FiUser}
                placeholder="Enter your full name"
                error={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
              />

              <Input
                label="Email"
                type="email"
                icon={FiMail}
                placeholder="Enter your email"
                error={errors.email?.message}
                disabled
                {...register('email')}
              />

              <Input
                label="Phone Number"
                type="tel"
                icon={FiPhone}
                placeholder="Enter your phone number"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updateProfileMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <FiSave />
                  <span>Save Changes</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiUser className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Full Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="font-medium">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Change Password</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={FiLock}
              placeholder="Enter current password"
              error={passwordErrors.currentPassword?.message}
              {...passwordRegister('currentPassword', { 
                required: 'Current password is required' 
              })}
            />

            <Input
              label="New Password"
              type="password"
              icon={FiLock}
              placeholder="Enter new password"
              error={passwordErrors.newPassword?.message}
              {...passwordRegister('newPassword', { 
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={FiLock}
              placeholder="Confirm new password"
              error={passwordErrors.confirmPassword?.message}
              {...passwordRegister('confirmPassword', { 
                required: 'Please confirm your password'
              })}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={changePasswordMutation.isPending}
            >
              Change Password
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Account Statistics</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 glass-card rounded-lg">
              <p className="text-2xl font-bold text-blue-400">0</p>
              <p className="text-sm text-gray-400">Total Bookings</p>
            </div>
            <div className="text-center p-4 glass-card rounded-lg">
              <p className="text-2xl font-bold text-green-400">0</p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
            <div className="text-center p-4 glass-card rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">0</p>
              <p className="text-sm text-gray-400">Upcoming</p>
            </div>
            <div className="text-center p-4 glass-card rounded-lg">
              <p className="text-2xl font-bold text-purple-400">0</p>
              <p className="text-sm text-gray-400">Cancelled</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;