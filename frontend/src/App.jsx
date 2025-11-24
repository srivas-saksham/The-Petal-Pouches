// frontend/src/App.jsx (MODIFY)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRoutes from './routes/adminRoutes';
import Shop from './pages/Shop';

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Navigate to="/shop" replace />} />
          <Route path="/shop" element={<Shop />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;