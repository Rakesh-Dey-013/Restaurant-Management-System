import User from '../models/User.js';

export const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@restaurant.com' });

    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin',
        phone: '0000000000',
      });
      console.log('Default admin account created');
      console.log('Email: admin@restaurant.com');
      console.log('Password: admin123');
    } else {
      console.log('Default admin already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};