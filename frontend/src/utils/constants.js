// src/utils/constants.js
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const TABLE_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved'
};

export const MENU_CATEGORIES = {
  STARTER: 'Starter',
  MAIN_COURSE: 'Main Course',
  DESSERT: 'Dessert',
  DRINKS: 'Drinks'
};

export const INVENTORY_UNITS = [
  'kg', 'g', 'l', 'ml', 'pieces', 'boxes', 'packets', 'bottles', 'cans'
];

export const NAV_ITEMS = {
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Menu', path: '/admin/menu', icon: '📋' },
    { name: 'Tables', path: '/admin/tables', icon: '🪑' },
    { name: 'Bookings', path: '/admin/bookings', icon: '📅' },
    { name: 'Inventory', path: '/admin/inventory', icon: '📦' } // Added inventory for admin
  ],
  manager: [
    { name: 'Dashboard', path: '/manager/dashboard', icon: '📊' },
    { name: 'Menu', path: '/manager/menu', icon: '📋' },
    { name: 'Tables', path: '/manager/tables', icon: '🪑' },
    { name: 'Bookings', path: '/manager/bookings', icon: '📅' },
    { name: 'Inventory', path: '/manager/inventory', icon: '📦' }
  ],
  staff: [
    { name: 'Dashboard', path: '/staff/dashboard', icon: '📊' },
    { name: 'Bookings', path: '/staff/bookings', icon: '📅' }
  ],
  customer: [
    { name: 'My Bookings', path: '/customer/bookings', icon: '📅' },
    { name: 'Profile', path: '/customer/profile', icon: '👤' }
  ]
};