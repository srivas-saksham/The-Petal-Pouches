// frontend/src/routes/adminRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/layout/AdminLayout';

// Import Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import ProductsPage from '../pages/admin/ProductsPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import BundlesPage from '../pages/admin/BundlesPage';
import AdminOrdersPage from '../pages/admin/orders/AdminOrdersPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage'; // ✅ UPDATED
import NotificationsPage from '../pages/admin/NotificationsPage';
import SettingsPage from '../pages/admin/SettingsPage';
import AdminShipmentsPage from '../pages/admin/AdminShipmentsPage';
import CouponsPage from '../pages/admin/CouponsPage';

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/bundles" element={<BundlesPage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/orders" element={<AdminOrdersPage />} />
        <Route path="shipments" element={<AdminShipmentsPage />} />
        <Route path="/customers" element={<AdminCustomersPage />} /> {/* ✅ UPDATED */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
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
                  Back to Dashboard
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </AdminLayout>
  );
}