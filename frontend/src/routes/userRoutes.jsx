// frontend/src/routes/userRoutes.jsx - FULL WITH ALL CUSTOMER ROUTES

import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../components/user/layout/CustomerLayout';

// Import User Pages
import Dashboard from '../pages/user/Dashboard';
import Profile from '../pages/user/Profile';
import Addresses from '../pages/user/Addresses';
import Orders from '../pages/user/Orders';
import Wishlist from '../pages/user/Wishlist';
import Settings from '../pages/user/Settings';
import Notifications from '../pages/user/Notifications';

/**
 * 404 Page Component
 */
const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-tpppink mb-4">404</h1>
      <p className="text-xl text-tppslate mb-6">Page not found</p>
      <a
        href="/user/dashboard"
        className="px-6 py-3 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-colors inline-block font-medium"
      >
        Back to Dashboard
      </a>
    </div>
  </div>
);

/**
 * UserRoutes - All protected customer/user routes
 * Wrapped by ProtectedCustomerRoute in App.jsx
 * All routes prefixed with /user/*
 */
export default function UserRoutes() {
  return (
    <CustomerLayout>
      <Routes>
        {/* ==================== DEFAULT REDIRECT ==================== */}

        {/* /user redirects to /user/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* ==================== MAIN USER ROUTES ==================== */}

        {/* Dashboard - /user/dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Profile Management - /user/profile */}
        <Route path="profile" element={<Profile />} />

        {/* Addresses Management - /user/addresses */}
        <Route path="addresses" element={<Addresses />} />

        {/* Orders History - /user/orders */}
        <Route path="orders" element={<Orders />} />

        {/* Wishlist - /user/wishlist */}
        {/* <Route path="wishlist" element={<Wishlist />} /> */}

        {/* Settings - /user/settings */}
        {/* <Route path="settings" element={<Settings />} /> */}

        {/* Notifications - /user/notifications */}
        <Route path="notifications" element={<Notifications />} />

        {/* ==================== 404 - CATCH ALL UNMATCHED ROUTES ==================== */}

        {/* Any other /user/* route shows 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </CustomerLayout>
  );
}