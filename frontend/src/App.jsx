// frontend/src/App.jsx - WITH GATEWAY ROUTE PROTECTION (FIXED)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { CartSidebarProvider } from './hooks/useCartSidebar';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ProtectedCustomerRoute from './components/user/ProtectedCustomerRoute';
import ProtectedByGateway from './components/ProtectedByGateway';
import useScrollRestoration from './hooks/useScrollRestoration';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminRoutes from './routes/adminRoutes';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/ShopNew';
import BundleDetailPage from './pages/BundleDetailPage';

// User/Customer Auth Pages
import UserLogin from './pages/user/UserLogin';
import UserRegister from './pages/user/UserRegister';
import ForgotPassword from './pages/user/ForgotPassword';
import OAuthCallback from './pages/auth/OAuthCallback';
import Checkout from './pages/Checkout';

// Order Pages
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/user/OrderDetails';

// User Routes
import UserRoutes from './routes/userRoutes';

// Cart Sidebar Component
import CartSidebar from './components/cart/CartSidebar';

// 🔒 Gateway Login
import GatewayLogin from './pages/GatewayLogin';

function ScrollManager() {
  useScrollRestoration();
  return null;
}

function App() {
  return (
    <BrowserRouter>
    <ScrollManager />
      <ToastProvider>
        <AdminAuthProvider>
          <UserAuthProvider>
            <Routes>
              {/* ==================== GATEWAY LOGIN (UNPROTECTED) ==================== */}
              <Route path="/gateway-login" element={<GatewayLogin />} />

              {/* ==================== ALL OTHER ROUTES (GATEWAY PROTECTED) ==================== */}
              <Route
                path="/*"
                element={
                  <ProtectedByGateway>
                    {/* ✅ FIXED: CartProvider now only mounts AFTER gateway check passes */}
                    <CartProvider>
                      {/* ✅ CartSidebarProvider wraps app for global cart sidebar */}
                      <CartSidebarProvider>
                        <Routes>
                          {/* ==================== PUBLIC ROUTES ==================== */}
                          
                          {/* Home Landing Page */}
                          <Route path="/" element={<Home />} />
                          
                          {/* Shop Pages */}
                          <Route path="/shop" element={<Shop />} />
                          <Route path="/shop/bundles/:id" element={<BundleDetailPage />} />
                          <Route path="/shop/products/:id" element={<BundleDetailPage />} />
                          
                          {/* ==================== USER/CUSTOMER AUTH ROUTES ==================== */}
                          
                          {/* User Authentication */}
                          <Route path="/login" element={<UserLogin />} />
                          <Route path="/register" element={<UserRegister />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          
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
                          
                          {/* Order Success Page - Shows after successful order placement */}
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

                          {/* Individual Order Details Route (Protected) */}
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

                          {/* OAuth Callback */}
                          <Route path="/auth/callback" element={<OAuthCallback />} />

                          {/* ==================== 404 - CATCH ALL ==================== */}
                          
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>

                        {/* ✅ Global Cart Sidebar - Renders on top of everything */}
                        <CartSidebar />
                      </CartSidebarProvider>
                    </CartProvider>
                  </ProtectedByGateway>
                }
              />
            </Routes>
          </UserAuthProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;