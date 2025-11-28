// frontend/src/routes/userRoutes.jsx - CORRECTED

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

export default function UserRoutes() {
  return (
    <CustomerLayout>
      <Routes>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
        
        {/* Addresses */}
        <Route path="addresses" element={<Addresses />} />
        
        {/* Orders */}
        <Route path="orders" element={<Orders />} />
        
        {/* Wishlist */}
        <Route path="wishlist" element={<Wishlist />} />
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
        
        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />
        
        {/* 404 - Catch all unmatched customer routes */}
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-tpppink mb-4">404</h1>
                <p className="text-xl text-tppslate mb-6">Page not found</p>
                <a 
                  href="/user/dashboard" 
                  className="px-6 py-3 bg-tpppink text-white rounded-lg hover:bg-tpppink/90 transition-colors inline-block"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </CustomerLayout>
  );
}