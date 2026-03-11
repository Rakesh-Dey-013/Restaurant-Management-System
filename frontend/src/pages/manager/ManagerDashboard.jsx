import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FiCalendar, FiGrid, FiBookOpen, FiPackage, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import { getStatusBadge, formatDate } from '../../utils/helpers';

const ManagerDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['managerStats', timeRange],
    queryFn: async () => {
      const [bookings, tables, menu, inventory] = await Promise.all([
        api.get('/bookings'),
        api.get('/tables'),
        api.get('/menu'),
        api.get('/inventory')
      ]);
      return { bookings, tables, menu, inventory };
    }
  });

  const statCards = [
    {
      title: 'Today\'s Bookings',
      value: stats?.bookings?.bookings?.filter(b => 
        new Date(b.date).toDateString() === new Date().toDateString()
      ).length || 0,
      icon: FiCalendar,
      color: 'from-blue-500 to-blue-600',
      link: '/manager/bookings'
    },
    {
      title: 'Available Tables',
      value: stats?.tables?.filter(t => t.status === 'available').length || 0,
      icon: FiGrid,
      color: 'from-green-500 to-green-600',
      link: '/manager/tables'
    },
    {
      title: 'Menu Items',
      value: stats?.menu?.length || 0,
      icon: FiBookOpen,
      color: 'from-purple-500 to-purple-600',
      link: '/manager/menu'
    },
    {
      title: 'Low Stock Items',
      value: stats?.inventory?.filter(i => i.quantity <= i.minThreshold).length || 0,
      icon: FiPackage,
      color: 'from-orange-500 to-orange-600',
      link: '/manager/inventory'
    }
  ];

  // Sample chart data (replace with real data)
  const bookingsByDay = [
    { day: 'Mon', bookings: 8 },
    { day: 'Tue', bookings: 12 },
    { day: 'Wed', bookings: 15 },
    { day: 'Thu', bookings: 10 },
    { day: 'Fri', bookings: 20 },
    { day: 'Sat', bookings: 25 },
    { day: 'Sun', bookings: 18 }
  ];

  const tableOccupancy = [
    { name: 'Occupied', value: stats?.tables?.filter(t => t.status === 'reserved').length || 0 },
    { name: 'Available', value: stats?.tables?.filter(t => t.status === 'available').length || 0 }
  ];

  const COLORS = ['#f59e0b', '#10b981'];

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card hoverable>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-lg bg-opacity-20`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-400">
                  <span>View details</span>
                  <FiArrowRight className="ml-1" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Weekly Bookings</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Table Occupancy */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Table Occupancy</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tableOccupancy}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tableOccupancy.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <Link to="/manager/bookings" className="text-blue-400 hover:text-blue-300 text-sm">
              View All
            </Link>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 px-4 text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-400">Table</th>
                    <th className="text-left py-3 px-4 text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">Time</th>
                    <th className="text-left py-3 px-4 text-gray-400">Guests</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.bookings?.bookings?.slice(0, 5).map((booking) => (
                    <tr key={booking._id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3 px-4">{booking.user?.name}</td>
                      <td className="py-3 px-4">Table {booking.table?.tableNumber}</td>
                      <td className="py-3 px-4">{formatDate(booking.date)}</td>
                      <td className="py-3 px-4">{booking.time}</td>
                      <td className="py-3 px-4">{booking.guests}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Low Stock Alert */}
        {stats?.inventory?.filter(i => i.quantity <= i.minThreshold).length > 0 && (
          <Card className="lg:col-span-2 border-orange-500/30">
            <CardHeader>
              <h2 className="text-xl font-semibold text-orange-400">⚠️ Low Stock Alert</h2>
            </CardHeader>
            <CardBody>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.inventory
                  .filter(item => item.quantity <= item.minThreshold)
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item._id} className="glass-card p-4">
                      <h3 className="font-semibold mb-2">{item.itemName}</h3>
                      <p className="text-sm text-gray-400">
                        Current: <span className="text-orange-400 font-bold">{item.quantity} {item.unit}</span>
                      </p>
                      <p className="text-sm text-gray-400">
                        Minimum: {item.minThreshold} {item.unit}
                      </p>
                    </div>
                  ))}
              </div>
              <div className="mt-4 text-center">
                <Link to="/manager/inventory" className="text-blue-400 hover:text-blue-300 text-sm">
                  Manage Inventory →
                </Link>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;