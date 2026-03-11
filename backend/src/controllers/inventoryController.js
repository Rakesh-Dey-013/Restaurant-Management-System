import asyncHandler from 'express-async-handler';
import Inventory from '../models/Inventory.js';
import { sanitizeInput } from '../utils/validation.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin/Manager
export const getInventoryItems = asyncHandler(async (req, res) => {
    const { lowStock, search } = req.query;
    let query = {};

    // Filter low stock items
    if (lowStock === 'true') {
        query.$expr = { $lte: ['$quantity', '$minThreshold'] };
    }

    // Search by item name
    if (search) {
        query.itemName = { $regex: search, $options: 'i' };
    }

    const items = await Inventory.find(query).sort('-lastUpdated');
    res.json(items);
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private/Admin/Manager
export const getInventoryItemById = asyncHandler(async (req, res) => {
    const item = await Inventory.findById(req.params.id);

    if (item) {
        res.json(item);
    } else {
        res.status(404);
        throw new Error('Inventory item not found');
    }
});

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private/Admin/Manager
export const createInventoryItem = asyncHandler(async (req, res) => {
    const { itemName, quantity, unit, supplier, minThreshold } = req.body;

    // Sanitize inputs
    const sanitizedItemName = sanitizeInput(itemName);
    const sanitizedSupplier = sanitizeInput(supplier);

    // Validation
    if (!sanitizedItemName || !quantity || !unit || !sanitizedSupplier) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Check if item already exists
    const itemExists = await Inventory.findOne({ itemName: sanitizedItemName });
    if (itemExists) {
        res.status(400);
        throw new Error('Item already exists');
    }

    const item = await Inventory.create({
        itemName: sanitizedItemName,
        quantity,
        unit,
        supplier: sanitizedSupplier,
        minThreshold: minThreshold || 10
    });

    res.status(201).json(item);
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin/Manager
export const updateInventoryItem = asyncHandler(async (req, res) => {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Inventory item not found');
    }

    // Check if updating name and it already exists
    if (req.body.itemName && req.body.itemName !== item.itemName) {
        const itemExists = await Inventory.findOne({ itemName: req.body.itemName });
        if (itemExists) {
            res.status(400);
            throw new Error('Item name already exists');
        }
    }

    item.itemName = sanitizeInput(req.body.itemName) || item.itemName;
    item.quantity = req.body.quantity !== undefined ? req.body.quantity : item.quantity;
    item.unit = req.body.unit || item.unit;
    item.supplier = sanitizeInput(req.body.supplier) || item.supplier;
    item.minThreshold = req.body.minThreshold || item.minThreshold;

    const updatedItem = await item.save();
    res.json(updatedItem);
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin/Manager
export const deleteInventoryItem = asyncHandler(async (req, res) => {
    const item = await Inventory.findById(req.params.id);

    if (item) {
        await item.deleteOne();
        res.json({ message: 'Inventory item removed' });
    } else {
        res.status(404);
        throw new Error('Inventory item not found');
    }
});

// @desc    Update inventory quantity
// @route   PATCH /api/inventory/:id/quantity
// @access  Private/Admin/Manager
export const updateQuantity = asyncHandler(async (req, res) => {
    const { quantity, operation } = req.body;
    const item = await Inventory.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Inventory item not found');
    }

    if (quantity === undefined) {
        res.status(400);
        throw new Error('Please provide quantity');
    }

    if (operation === 'add') {
        item.quantity += Number(quantity);
    } else if (operation === 'subtract') {
        item.quantity -= Number(quantity);
    } else {
        item.quantity = Number(quantity);
    }

    // Ensure quantity doesn't go below 0
    if (item.quantity < 0) {
        item.quantity = 0;
    }

    await item.save();

    // Check if low stock
    const isLowStock = item.quantity <= item.minThreshold;

    res.json({
        item,
        isLowStock,
        message: isLowStock ? 'Low stock alert!' : 'Quantity updated successfully'
    });
});

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock/all
// @access  Private/Admin/Manager
export const getLowStockItems = asyncHandler(async (req, res) => {
    const items = await Inventory.find({
        $expr: { $lte: ['$quantity', '$minThreshold'] }
    }).sort('quantity');

    res.json(items);
});