import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FiUsers, FiCalendar, FiGrid, FiBookOpen } from 'react-icons/fi';
import api from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [users, bookings, tables, menu] = await Promise.all([
        api.get('/users'),
        api.get('/bookings'),
        api.get('/tables'),
        api.get('/menu'),
      ]);
      return { users, bookings, tables, menu, };
    }
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Bookings',
      value: stats?.bookings?.total || 0,
      icon: FiCalendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Tables',
      value: stats?.tables?.length || 0,
      icon: FiGrid,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Menu Items',
      value: stats?.menu?.length || 0,
      icon: FiBookOpen,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10'
    },
  ];

  // Sample chart data (replace with real data from API)
  const bookingsData = [
    { name: 'Mon', bookings: 12 },
    { name: 'Tue', bookings: 19 },
    { name: 'Wed', bookings: 15 },
    { name: 'Thu', bookings: 22 },
    { name: 'Fri', bookings: 28 },
    { name: 'Sat', bookings: 35 },
    { name: 'Sun', bookings: 30 }
  ];

  const popularItemsData = [
    { name: 'Pizza', value: 45 },
    { name: 'Burger', value: 30 },
    { name: 'Pasta', value: 25 },
    { name: 'Salad', value: 15 },
    { name: 'Drinks', value: 20 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
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
            <Card>
              <div className="flex items-center space-x-4">
                <div className={`p-4 ${stat.bgColor} rounded-lg`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color.split('-')[1]}-500`} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Daily Bookings</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Popular Items Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Popular Menu Items</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularItemsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {popularItemsData.map((entry, index) => (
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
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
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
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.bookings?.bookings?.slice(0, 5).map((booking) => (
                    <tr key={booking._id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3 px-4">{booking.user?.name}</td>
                      <td className="py-3 px-4">Table {booking.table?.tableNumber}</td>
                      <td className="py-3 px-4">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{booking.time}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize
                          ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                            booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              booking.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                'bg-blue-500/20 text-blue-500'}`}>
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
      </div>
    </div>
  );
};

export default AdminDashboard;