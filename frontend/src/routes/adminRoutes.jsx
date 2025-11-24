// frontend/src/routes/adminRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/layout/AdminLayout';

// Import Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import ProductsPage from '../pages/admin/ProductsPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import CategoriesForm from '../components/adminComps/CategoriesForm';
import BundlesPage from '../pages/admin/BundlesPage';
import OrdersPage from '../pages/admin/OrdersPage';
import CustomersPage from '../pages/admin/CustomersPage';
import NotificationsPage from '../pages/admin/NotificationsPage';
import SettingsPage from '../pages/admin/SettingsPage';

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        {/* Redirect /admin to /admin/dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Products */}
        <Route path="/products" element={<ProductsPage />} />
        
        {/* Categories */}
        <Route path="/categories" element={<CategoriesPage />} />
        
        {/* Bundles */}
        <Route path="/bundles" element={<BundlesPage />} />
        
        {/* Orders */}
        <Route path="/orders" element={<OrdersPage />} />
        
        {/* Customers */}
        <Route path="/customers" element={<CustomersPage />} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* 404 - Catch all unmatched admin routes */}
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-admin-pink mb-4">404</h1>
                <p className="text-xl text-text-secondary mb-6">Page not found</p>
                <a 
                  href="/admin/dashboard" 
                  className="btn btn-primary"
                >
                  Back to Dashboard/admin
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </AdminLayout>
  );
}