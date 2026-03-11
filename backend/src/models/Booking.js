import mongoose from 'mongoose';
import { BOOKING_STATUS } from '../config/constants.js';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    time: {
        type: String,
        required: [true, 'Booking time is required'],
        validate: {
            validator: function (v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Please provide valid time in HH:MM format'
        }
    },
    guests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: [1, 'At least 1 guest is required'],
        max: [20, 'Cannot book for more than 20 guests']
    },
    status: {
        type: String,
        enum: Object.values(BOOKING_STATUS),
        default: BOOKING_STATUS.PENDING
    },
    specialRequests: {
        type: String,
        maxlength: [300, 'Special requests cannot exceed 300 characters']
    }
}, {
    timestamps: true
});

// Compound index to prevent double booking
bookingSchema.index({ table: 1, date: 1, time: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;