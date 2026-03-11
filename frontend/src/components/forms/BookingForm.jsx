import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FiCalendar, FiClock, FiUsers, FiMessageSquare } from 'react-icons/fi';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../services/api';
import { useCheckAvailability } from '../../hooks/useBookings';
import toast from 'react-hot-toast';

const BookingForm = ({ onSubmit, isLoading, onCancel, initialData }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      date: dayjs().format('YYYY-MM-DD'),
      time: '19:00',
      guests: 2,
      specialRequests: ''
    }
  });

  const watchDate = watch('date');
  const watchTime = watch('time');
  const watchGuests = watch('guests');

  // Fetch tables
  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get('/tables');
      return response;
    }
  });

  const checkAvailability = useCheckAvailability();

  // Filter available tables based on guests
  const availableTables = tables?.filter(table => 
    table.seats >= watchGuests && table.status === 'available'
  ) || [];

  const handleCheckAvailability = async () => {
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }

    const result = await checkAvailability.mutateAsync({
      tableId: selectedTable,
      date: watchDate,
      time: watchTime,
      guests: watchGuests
    });

    if (result.available) {
      setAvailabilityChecked(true);
      toast.success('Table is available!');
    } else {
      setAvailabilityChecked(false);
      toast.error(result.message || 'Table is not available');
    }
  };

  const onFormSubmit = (data) => {
    if (!availabilityChecked && !initialData) {
      toast.error('Please check table availability first');
      return;
    }
    onSubmit({ ...data, table: selectedTable });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          icon={FiCalendar}
          min={dayjs().format('YYYY-MM-DD')}
          error={errors.date?.message}
          {...register('date', { required: 'Date is required' })}
        />

        <Input
          label="Time"
          type="time"
          icon={FiClock}
          error={errors.time?.message}
          {...register('time', { required: 'Time is required' })}
        />
      </div>

      {/* Number of Guests */}
      <Input
        label="Number of Guests"
        type="number"
        icon={FiUsers}
        min="1"
        max="20"
        error={errors.guests?.message}
        {...register('guests', { 
          required: 'Number of guests is required',
          min: { value: 1, message: 'At least 1 guest required' },
          max: { value: 20, message: 'Maximum 20 guests allowed' }
        })}
      />

      {/* Table Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Table
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableTables.map((table) => (
            <button
              key={table._id}
              type="button"
              onClick={() => {
                setSelectedTable(table._id);
                setAvailabilityChecked(false);
              }}
              className={`p-3 rounded-lg border transition-all ${
                selectedTable === table._id
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">Table {table.tableNumber}</div>
                <div className="text-xs text-gray-400">{table.seats} seats</div>
              </div>
            </button>
          ))}
        </div>
        {availableTables.length === 0 && (
          <p className="text-sm text-yellow-500 mt-2">
            No tables available for {watchGuests} guests
          </p>
        )}
      </div>

      {/* Check Availability Button */}
      {selectedTable && !availabilityChecked && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleCheckAvailability}
          isLoading={checkAvailability.isPending}
          className="w-full"
        >
          Check Availability
        </Button>
      )}

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Special Requests (Optional)
        </label>
        <textarea
          className="input-field"
          rows="3"
          placeholder="Any special requests? (allergies, dietary restrictions, etc.)"
          {...register('specialRequests')}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!availabilityChecked && !initialData}
        >
          {initialData ? 'Update' : 'Confirm'} Booking
        </Button>
      </div>

      {!availabilityChecked && !initialData && selectedTable && (
        <p className="text-sm text-yellow-500 text-center">
          Please check availability before confirming
        </p>
      )}
    </form>
  );
};

export default BookingForm;