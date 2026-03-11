import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-16"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default RootLayout;