// src/pages/public/BookTable.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiMapPin, 
  FiCheckCircle,
  FiArrowLeft,
  FiInfo 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCreateBooking, useCheckAvailability } from '../../hooks/useBookings';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import { formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

// Time slots available for booking
const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

const BookTable = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedTable, setSelectedTable] = useState(null);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    time: '19:00',
    guests: 2,
    specialRequests: ''
  });

  const createBooking = useCreateBooking();
  const checkAvailability = useCheckAvailability();

  // Fetch all tables for initial display
  const { data: allTables, isLoading: tablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get('/tables');
      return response;
    }
  });

  // Filter tables based on guests
  const getFilteredTables = () => {
    if (!allTables) return [];
    return allTables.filter(table => table.seats >= bookingDetails.guests);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
    setAvailabilityChecked(false);
    setSelectedTable(null);
  };

  // Handle date change with validation
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = dayjs().format('YYYY-MM-DD');
    
    if (selectedDate < today) {
      toast.error('Cannot book for past dates');
      return;
    }
    
    setBookingDetails(prev => ({ ...prev, date: selectedDate }));
    setAvailabilityChecked(false);
    setSelectedTable(null);
  };

  // Check table availability
  const handleCheckAvailability = async () => {
    if (!bookingDetails.date || !bookingDetails.time || !bookingDetails.guests) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await api.post('/bookings/check-availability', {
        date: bookingDetails.date,
        time: bookingDetails.time,
        guests: bookingDetails.guests
      });

      if (response.availableTables && response.availableTables.length > 0) {
        setAvailableTables(response.availableTables);
        setAvailabilityChecked(true);
        toast.success(`${response.availableTables.length} tables available!`);
      } else {
        setAvailableTables([]);
        setAvailabilityChecked(true);
        toast.error('No tables available for selected time');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check availability');
    }
  };

  // Handle table selection
  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/book-table', bookingDetails } });
      return;
    }

    try {
      await createBooking.mutateAsync({
        table: selectedTable._id,
        date: bookingDetails.date,
        time: bookingDetails.time,
        guests: parseInt(bookingDetails.guests),
        specialRequests: bookingDetails.specialRequests
      });

      toast.success('Booking confirmed! Check your email for details.');
      navigate('/customer/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  // Go to next step
  const nextStep = () => {
    if (step === 1) {
      if (!bookingDetails.date || !bookingDetails.time || !bookingDetails.guests) {
        toast.error('Please fill in all fields');
        return;
      }
      if (bookingDetails.guests < 1 || bookingDetails.guests > 20) {
        toast.error('Number of guests must be between 1 and 20');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!availabilityChecked) {
        toast.error('Please check availability first');
        return;
      }
      if (!selectedTable) {
        toast.error('Please select a table');
        return;
      }
      setStep(3);
    }
  };

  // Go to previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  if (tablesLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Book Your Table
          </h1>
          <p className="text-gray-400">Reserve your perfect dining experience in just a few steps</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex-1 text-center">
              <div className={`relative`}>
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'
                }`}>
                  {step > stepNumber ? <FiCheckCircle /> : stepNumber}
                </div>
                <p className={`text-sm mt-2 ${
                  step >= stepNumber ? 'text-white' : 'text-gray-400'
                }`}>
                  {stepNumber === 1 ? 'Details' : stepNumber === 2 ? 'Select Table' : 'Confirm'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Booking Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <h2 className="text-xl font-semibold mb-6">Booking Details</h2>
              
              <div className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Date
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={bookingDetails.date}
                    onChange={handleDateChange}
                    min={dayjs().format('YYYY-MM-DD')}
                    icon={FiCalendar}
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Time
                  </label>
                  <select
                    name="time"
                    value={bookingDetails.time}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{formatTime(time)}</option>
                    ))}
                  </select>
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Guests
                  </label>
                  <Input
                    type="number"
                    name="guests"
                    value={bookingDetails.guests}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    icon={FiUsers}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 20 guests per booking</p>
                </div>

                {/* Available Tables Summary */}
                <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
                  <h3 className="font-medium text-blue-400 mb-2">Available Tables</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[2, 4, 6, 8].map(seats => {
                      const count = allTables?.filter(t => t.seats === seats).length || 0;
                      return (
                        <div key={seats} className="text-sm">
                          <span className="text-gray-400">{seats} seats:</span>
                          <span className="ml-2 text-white">{count} tables</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={nextStep}>
                  Continue to Select Table
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Select Table */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <h2 className="text-xl font-semibold mb-6">Select Your Table</h2>
              
              {/* Booking Summary */}
              <div className="mb-6 p-4 glass-card rounded-lg">
                <h3 className="font-medium mb-3">Booking Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm font-medium">{dayjs(bookingDetails.date).format('DD MMM YYYY')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="text-sm font-medium">{formatTime(bookingDetails.time)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Guests</p>
                    <p className="text-sm font-medium">{bookingDetails.guests} people</p>
                  </div>
                </div>
              </div>

              {/* Check Availability Button */}
              {!availabilityChecked && (
                <Button
                  onClick={handleCheckAvailability}
                  isLoading={checkAvailability.isPending}
                  className="w-full mb-6"
                >
                  Check Availability
                </Button>
              )}

              {/* Available Tables */}
              {availabilityChecked && (
                <>
                  {availableTables.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-green-400">
                        {availableTables.length} tables available for your selected time
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {availableTables.map((table) => (
                          <motion.div
                            key={table._id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleTableSelect(table)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedTable?._id === table._id
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-zinc-700 hover:border-zinc-600'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">Table {table.tableNumber}</h3>
                                <p className="text-sm text-gray-400">{table.seats} seats</p>
                              </div>
                              {table.image && (
                                <img
                                  src={table.image}
                                  alt={`Table ${table.tableNumber}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-400">
                              <FiMapPin className="mr-1" />
                              <span>Available for {bookingDetails.guests} guests</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiInfo className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Tables Available</h3>
                      <p className="text-gray-400 mb-4">
                        No tables available for {bookingDetails.guests} guests at {formatTime(bookingDetails.time)}
                      </p>
                      <Button variant="secondary" onClick={() => setStep(1)}>
                        Try Different Time
                      </Button>
                    </div>
                  )}
                </>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={prevStep}>
                  <FiArrowLeft className="mr-2" /> Back
                </Button>
                {availabilityChecked && availableTables.length > 0 && (
                  <Button 
                    onClick={nextStep}
                    disabled={!selectedTable}
                  >
                    Continue to Confirm
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Confirm Booking */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <h2 className="text-xl font-semibold mb-6">Confirm Your Booking</h2>

              {/* Booking Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <p className="font-medium">{dayjs(bookingDetails.date).format('DD MMMM YYYY')}</p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-xs text-gray-400 mb-1">Time</p>
                    <p className="font-medium">{formatTime(bookingDetails.time)}</p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-xs text-gray-400 mb-1">Guests</p>
                    <p className="font-medium">{bookingDetails.guests} people</p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-xs text-gray-400 mb-1">Table</p>
                    <p className="font-medium">Table {selectedTable?.tableNumber}</p>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingDetails.specialRequests}
                    onChange={handleInputChange}
                    className="input-field"
                    rows="3"
                    placeholder="Any special requests? (allergies, dietary restrictions, occasion, etc.)"
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="p-4 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-yellow-500">
                    ⏰ Please arrive 10 minutes before your booking time. 
                    Tables will be held for 15 minutes after the booking time.
                  </p>
                </div>

                {/* Login/Register Prompt */}
                {!isAuthenticated && (
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-blue-400 mb-2">
                      Please login or register to complete your booking
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/login', { state: { from: '/book-table' } })}
                      >
                        Login
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/register', { state: { from: '/book-table' } })}
                      >
                        Register
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={prevStep}>
                  <FiArrowLeft className="mr-2" /> Back
                </Button>
                {isAuthenticated && (
                  <Button
                    onClick={handleBooking}
                    isLoading={createBooking.isPending}
                  >
                    Confirm Booking
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookTable;