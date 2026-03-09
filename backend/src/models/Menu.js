import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a menu item name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['appetizer', 'main-course', 'dessert', 'beverage', 'soup', 'salad'],
  },
  type: {
    type: String,
    required: [true, 'Please add food type'],
    enum: ['veg', 'non-veg'],
  },
  image: {
    type: String,
    default: 'default-food.jpg', // Default image if none uploaded
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;