import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Redirect based on role
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'manager':
        return <Navigate to="/manager/dashboard" replace />;
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default AuthLayout;