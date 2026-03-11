import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await authService.register(userData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
            return { success: true, data: response };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return { success: false, error: error.response?.data?.message };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (userData) => {
        setLoading(true);
        try {
            const response = await authService.updateProfile(userData);
            toast.success('Profile updated successfully');
            return { success: true, data: response };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
            return { success: false, error: error.response?.data?.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        register,
        updateProfile,
        loading
    };
};