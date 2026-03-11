import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiCheck, FiX, FiEye } from 'react-icons/fi';
import api from '../../services/api';
import { useBookings, useUpdateBookingStatus } from '../../hooks/useBookings';
import { BOOKING_STATUS } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader, { SkeletonLoader } from '../../components/common/Loader';
import { formatDate, getStatusBadge, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ManageBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  
  const { data: bookingsData, isLoading } = useBookings({
    status: filter !== 'all' ? filter : undefined,
    date: dateFilter || undefined
  });

  const updateStatus = useUpdateBookingStatus();

  const handleStatusUpdate = async (id, status) => {
    if (window.confirm(`Are you sure you want to mark this booking as ${status}?`)) {
      await updateStatus.mutateAsync({ id, status });
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      {/* Filters */}
      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          {Object.values(BOOKING_STATUS).map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-field"
          placeholder="Filter by date"
        />

        <Button
          variant="secondary"
          onClick={() => {
            setFilter('all');
            setDateFilter('');
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Bookings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 text-gray-400">Table</th>
                <th className="text-left py-3 px-4 text-gray-400">Date & Time</th>
                <th className="text-left py-3 px-4 text-gray-400">Guests</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData?.bookings?.map((booking) => (
                <motion.tr
                  key={booking._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-zinc-800 hover:bg-zinc-800/50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{booking.user?.name}</p>
                      <p className="text-xs text-gray-400">{booking.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">Table {booking.table?.tableNumber}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p>{formatDate(booking.date)}</p>
                      <p className="text-xs text-gray-400">{formatTime(booking.time)}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">{booking.guests}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewBooking(booking)}
                        className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                            className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                            title="Confirm"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                            className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                            title="Cancel"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                          className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                          title="Mark Completed"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {bookingsData?.pages > 1 && (
          <div className="mt-4 flex justify-center space-x-2">
            {/* Add pagination controls here */}
          </div>
        )}
      </Card>

      {/* View Booking Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Booking Details"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <p className="text-sm text-gray-400 mb-1">Customer</p>
                <p className="font-semibold">{selectedBooking.user?.name}</p>
                <p className="text-sm text-gray-400">{selectedBooking.user?.email}</p>
                {selectedBooking.user?.phone && (
                  <p className="text-sm text-gray-400">{selectedBooking.user.phone}</p>
                )}
              </div>

              <div className="glass-card p-4">
                <p className="text-sm text-gray-400 mb-1">Table</p>
                <p className="font-semibold">Table {selectedBooking.table?.tableNumber}</p>
                <p className="text-sm text-gray-400">{selectedBooking.table?.seats} seats</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-3 text-center">
                <FiCalendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm font-medium">{formatDate(selectedBooking.date)}</p>
              </div>

              <div className="glass-card p-3 text-center">
                <FiClock className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-sm font-medium">{formatTime(selectedBooking.time)}</p>
              </div>

              <div className="glass-card p-3 text-center">
                <FiUsers className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Guests</p>
                <p className="text-sm font-medium">{selectedBooking.guests}</p>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div className="glass-card p-4">
                <p className="text-sm text-gray-400 mb-2">Special Requests</p>
                <p className="text-sm">{selectedBooking.specialRequests}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(selectedBooking.status)}`}>
                {selectedBooking.status}
              </span>
              <span className="text-sm text-gray-400">
                Booked on {formatDate(selectedBooking.createdAt)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageBookings;