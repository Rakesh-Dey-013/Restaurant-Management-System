// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Public Pages
import Home from './pages/public/Home';
import Menu from './pages/public/Menu';
import BookTable from './pages/public/BookTable'; // Import booking page
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageMenu from './pages/admin/ManageMenu';
import ManageTables from './pages/admin/ManageTables';
import ManageBookings from './pages/admin/ManageBookings';
import AdminInventory from './pages/admin/AdminInventory';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import Inventory from './pages/manager/Inventory';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import TableBookings from './pages/staff/TableBookings';

// Customer Pages
import MyBookings from './pages/customer/MyBookings';
import Profile from './pages/customer/Profile';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <Routes>
              {/* Public Routes */}
              <Route element={<RootLayout />}>
                <Route index element={<Home />} />
                <Route path="menu" element={<Menu />} />
                <Route path="book-table" element={<BookTable />} /> {/* Add booking route */}
              </Route>

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              {/* Protected Routes - Rest remains the same */}
              <Route element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* Admin Routes */}
                  <Route element={<RoleRoute allowedRoles={['admin']} />}>
                    <Route path="admin/dashboard" element={<AdminDashboard />} />
                    <Route path="admin/users" element={<ManageUsers />} />
                    <Route path="admin/menu" element={<ManageMenu />} />
                    <Route path="admin/tables" element={<ManageTables />} />
                    <Route path="admin/bookings" element={<ManageBookings />} />
                    <Route path="admin/inventory" element={<AdminInventory />} />
                  </Route>

                  {/* Manager Routes */}
                  <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
                    <Route path="manager/dashboard" element={<ManagerDashboard />} />
                    <Route path="manager/inventory" element={<Inventory />} />
                    <Route path="manager/menu" element={<ManageMenu />} />
                    <Route path="manager/tables" element={<ManageTables />} />
                    <Route path="manager/bookings" element={<ManageBookings />} />
                  </Route>

                  {/* Staff Routes */}
                  <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'staff']} />}>
                    <Route path="staff/dashboard" element={<StaffDashboard />} />
                    <Route path="staff/bookings" element={<TableBookings />} />
                  </Route>

                  {/* Customer Routes */}
                  <Route element={<RoleRoute allowedRoles={['customer']} />}>
                    <Route path="customer/bookings" element={<MyBookings />} />
                    <Route path="customer/profile" element={<Profile />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;