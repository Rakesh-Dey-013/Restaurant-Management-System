import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as loginService, logout as logoutService, getProfile } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await getProfile();
                setUser(userData);
            }
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const data = await loginService(email, password);
            setUser(data);
            localStorage.setItem('token', data.token);
            toast.success(`Welcome back, ${data.name}!`);

            // Redirect based on role
            switch (data.role) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'manager':
                    navigate('/manager/dashboard');
                    break;
                case 'staff':
                    navigate('/staff/dashboard');
                    break;
                default:
                    navigate('/');
            }

            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return { success: false, error: error.response?.data?.message };
        }
    };

    const logout = async () => {
        try {
            await logoutService();
            setUser(null);
            localStorage.removeItem('token');
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager',
        isStaff: user?.role === 'staff',
        isCustomer: user?.role === 'customer'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};