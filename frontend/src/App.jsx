// frontend/src/App.jsx (UPDATED WITH USER ROUTES)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext'; // ✅ ADD THIS
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ProtectedCustomerRoute from './components/user/ProtectedCustomerRoute'; // ✅ ADD THIS
import AdminLogin from './pages/admin/AdminLogin';
import AdminRoutes from './routes/adminRoutes';
import UserRoutes from './routes/userRoutes'; // ✅ ADD THIS
import Shop from './pages/Shop';
import UserLogin from './pages/user/UserLogin'; // ✅ ADD THIS
import UserRegister from './pages/user/UserRegister'; // ✅ ADD THIS

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        {/* Wrap entire app with both auth providers */}
        <AdminAuthProvider>
          <UserAuthProvider> {/* ✅ ADD USER AUTH PROVIDER */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/shop" replace />} />
              <Route path="/shop" element={<Shop />} />
              
              {/* ✅ USER/CUSTOMER AUTH ROUTES */}
              <Route path="/login" element={<UserLogin />} />
              <Route path="/register" element={<UserRegister />} />
              
              {/* ✅ PROTECTED CUSTOMER ROUTES */}
              <Route
                path="/customer/*"
                element={
                  <ProtectedCustomerRoute>
                    <UserRoutes />
                  </ProtectedCustomerRoute>
                }
              />
              
              {/* Alternative path for user routes */}
              <Route
                path="/user/*"
                element={
                  <ProtectedCustomerRoute>
                    <UserRoutes />
                  </ProtectedCustomerRoute>
                }
              />

              {/* ADMIN AUTH ROUTES */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* PROTECTED ADMIN ROUTES */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminRoutes />
                  </ProtectedRoute>
                }
              />

              {/* 404 - Catch all */}
              <Route path="*" element={<Navigate to="/shop" replace />} />
            </Routes>
          </UserAuthProvider> {/* ✅ CLOSE USER AUTH PROVIDER */}
        </AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;