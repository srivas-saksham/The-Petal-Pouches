// frontend/src/App.jsx - WITH CART SIDEBAR & ORDER ROUTES

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { CartSidebarProvider } from './hooks/useCartSidebar';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ProtectedCustomerRoute from './components/user/ProtectedCustomerRoute';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminRoutes from './routes/adminRoutes';

// User/Customer Pages
import UserRoutes from './routes/userRoutes';
import Shop from './pages/ShopNew';
import BundleDetailPage from './pages/BundleDetailPage';
import UserLogin from './pages/user/UserLogin';
import UserRegister from './pages/user/UserRegister';
import Checkout from './pages/Checkout';

// ✅ NEW: Order Pages
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/user/OrderDetails';

// Cart Sidebar Component
import CartSidebar from './components/cart/CartSidebar';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AdminAuthProvider>
          <UserAuthProvider>
            {/* 🛒 CartProvider wraps all routes to provide global cart state */}
            <CartProvider>
              {/* ✅ CartSidebarProvider wraps app for global cart sidebar */}
              <CartSidebarProvider>
                <Routes>
                  {/* ==================== PUBLIC ROUTES ==================== */}
                  
                  {/* Root redirect */}
                  <Route path="/" element={<Navigate to="/shop" replace />} />
                  
                  {/* Shop Pages */}
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/bundles/:id" element={<BundleDetailPage />} />
                  
                  {/* ==================== USER/CUSTOMER AUTH ROUTES ==================== */}
                  
                  {/* User Authentication */}
                  <Route path="/login" element={<UserLogin />} />
                  <Route path="/register" element={<UserRegister />} />
                  
                  {/* ==================== CHECKOUT ROUTE (Public but Protected) ==================== */}
                  
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedCustomerRoute>
                        <Checkout />
                      </ProtectedCustomerRoute>
                    }
                  />
                  
                  {/* ==================== ORDER SUCCESS ROUTE (Protected) ==================== */}
                  
                  {/* ✅ NEW: Order Success Page - Shows after successful order placement */}
                  <Route
                    path="/order-success/:orderId"
                    element={
                      <ProtectedCustomerRoute>
                        <OrderSuccess />
                      </ProtectedCustomerRoute>
                    }
                  />
                  
                  {/* ==================== PROTECTED USER ROUTES ==================== */}
                  
                  {/* Protected User Dashboard & Settings */}
                  <Route
                    path="/user/*"
                    element={
                      <ProtectedCustomerRoute>
                        <UserRoutes />
                      </ProtectedCustomerRoute>
                    }
                  />

                  {/* ✅ NEW: Individual Order Details Route (Protected) */}
                  <Route
                    path="/user/orders/:orderId"
                    element={
                      <ProtectedCustomerRoute>
                        <OrderDetails />
                      </ProtectedCustomerRoute>
                    }
                  />

                  {/* ==================== ADMIN AUTH ROUTES ==================== */}
                  
                  {/* Admin Login */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  {/* ==================== PROTECTED ADMIN ROUTES ==================== */}
                  
                  {/* Protected Admin Dashboard & Management */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute>
                        <AdminRoutes />
                      </ProtectedRoute>
                    }
                  />

                  {/* ==================== 404 - CATCH ALL ==================== */}
                  
                  <Route path="*" element={<Navigate to="/shop" replace />} />
                </Routes>

                {/* ✅ Global Cart Sidebar - Renders on top of everything */}
                <CartSidebar />
              </CartSidebarProvider>
            </CartProvider>
          </UserAuthProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;