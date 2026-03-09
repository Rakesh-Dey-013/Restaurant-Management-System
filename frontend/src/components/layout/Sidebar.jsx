import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    ShoppingBagIcon,
    TableCellsIcon,
    ChartBarIcon,
    CubeIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const { user } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'manager', 'waiter', 'chef'] },
        { name: 'Staff', href: '/staff', icon: UsersIcon, roles: ['admin'] },
        { name: 'Menu', href: '/menu', icon: ClipboardDocumentListIcon, roles: ['admin', 'manager'] },
        { name: 'Orders', href: '#', icon: ShoppingBagIcon, roles: ['admin', 'manager', 'waiter'], comingSoon: true },
        { name: 'Tables', href: '#', icon: TableCellsIcon, roles: ['admin', 'manager', 'waiter'], comingSoon: true },
        { name: 'Inventory', href: '#', icon: CubeIcon, roles: ['admin', 'manager'], comingSoon: true },
        { name: 'Reports', href: '#', icon: ChartBarIcon, roles: ['admin', 'manager'], comingSoon: true },
    ];

    const filteredNav = navigation.filter(item =>
        item.roles.includes(user?.role) && !item.comingSoon
    );

    return (
        <div className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/10">
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <h1 className="text-xl font-bold text-white">Restaurant MS</h1>
            </div>
            <nav className="p-4 space-y-1">
                {filteredNav.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm rounded-xl transition-all ${isActive
                                ? 'bg-white/20 text-white'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;