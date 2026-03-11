import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';
import { validateEmail, validatePassword, sanitizeInput } from '../utils/validation.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const count = await User.countDocuments({});
    const users = await User.find({})
        .select('-password')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort('-createdAt');

    res.json({
        users,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Create user (admin only - can create staff/manager)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email)?.toLowerCase();

    // Validation
    if (!sanitizedName || !sanitizedEmail || !password || !role) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    if (!validateEmail(sanitizedEmail)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    if (!validatePassword(password)) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    if (!Object.values(ROLES).includes(role) || role === ROLES.CUSTOMER) {
        res.status(400);
        throw new Error('Invalid role');
    }

    // Check if user exists
    const userExists = await User.findOne({ email: sanitizedEmail });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name: sanitizedName,
        email: sanitizedEmail,
        password,
        role,
        phone
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = sanitizeInput(req.body.name) || user.name;
        user.email = sanitizeInput(req.body.email)?.toLowerCase() || user.email;
        user.role = req.body.role || user.role;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            if (!validatePassword(req.body.password)) {
                res.status(400);
                throw new Error('Password must be at least 6 characters');
            }
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === ROLES.ADMIN) {
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

// @desc    Get staff members
// @route   GET /api/users/staff/all
// @access  Private/Admin/Manager
export const getStaff = asyncHandler(async (req, res) => {
    const staff = await User.find({
        role: { $in: [ROLES.STAFF, ROLES.MANAGER] }
    }).select('-password');

    res.json(staff);
});