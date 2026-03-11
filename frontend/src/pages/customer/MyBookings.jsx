import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useUserBookings, useCancelBooking } from '../../hooks/useBookings';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader, { SkeletonLoader } from '../../components/common/Loader';
import { formatDate, getStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [filter, setFilter] = useState('all');
  const { data: bookings, isLoading } = useUserBookings();
  const cancelBooking = useCancelBooking();

  const filteredBookings = bookings?.filter(booking => {
    if (filter === 'upcoming') {
      return booking.status === 'confirmed' || booking.status === 'pending';
    } else if (filter === 'past') {
      return booking.status === 'completed' || booking.status === 'cancelled';
    }
    return true;
  });

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <Link to="/menu">
          <Button variant="primary">Book New Table</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-2">
        {['all', 'upcoming', 'past'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings?.length === 0 ? (
        <Card className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all' 
              ? "You haven't made any bookings yet" 
              : `No ${filter} bookings found`}
          </p>
          <Link to="/menu">
            <Button variant="primary">Browse Menu & Book</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings?.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="text-sm text-gray-400">
                        Booking ID: {booking._id.slice(-8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="text-blue-400" />
                        <div>
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <FiClock className="text-green-400" />
                        <div>
                          <p className="text-xs text-gray-400">Time</p>
                          <p className="text-sm font-medium">{booking.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <FiUsers className="text-purple-400" />
                        <div>
                          <p className="text-xs text-gray-400">Guests</p>
                          <p className="text-sm font-medium">{booking.guests} people</p>
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

                    {booking.specialRequests && (
                      <div className="mt-3 text-sm text-gray-400">
                        <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                      </div>
                    )}
                  </div>

                  {booking.status === 'pending' || booking.status === 'confirmed' ? (
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancel(booking._id)}
                        isLoading={cancelBooking.isPending}
                        className="flex items-center space-x-1"
                      >
                        <FiXCircle />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;