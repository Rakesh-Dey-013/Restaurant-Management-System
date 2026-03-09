import {
    CurrencyDollarIcon,
    ShoppingBagIcon,
    TableCellsIcon,
    ClockIcon,
    CubeIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    const stats = [
        { name: 'Total Orders Today', value: '156', icon: ShoppingBagIcon, change: '+12.5%' },
        { name: "Today's Revenue", value: '$4,289', icon: CurrencyDollarIcon, change: '+8.2%' },
        { name: 'Active Tables', value: '12', icon: TableCellsIcon, change: '-2.3%' },
        { name: 'Pending Kitchen Orders', value: '8', icon: ClockIcon, change: '+23.1%' },
        { name: 'Total Menu Items', value: '124', icon: CubeIcon, change: '+4.1%' },
        { name: 'Total Staff', value: '18', icon: UsersIcon, change: '0%' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welcome back, {user?.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/15 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/10 rounded-lg">
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-sm mb-1">{stat.name}</h3>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                                <div>
                                    <p className="text-white font-medium">Table {i + 5}</p>
                                    <p className="text-sm text-gray-400">Order #{202400 + i}</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                    Preparing
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Low Stock Items</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                                <div>
                                    <p className="text-white font-medium">Ingredient {i}</p>
                                    <p className="text-sm text-gray-400">Category</p>
                                </div>
                                <span className="text-red-400 font-medium">{10 - i * 2} units</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;