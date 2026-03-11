import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import Table from '../models/Table.js';
import { BOOKING_STATUS } from '../config/constants.js';
import dayjs from 'dayjs';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin/Manager/Staff
export const getBookings = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 10 } = req.query;
  let query = {};

  if (status && Object.values(BOOKING_STATUS).includes(status)) {
    query.status = status;
  }

  if (date) {
    const startDate = dayjs(date).startOf('day').toDate();
    const endDate = dayjs(date).endOf('day').toDate();
    query.date = { $gte: startDate, $lte: endDate };
  }

  // If user is customer, show only their bookings
  if (req.user.role === 'customer') {
    query.user = req.user._id;
  }

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('table', 'tableNumber seats')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(query);

  res.json({
    bookings,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('table', 'tableNumber seats');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if user is authorized to view this booking
  if (req.user.role === 'customer' && booking.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  res.json(booking);
});



// @desc    Create booking
// @route   POST /api/bookings
// @access  Private/Customer
export const createBooking = asyncHandler(async (req, res) => {
  const { table, date, time, guests, specialRequests } = req.body;

  // Validation
  if (!table || !date || !time || !guests) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if table exists and is available
  const tableExists = await Table.findById(table);
  if (!tableExists) {
    res.status(404);
    throw new Error('Table not found');
  }

  if (tableExists.status !== 'available') {
    res.status(400);
    throw new Error('Table is not available');
  }

  // Check if table can accommodate guests
  if (tableExists.seats < guests) {
    res.status(400);
    throw new Error(`Table can only accommodate ${tableExists.seats} guests`);
  }

  // Check if table is already booked at that time
  const existingBooking = await Booking.findOne({
    table,
    date: new Date(date),
    time,
    status: { $ne: BOOKING_STATUS.CANCELLED }
  });

  if (existingBooking) {
    res.status(400);
    throw new Error('Table is already booked for this time');
  }

  const booking = await Booking.create({
    user: req.user._id,
    table,
    date: new Date(date),
    time,
    guests,
    specialRequests,
    status: BOOKING_STATUS.PENDING
  });

  // Update table status to reserved
  tableExists.status = 'reserved';
  await tableExists.save();

  const populatedBooking = await Booking.findById(booking._id)
    .populate('user', 'name email phone')
    .populate('table', 'tableNumber seats');

  res.status(201).json(populatedBooking);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin/Manager
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (!Object.values(BOOKING_STATUS).includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  // If cancelling, free up the table
  if (status === BOOKING_STATUS.CANCELLED || status === BOOKING_STATUS.COMPLETED) {
    const table = await Table.findById(booking.table);
    if (table) {
      table.status = 'available';
      await table.save();
    }
  }

  booking.status = status;
  await booking.save();

  const updatedBooking = await Booking.findById(booking._id)
    .populate('user', 'name email phone')
    .populate('table', 'tableNumber seats');

  res.json(updatedBooking);
});

// @desc    Cancel booking (customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Customer
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if booking belongs to user
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  // Check if booking can be cancelled
  if (booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.COMPLETED) {
    res.status(400);
    throw new Error('Booking cannot be cancelled');
  }

  // Free up the table
  const table = await Table.findById(booking.table);
  if (table) {
    table.status = 'available';
    await table.save();
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  res.json({ message: 'Booking cancelled successfully' });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/user/my-bookings
// @access  Private/Customer
export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('table', 'tableNumber seats')
    .sort('-createdAt');

  res.json(bookings);
});

// backend/src/controllers/bookingController.js
// Add this new method for checking multiple tables availability

// @desc    Check available tables for a given time and guest count
// @route   POST /api/bookings/check-availability
// @access  Public
export const checkTableAvailability = asyncHandler(async (req, res) => {
  const { date, time, guests } = req.body;

  if (!date || !time || !guests) {
    res.status(400);
    throw new Error('Please provide date, time and number of guests');
  }

  // Find all tables that can accommodate the guests
  const allTables = await Table.find({
    seats: { $gte: guests }
  });

  // Find tables that are already booked at that time
  const bookedTables = await Booking.find({
    date: new Date(date),
    time,
    status: { $nin: ['cancelled', 'completed'] }
  }).distinct('table');

  // Filter available tables
  const availableTables = allTables.filter(
    table => !bookedTables.includes(table._id.toString()) && table.status === 'available'
  );

  res.json({
    availableTables,
    count: availableTables.length,
    message: availableTables.length > 0
      ? `${availableTables.length} tables available`
      : 'No tables available'
  });
});

// Update the existing checkAvailability method
export const checkAvailability = asyncHandler(async (req, res) => {
  const { tableId, date, time, guests } = req.body;

  if (!tableId || !date || !time) {
    res.status(400);
    throw new Error('Please provide table, date and time');
  }

  // Check if table exists
  const table = await Table.findById(tableId);
  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }

  // Check if table can accommodate guests
  if (guests && table.seats < guests) {
    return res.json({
      available: false,
      message: `Table can only accommodate ${table.seats} guests`
    });
  }

  // Check if table is already booked
  const existingBooking = await Booking.findOne({
    table: tableId,
    date: new Date(date),
    time,
    status: { $ne: BOOKING_STATUS.CANCELLED }
  });

  const available = !existingBooking && table.status === 'available';

  res.json({
    available,
    message: available ? 'Table is available' : 'Table is not available for this time',
    table: {
      tableNumber: table.tableNumber,
      seats: table.seats
    }
  });
});