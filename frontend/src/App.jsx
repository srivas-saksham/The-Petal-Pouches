// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// New Premium Admin Dashboard Routes
import AdminRoutes from './routes/adminRoutes';

// Old Admin System (Fallback/Legacy)
import Admin from './pages/Admin';

// Customer-facing Shop
import Shop from './pages/Shop';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================ */}
        {/* ROOT REDIRECT */}
        {/* ============================================ */}
        <Route path="/" element={<Navigate to="/shop" replace />} />

        {/* ============================================ */}
        {/* CUSTOMER-FACING ROUTES */}
        {/* ============================================ */}
        <Route path="/shop" element={<Shop />} />

        {/* ============================================ */}
        {/* NEW PREMIUM ADMIN DASHBOARD */}
        {/* ============================================ */}
        {/* All routes under /admin/* use the new premium UI */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* ============================================ */}
        {/* OLD ADMIN SYSTEM (Legacy/Fallback) */}
        {/* ============================================ */}
        {/* Keep this for backward compatibility if needed */}
        <Route path="/admin-legacy" element={<Admin />} />

        {/* ============================================ */}
        {/* 404 - NOT FOUND */}
        {/* ============================================ */}
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="text-center p-8">
                <div className="text-9xl mb-4">🌸</div>
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Oops! This page doesn't exist
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/shop" 
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    Go to Shop
                  </a>
                  <a 
                    href="/admin/dashboard" 
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Admin Dashboard
                  </a>
                </div>
              </div>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;