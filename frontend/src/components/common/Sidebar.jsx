import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../utils/constants';
import { FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const navItems = NAV_ITEMS[user.role] || [];

    return (
        <aside className="w-64 glass-card rounded-none min-h-screen fixed left-0 top-0 pt-16">
            <div className="p-4">
                <div className="mb-6 p-4 glass-card rounded-lg">
                    <p className="text-sm text-gray-400">Logged in as</p>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-sm font-medium">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full"
                                    />
                                )}
                            </Link>
                        );
                    })}

                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-red-400 hover:bg-white/10 transition-all duration-200"
                    >
                        <FiLogOut size={20} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;