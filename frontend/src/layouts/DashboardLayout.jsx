import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="ml-64 pt-16 p-8"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default DashboardLayout;