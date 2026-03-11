import asyncHandler from 'express-async-handler';
import Menu from '../models/Menu.js';
import { MENU_CATEGORIES } from '../config/constants.js';
import { sanitizeInput } from '../utils/validation.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = asyncHandler(async (req, res) => {
  const { category, search, availability } = req.query;
  let query = {};

  // Filter by category
  if (category && Object.values(MENU_CATEGORIES).includes(category)) {
    query.category = category;
  }

  // Filter by availability
  if (availability === 'true') {
    query.availability = true;
  } else if (availability === 'false') {
    query.availability = false;
  }

  // Search by name or description
  if (search) {
    query.$text = { $search: search };
  }

  const menuItems = await Menu.find(query)
    .populate('createdBy', 'name email')
    .sort('-createdAt');

  res.json(menuItems);
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (menuItem) {
    res.json(menuItem);
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin/Manager
export const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, availability } = req.body;

  // Sanitize inputs
  const sanitizedName = sanitizeInput(name);
  const sanitizedDescription = sanitizeInput(description);

  // Validation
  if (!sanitizedName || !sanitizedDescription || !price || !category) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (!Object.values(MENU_CATEGORIES).includes(category)) {
    res.status(400);
    throw new Error('Invalid category');
  }

  if (price <= 0) {
    res.status(400);
    throw new Error('Price must be a positive number');
  }

  const menuItem = await Menu.create({
    name: sanitizedName,
    description: sanitizedDescription,
    price,
    category,
    image: req.file?.cloudinaryUrl || 'https://via.placeholder.com/300x200?text=No+Image',
    availability: availability !== undefined ? availability : true,
    createdBy: req.user._id
  });

  res.status(201).json(menuItem);
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin/Manager
export const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Update fields
  menuItem.name = sanitizeInput(req.body.name) || menuItem.name;
  menuItem.description = sanitizeInput(req.body.description) || menuItem.description;
  menuItem.price = req.body.price || menuItem.price;
  menuItem.category = req.body.category || menuItem.category;
  menuItem.availability = req.body.availability !== undefined ? req.body.availability : menuItem.availability;

  if (req.file?.cloudinaryUrl) {
    menuItem.image = req.file.cloudinaryUrl;
  }

  const updatedMenuItem = await menuItem.save();
  res.json(updatedMenuItem);
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin/Manager
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (menuItem) {
    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Get menu categories
// @route   GET /api/menu/categories/all
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  res.json(Object.values(MENU_CATEGORIES));
});