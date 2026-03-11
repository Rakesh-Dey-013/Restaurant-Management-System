import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import api from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import { formatDate, getStatusBadge, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TableBookings = () => {
  const [selectedTable, setSelectedTable] = useState('all');
  const queryClient = useQueryClient();

  // Fetch tables
  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get('/tables');
      return response;
    }
  });

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['tableBookings', selectedTable],
    queryFn: async () => {
      const params = {};
      if (selectedTable !== 'all') {
        params.table = selectedTable;
      }
      const response = await api.get('/bookings', { params });
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
      queryClient.invalidateQueries({ queryKey: ['tableBookings'] });
      toast.success('Booking status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  // Update table status mutation
  const updateTableStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch(`/tables/${id}/status`, { status });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update table status');
    }
  });

  const handleStatusUpdate = (id, status) => {
    if (window.confirm(`Mark booking as ${status}?`)) {
      updateStatus.mutate({ id, status });
    }
  };

  const handleTableStatusUpdate = (tableId, status) => {
    const newStatus = status === 'available' ? 'reserved' : 'available';
    if (window.confirm(`Mark table as ${newStatus}?`)) {
      updateTableStatus.mutate({ id: tableId, status: newStatus });
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold">Table Bookings</h1>

      {/* Table Selection */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedTable('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedTable === 'all' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'
          }`}
        >
          All Tables
        </button>
        {tables?.map((table) => (
          <button
            key={table._id}
            onClick={() => setSelectedTable(table._id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedTable === table._id ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'
            }`}
          >
            Table {table.tableNumber}
          </button>
        ))}
      </div>

      {/* Table Status Cards */}
      {selectedTable !== 'all' && (
        <div className="grid md:grid-cols-2 gap-6">
          {tables?.filter(t => t._id === selectedTable).map((table) => (
            <Card key={table._id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Table {table.tableNumber}</h3>
                  <p className="text-gray-400">{table.seats} seats</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    table.status === 'available' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {table.status}
                  </span>
                  <Button
                    size="sm"
                    variant={table.status === 'available' ? 'warning' : 'success'}
                    onClick={() => handleTableStatusUpdate(table._id, table.status)}
                    className="mt-2"
                  >
                    Mark as {table.status === 'available' ? 'Reserved' : 'Available'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {selectedTable === 'all' ? 'All Bookings' : `Table ${tables?.find(t => t._id === selectedTable)?.tableNumber} Bookings`}
          </h2>
        </CardHeader>
        <CardBody>
          {bookings?.bookings?.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No bookings found</p>
          ) : (
            <div className="space-y-4">
              {bookings?.bookings?.map((booking) => (
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
                          {booking.user?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-blue-400" />
                          <span className="text-sm">{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiClock className="text-green-400" />
                          <span className="text-sm">{formatTime(booking.time)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiUsers className="text-purple-400" />
                          <span className="text-sm">{booking.guests} guests</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiMapPin className="text-orange-400" />
                          <span className="text-sm">Table {booking.table?.tableNumber}</span>
                        </div>
                      </div>
                    </div>

                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <div className="mt-4 md:mt-0 md:ml-4 flex space-x-2">
                        {booking.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                            isLoading={updateStatus.isPending}
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleStatusUpdate(booking._id, 'completed')}
                            isLoading={updateStatus.isPending}
                          >
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          isLoading={updateStatus.isPending}
                        >
                          Cancel
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
    </div>
  );
};

export default TableBookings;