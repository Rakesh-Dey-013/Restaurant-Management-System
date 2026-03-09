import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Create staff member
// @route   POST /api/staff
// @access  Private/Admin
export const createStaff = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private/Admin
export const getStaff = asyncHandler(async (req, res) => {
    const staff = await User.find({}).select('-password');
    res.json(staff);
});

// @desc    Get staff member by ID
// @route   GET /api/staff/:id
// @access  Private/Admin
export const getStaffById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
export const updateStaff = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.phone = req.body.phone || user.phone;
        user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            isActive: updatedUser.isActive,
            createdAt: updatedUser.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private/Admin
export const deleteStaff = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete admin user');
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});