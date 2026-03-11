import asyncHandler from 'express-async-handler';
import Table from '../models/Table.js';
import { TABLE_STATUS } from '../config/constants.js';

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
export const getTables = asyncHandler(async (req, res) => {
  const { status, seats } = req.query;
  let query = {};

  if (status && Object.values(TABLE_STATUS).includes(status)) {
    query.status = status;
  }

  if (seats) {
    query.seats = { $gte: Number(seats) };
  }

  const tables = await Table.find(query).sort('tableNumber');
  res.json(tables);
});

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Public
export const getTableById = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (table) {
    res.json(table);
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
});

// @desc    Create table
// @route   POST /api/tables
// @access  Private/Admin/Manager
export const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, seats, status } = req.body;

  // Validation
  if (!tableNumber || !seats) {
    res.status(400);
    throw new Error('Please provide table number and seats');
  }

  // Check if table number already exists
  const tableExists = await Table.findOne({ tableNumber });
  if (tableExists) {
    res.status(400);
    throw new Error('Table number already exists');
  }

  const table = await Table.create({
    tableNumber,
    seats,
    status: status || TABLE_STATUS.AVAILABLE,
    image: req.file?.cloudinaryUrl || 'https://via.placeholder.com/300x200?text=Table'
  });

  res.status(201).json(table);
});

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private/Admin/Manager
export const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }

  // Check if updating table number and it already exists
  if (req.body.tableNumber && req.body.tableNumber !== table.tableNumber) {
    const tableExists = await Table.findOne({ tableNumber: req.body.tableNumber });
    if (tableExists) {
      res.status(400);
      throw new Error('Table number already exists');
    }
  }

  table.tableNumber = req.body.tableNumber || table.tableNumber;
  table.seats = req.body.seats || table.seats;
  table.status = req.body.status || table.status;

  if (req.file?.cloudinaryUrl) {
    table.image = req.file.cloudinaryUrl;
  }

  const updatedTable = await table.save();
  res.json(updatedTable);
});

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private/Admin/Manager
export const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (table) {
    await table.deleteOne();
    res.json({ message: 'Table removed' });
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
});

// @desc    Update table status
// @route   PATCH /api/tables/:id/status
// @access  Private/Staff
export const updateTableStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const table = await Table.findById(req.params.id);

  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }

  if (!Object.values(TABLE_STATUS).includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  table.status = status;
  await table.save();

  res.json(table);
});