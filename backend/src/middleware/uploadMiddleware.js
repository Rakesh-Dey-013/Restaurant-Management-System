import multer from 'multer';
import path from 'path';
import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

// Configure multer storage (memory storage for cloudinary)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// Multer upload middleware
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Cloudinary upload function
export const uploadToCloudinary = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // Convert buffer to readable stream
        const stream = Readable.from(req.file.buffer);

        // Upload to cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'restaurant-management',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.pipe(uploadStream);
        });

        // Add cloudinary URL to request
        req.file.cloudinaryUrl = result.secure_url;
        req.file.publicId = result.public_id;

        next();
    } catch (error) {
        res.status(400);
        throw new Error('Image upload failed');
    }
});