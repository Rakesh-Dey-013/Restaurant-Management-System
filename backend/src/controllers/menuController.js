import asyncHandler from 'express-async-handler';
import Menu from '../models/Menu.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin/Manager
export const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, type } = req.body;
  
  // Get image filename from uploaded file
  const image = req.file ? req.file.filename : 'default-food.jpg';

  const menuItem = await Menu.create({
    name,
    description,
    price,
    category,
    type,
    image,
  });

  // Add full URL for image
  const menuItemWithImageUrl = {
    ...menuItem.toObject(),
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/${menuItem.image}`
  };

  res.status(201).json(menuItemWithImageUrl);
});

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Private/Admin/Manager
export const getMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await Menu.find({});
  
  // Add full URL for each image
  const menuItemsWithImageUrls = menuItems.map(item => ({
    ...item.toObject(),
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/${item.image}`
  }));

  res.json(menuItemsWithImageUrls);
});

// @desc    Get menu item by ID
// @route   GET /api/menu/:id
// @access  Private/Admin/Manager
export const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (menuItem) {
    const menuItemWithImageUrl = {
      ...menuItem.toObject(),
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${menuItem.image}`
    };
    res.json(menuItemWithImageUrl);
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin/Manager
export const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (menuItem) {
    // Delete old image if new one is uploaded
    if (req.file && menuItem.image !== 'default-food.jpg') {
      const oldImagePath = path.join(__dirname, '../../uploads', menuItem.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    menuItem.name = req.body.name || menuItem.name;
    menuItem.description = req.body.description || menuItem.description;
    menuItem.price = req.body.price || menuItem.price;
    menuItem.category = req.body.category || menuItem.category;
    menuItem.type = req.body.type || menuItem.type;
    menuItem.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : menuItem.isAvailable;
    
    // Update image if new file uploaded
    if (req.file) {
      menuItem.image = req.file.filename;
    }

    const updatedMenuItem = await menuItem.save();
    
    const updatedMenuItemWithImageUrl = {
      ...updatedMenuItem.toObject(),
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${updatedMenuItem.image}`
    };

    res.json(updatedMenuItemWithImageUrl);
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin/Manager
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);

  if (menuItem) {
    // Delete image file if not default
    if (menuItem.image !== 'default-food.jpg') {
      const imagePath = path.join(__dirname, '../../uploads', menuItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});