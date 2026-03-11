// backend/src/routes/bookingRoutes.js
import express from 'express';
import { 
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getUserBookings,
  checkAvailability,
  checkTableAvailability  // Add this import
} from '../controllers/bookingController.js';
import { protect, isManager, isStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for checking availability
router.post('/check-availability', checkTableAvailability);  // Update this line
router.post('/check-single-availability', checkAvailability); // For single table check

// Protected routes
router.get('/user/my-bookings', protect, getUserBookings);

router.route('/')
  .get(protect, isStaff, getBookings)
  .post(protect, createBooking);

router.route('/:id')
  .get(protect, getBookingById);

router.put('/:id/status', protect, isManager, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

export default router;