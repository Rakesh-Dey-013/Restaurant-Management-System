// src/components/common/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiHome, 
  FiBookOpen,
  FiCalendar 
} from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Menu', path: '/menu', icon: FiBookOpen },
    { name: 'Book Table', path: '/book-table', icon: FiCalendar }, // Add book table link
  ];

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              RMS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <item.icon className="inline-block mr-1" />
                {item.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm text-gray-300">{user.name}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 glass-card rounded-lg overflow-hidden"
                    >
                      <Link
                        to={`/${user.role}/dashboard`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser className="inline-block mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                      >
                        <FiLogOut className="inline-block mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-gray-300 border border-gray-700 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-white/10 rounded-none"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="inline-block mr-2" />
                  {item.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiUser className="inline-block mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/10 rounded-md text-base font-medium"
                  >
                    <FiLogOut className="inline-block mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-white bg-blue-600 rounded-md text-base font-medium text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-gray-300 border border-gray-700 rounded-md text-base font-medium text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;