import mongoose from 'mongoose';
import { TABLE_STATUS } from '../config/constants.js';

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Table number is required'],
    unique: true,
    min: [1, 'Table number must be at least 1']
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'Table must have at least 1 seat'],
    max: [20, 'Table cannot have more than 20 seats']
  },
  status: {
    type: String,
    enum: Object.values(TABLE_STATUS),
    default: TABLE_STATUS.AVAILABLE
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Table'
  }
}, {
  timestamps: true
});

const Table = mongoose.model('Table', tableSchema);
export default Table;