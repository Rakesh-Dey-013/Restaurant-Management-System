import mongoose from 'mongoose';
import { MENU_CATEGORIES } from '../config/constants.js';

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: Object.values(MENU_CATEGORIES)
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
        default: 'https://via.placeholder.com/300x200?text=No+Image'
    },
    availability: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for search functionality
menuSchema.index({ name: 'text', description: 'text' });

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;