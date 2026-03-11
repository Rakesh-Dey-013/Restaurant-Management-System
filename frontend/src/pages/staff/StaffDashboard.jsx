import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import api from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import { formatDate, getStatusBadge, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
    const [view, setView] = useState('today');
    const queryClient = useQueryClient();

    // Fetch today's bookings
    const { data: bookings, isLoading } = useQuery({
        queryKey: ['staffBookings', view],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            const response = await api.get('/bookings', {
                params: {
                    date: view === 'today' ? today : undefined,
                    status: view === 'upcoming' ? 'confirmed' : undefined
                }
            });
            return response;
        }
    });

    // Update booking status mutation
    const updateStatus = useMutation({
        mutationFn: async ({ id, status }) => {
            const response = await api.put(`/bookings/${id}/status`, { status });
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staffBookings'] });
            toast.success('Booking status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    });

    // Fetch table status
    const { data: tables } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await api.get('/tables');
            return response;
        }
    });

    const handleStatusUpdate = (id, status) => {
        if (window.confirm(`Mark booking as ${status}?`)) {
            updateStatus.mutate({ id, status });
        }
    };

    if (isLoading) {
        return <Loader fullScreen />;
    }

    const todayBookings = bookings?.bookings || [];
    const availableTables = tables?.filter(t => t.status === 'available').length || 0;
    const occupiedTables = tables?.filter(t => t.status === 'reserved').length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Staff Dashboard</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setView('today')}
                        className={`px-4 py-2 rounded-lg transition-colors ${view === 'today' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'
                            }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setView('upcoming')}
                        className={`px-4 py-2 rounded-lg transition-colors ${view === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'
                            }`}
                    >
                        Upcoming
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-400">{todayBookings.length}</p>
                        <p className="text-sm text-gray-400">Today's Bookings</p>
                    </div>
                </Card>

                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-400">{availableTables}</p>
                        <p className="text-sm text-gray-400">Available Tables</p>
                    </div>
                </Card>

                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-400">{occupiedTables}</p>
                        <p className="text-sm text-gray-400">Occupied Tables</p>
                    </div>
                </Card>

                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-400">
                            {todayBookings.filter(b => b.status === 'completed').length}
                        </p>
                        <p className="text-sm text-gray-400">Completed</p>
                    </div>
                </Card>
            </div>

            {/* Today's Schedule */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">
                        {view === 'today' ? "Today's Schedule" : 'Upcoming Bookings'}
                    </h2>
                </CardHeader>
                <CardBody>
                    {todayBookings.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No bookings found</p>
                    ) : (
                        <div className="space-y-4">
                            {todayBookings.map((booking) => (
                                <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-4"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    Booking #{booking._id.slice(-8)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <FiUser className="text-blue-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Customer</p>
                                                        <p className="text-sm font-medium">{booking.user?.name}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <FiCalendar className="text-green-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Date</p>
                                                        <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <FiClock className="text-purple-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Time</p>
                                                        <p className="text-sm font-medium">{formatTime(booking.time)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <FiMapPin className="text-orange-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Table</p>
                                                        <p className="text-sm font-medium">Table {booking.table?.tableNumber}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center space-x-4">
                                                <div className="flex items-center space-x-1">
                                                    <FiUsers className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-400">{booking.guests} guests</span>
                                                </div>
                                                {booking.specialRequests && (
                                                    <div className="text-sm text-gray-400">
                                                        Note: {booking.specialRequests}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {booking.status === 'confirmed' && (
                                            <div className="mt-4 md:mt-0 md:ml-4 flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                    isLoading={updateStatus.isPending}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <FiCheck />
                                                    <span>Complete</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                    isLoading={updateStatus.isPending}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <FiX />
                                                    <span>Cancel</span>
                                                </Button>
                                            </div>
                                        )}

                                        {booking.status === 'pending' && (
                                            <div className="mt-4 md:mt-0 md:ml-4 flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                    isLoading={updateStatus.isPending}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <FiCheck />
                                                    <span>Confirm</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                    isLoading={updateStatus.isPending}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <FiX />
                                                    <span>Cancel</span>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Table Status Overview */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Table Status</h2>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {tables?.map((table) => (
                            <div
                                key={table._id}
                                className={`glass-card p-3 text-center ${table.status === 'available' ? 'border-green-500/30' : 'border-yellow-500/30'
                                    }`}
                            >
                                <p className="font-semibold">Table {table.tableNumber}</p>
                                <p className="text-xs text-gray-400">{table.seats} seats</p>
                                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${table.status === 'available'
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-yellow-500/20 text-yellow-500'
                                    }`}>
                                    {table.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default StaffDashboard;
