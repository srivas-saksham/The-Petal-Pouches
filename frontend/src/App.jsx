// frontend/src/App.jsx (FIXED - uses /user/* paths)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ProtectedCustomerRoute from './components/user/ProtectedCustomerRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRoutes from './routes/adminRoutes';
import UserRoutes from './routes/userRoutes';
import Shop from './pages/Shop';
import UserLogin from './pages/user/UserLogin';
import UserRegister from './pages/user/UserRegister';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AdminAuthProvider>
          <UserAuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/shop" replace />} />
              <Route path="/shop" element={<Shop />} />
              
              {/* User/Customer Auth Routes */}
              <Route path="/login" element={<UserLogin />} />
              <Route path="/register" element={<UserRegister />} />
              
              {/* Protected User Routes - Changed to /user/* */}
              <Route
                path="/user/*"
                element={
                  <ProtectedCustomerRoute>
                    <UserRoutes />
                  </ProtectedCustomerRoute>
                }
              />

              {/* Admin Auth Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Protected Admin Routes */}
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
          </UserAuthProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;