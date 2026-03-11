import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Admin details
    const adminData = {
      name: 'Rakesh',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: ROLES.ADMIN,
      phone: '7001584784'
    };

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminData.email });

    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin
    const admin = await User.create(adminData);

    if (admin) {
      console.log('Admin created successfully:');
      console.log('Email: admin@restaurant.com');
      console.log('Password: admin123');
    } else {
      console.log('Failed to create admin');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();