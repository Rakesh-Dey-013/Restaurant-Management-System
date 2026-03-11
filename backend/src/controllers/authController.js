import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validateEmail, validatePassword, sanitizeInput } from '../utils/validation.js';
import { ROLES } from '../config/constants.js';

// @desc    Register a new user (customer only)
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email)?.toLowerCase();

    // Validation
    if (!sanitizedName || !sanitizedEmail || !password) {
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

    // Check if user exists
    const userExists = await User.findOne({ email: sanitizedEmail });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user (always as customer)
    const user = await User.create({
        name: sanitizedName,
        email: sanitizedEmail,
        password,
        phone,
        role: ROLES.CUSTOMER
    });

    if (user) {
        generateToken(res, user._id);

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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const sanitizedEmail = sanitizeInput(email)?.toLowerCase();

    if (!sanitizedEmail || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email: sanitizedEmail }).select('+password');

    if (user && (await user.comparePassword(password))) {
        generateToken(res, user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            createdAt: user.createdAt
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = sanitizeInput(req.body.name) || user.name;
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