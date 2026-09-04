import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Cooks from './pages/Cooks';
import Foods from './pages/Foods';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { useAuth } from './context/AuthContext';

// Protected route guard for Admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, admin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Ensure role is admin
  if (admin && admin.role && admin.role.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/admin/login" element={
        isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />
      } />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="cooks" element={<Cooks />} />
        <Route path="foods" element={<Foods />} />
        <Route path="categories" element={<Categories />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
