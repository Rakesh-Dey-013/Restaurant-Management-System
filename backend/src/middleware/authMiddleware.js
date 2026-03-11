import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in cookies first, then in authorization header
    token = req.cookies.jwt;

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            res.status(401);
            throw new Error('User not found');
        }

        next();
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }

        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Role ${req.user.role} is not authorized to access this route`);
        }

        next();
    };
};

// Specific role middlewares
export const isAdmin = authorize(ROLES.ADMIN);
export const isManager = authorize(ROLES.ADMIN, ROLES.MANAGER);
export const isStaff = authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF);