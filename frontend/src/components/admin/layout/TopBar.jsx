// frontend/src/components/admin/layout/TopBar.jsx

import { Menu, Bell, User, LogOut, Search, X, Settings, Package, ShoppingCart, Users as UsersIcon, Layers, Circle, Clock, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper function to decode JWT without external library
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export default function TopBar({ onMenuClick }) {
  const { logout, admin } = useAdminAuth();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // ✅ NEW: Token countdown states
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const notifications = [
    { id: 1, text: 'New order received', time: '5 min ago', unread: true },
    { id: 2, text: 'Low stock alert: Teddy Bear', time: '1 hour ago', unread: true },
    { id: 3, text: 'New customer registered', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'AD';
    if (name == 'Miss Founder') return '❤';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // ✅ NEW: Calculate time remaining from JWT token
  const calculateTimeRemaining = () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        setTimeRemaining(null);
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded || !decoded.exp) {
        setTimeRemaining(null);
        return;
      }

      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const remaining = expirationTime - currentTime;

      if (remaining <= 0) {
        setTimeRemaining(0);
        // Token expired - trigger logout
        handleTokenExpiry();
        return;
      }

      setTimeRemaining(remaining);

      // Show warning when less than 5 minutes remaining
      if (remaining < 5 * 60 * 1000 && remaining > 0 && !showExpiryWarning) {
        setShowExpiryWarning(true);
      }
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      setTimeRemaining(null);
    }
  };

  // ✅ NEW: Handle token expiry
  const handleTokenExpiry = async () => {
    console.warn('Token expired - logging out');
    await logout();
    navigate('/admin/login', { 
      state: { message: 'Your session has expired. Please login again.' } 
    });
  };

  // ✅ NEW: Format time remaining
  const formatTimeRemaining = (ms) => {
    if (!ms || ms <= 0) return '0:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ✅ NEW: Get warning color based on time remaining
  const getTimerColor = () => {
    if (!timeRemaining) return 'text-tppslate';
    
    const minutes = Math.floor(timeRemaining / 60000);
    
    if (minutes <= 2) return 'text-red-600 animate-pulse';
    if (minutes <= 5) return 'text-tppslate';
    if (minutes <= 10) return 'text-tppslate';
    return 'text-tppslate';
  };

  // ✅ NEW: Token countdown effect
  useEffect(() => {
    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const lowerQuery = query.toLowerCase().trim();
      
      // Search products, bundles, orders, and customers in parallel
      const [productsRes, bundlesRes, ordersRes, customersRes] = await Promise.all([
        fetch(`${API_URL}/api/products?limit=100`).catch(() => null),
        fetch(`${API_URL}/api/bundles?limit=100`).catch(() => null),
        fetch(`${API_URL}/api/orders?limit=100`).catch(() => null),
        fetch(`${API_URL}/api/customers?limit=100`).catch(() => null),
      ]);

      const results = {
        products: [],
        bundles: [],
        orders: [],
        customers: []
      };

      // Filter products by search query
      if (productsRes?.ok) {
        const data = await productsRes.json();
        const allProducts = data.data || [];
        results.products = allProducts
          .filter(p => 
            p.title?.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            p.sku?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 3);
      }

      // Filter bundles by search query - deduplicate by ID
      if (bundlesRes?.ok) {
        const data = await bundlesRes.json();
        const allBundles = data.data || [];
        
        const uniqueBundlesMap = new Map();
        
        allBundles.forEach(bundle => {
          if (bundle.title?.toLowerCase().includes(lowerQuery) ||
              bundle.description?.toLowerCase().includes(lowerQuery)) {
            if (!uniqueBundlesMap.has(bundle.id)) {
              uniqueBundlesMap.set(bundle.id, bundle);
            }
          }
        });
        
        results.bundles = Array.from(uniqueBundlesMap.values()).slice(0, 3);
      }

      // Filter orders by search query
      if (ordersRes?.ok) {
        const data = await ordersRes.json();
        const allOrders = data.data?.data || [];
        results.orders = allOrders
          .filter(o => 
            o.id?.toString().includes(lowerQuery) ||
            o.customer_name?.toLowerCase().includes(lowerQuery) ||
            o.customer_email?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 3);
      }

      // Filter customers by search query
      if (customersRes?.ok) {
        const data = await customersRes.json();
        const allCustomers = data.data || [];
        results.customers = allCustomers
          .filter(c => 
            c.name?.toLowerCase().includes(lowerQuery) ||
            c.email?.toLowerCase().includes(lowerQuery) ||
            c.phone?.includes(query)
          )
          .slice(0, 3);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ products: [], bundles: [], orders: [], customers: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const navigateToItem = (type, id) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    switch(type) {
      case 'product':
        navigate(`/admin/products/${id}`);
        break;
      case 'bundle':
        navigate(`/admin/bundles/${id}`);
        break;
      case 'order':
        navigate(`/admin/orders/${id}`);
        break;
      case 'customer':
        navigate(`/admin/customers/${id}`);
        break;
    }
  };

  const hasResults = searchResults.products?.length > 0 || 
                     searchResults.bundles?.length > 0 ||
                     searchResults.orders?.length > 0 || 
                     searchResults.customers?.length > 0;

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-tpppeach/30 rounded-lg transition-all duration-200 text-tppslate border-2 border-transparent hover:border-tppslate"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Enhanced Search Bar with Results */}
            <div className="hidden md:block w-full max-w-md relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center transition-all duration-200">
                  <Search className="absolute left-3 w-4 h-4 text-tppslate/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search products, orders, customers..."
                    className="w-full pl-10 pr-10 py-2 bg-white border-2 border-tpppink/50 rounded-lg text-sm text-tppslate placeholder-tppslate/50 !outline-none focus:!outline-none focus:ring-0 transition-all duration-200 hover:border-tpppink focus:bg-tpppink/5"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-tppslate/50" />
                    </button>
                  )}
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-slate-200 z-50 max-h-96 overflow-y-auto animate-scale-in">
                  {isSearching ? (
                    <div className="p-6 text-center text-tppslate/50 text-sm">
                      Searching...
                    </div>
                  ) : hasResults ? (
                    <div className="py-2">
                      {/* Products */}
                      {searchResults.products?.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-xs font-semibold text-tppslate/60 flex items-center gap-2">
                            <Package className="w-3 h-3" />
                            Products
                          </div>
                          {searchResults.products.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => navigateToItem('product', product.id)}
                              className="w-full px-4 py-2 hover:bg-tpppeach/20 transition-all duration-200 text-left flex items-center gap-3 border-2 border-transparent hover:border-tppslate/20"
                            >
                              <img 
                                src={product.img_url} 
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-tppslate truncate">
                                  {product.title}
                                </div>
                                <div className="text-xs text-tppslate/60">
                                  ₹{product.price} • Stock: {product.stock}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Bundles */}
                      {searchResults.bundles?.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-xs font-semibold text-tppslate/60 flex items-center gap-2">
                            <Layers className="w-3 h-3" />
                            Bundles
                          </div>
                          {searchResults.bundles.map((bundle) => (
                            <button
                              key={bundle.id}
                              onClick={() => navigateToItem('bundle', bundle.id)}
                              className="w-full px-4 py-2 hover:bg-tpppeach/20 transition-all duration-200 text-left flex items-center gap-3 border-2 border-transparent hover:border-tppslate/20"
                            >
                              <img 
                                src={bundle.img_url} 
                                alt={bundle.title}
                                className="w-10 h-10 object-cover rounded border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-tppslate truncate">
                                  {bundle.title}
                                </div>
                                <div className="text-xs text-tppslate/60">
                                  ₹{bundle.price} • {bundle.product_count || 0} products
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Orders */}
                      {searchResults.orders?.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-xs font-semibold text-tppslate/60 flex items-center gap-2">
                            <ShoppingCart className="w-3 h-3" />
                            Orders
                          </div>
                          {searchResults.orders.map((order) => (
                            <button
                              key={order.id}
                              onClick={() => navigateToItem('order', order.id)}
                              className="w-full px-4 py-2 hover:bg-tpppeach/20 transition-all duration-200 text-left border-2 border-transparent hover:border-tppslate/20"
                            >
                              <div className="text-sm font-medium text-tppslate">
                                Order #{order.id}
                              </div>
                              <div className="text-xs text-tppslate/60">
                                {order.customer_name || 'Guest'} • ₹{order.total}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Customers */}
                      {searchResults.customers?.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs font-semibold text-tppslate/60 flex items-center gap-2">
                            <UsersIcon className="w-3 h-3" />
                            Customers
                          </div>
                          {searchResults.customers.map((customer) => (
                            <button
                              key={customer.id}
                              onClick={() => navigateToItem('customer', customer.id)}
                              className="w-full px-4 py-2 hover:bg-tpppeach/20 transition-all duration-200 text-left border-2 border-transparent hover:border-tppslate/20"
                            >
                              <div className="text-sm font-medium text-tppslate">
                                {customer.name}
                              </div>
                              <div className="text-xs text-tppslate/60">
                                {customer.email}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* View All Results */}
                      <div className="border-t-2 border-slate-200 mt-2">
                        <button
                          onClick={handleSearch}
                          className="w-full px-4 py-2.5 text-sm text-tppslate hover:bg-tpppeach/20 transition-all font-medium"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-tppslate/50 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* ✅ NEW: Session Timer */}
            {timeRemaining !== null && (
              <div 
                className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border-2 transition-all ml-2 ${
                  timeRemaining <= 2 * 60 * 1000 
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
                title="Session expires in"
              >
                <div className="flex items-center flex-col">
                  <span className={`font-inter text-lg font-bold tabular-nums ${getTimerColor()}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
                {timeRemaining <= 5 * 60 * 1000 && (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
              </div>
            )}

            {/* Go to Home Link */}
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg 
                text-tpppink hover:bg-pink-50 hover:text-tpppink/90 transition-all
                text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tpppink/30"
              title="Go to Home"
            >
              <span>Go to Home</span>
            </button>

            {/* Divider */}
            <Circle size={6} className="hidden sm:block text-tpppink fill-current" />

            {/* Go to Shop Link */}
            <button
              onClick={() => navigate('/shop')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg 
                text-tpppink hover:bg-pink-50 hover:text-tpppink/90 transition-all
                text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tpppink/30"
              title="Go to Shop"
            >
              <span>Go to Shop</span>
            </button>
            
            {/* Notifications - Commented out but preserved */}
            {/* <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 hover:bg-tpppeach/30 rounded-lg transition-all duration-200 text-tppslate border-2 border-transparent hover:border-tppslate"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div> */}

            {/* User Menu - Updated with Auth */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-all duration-200 group border-2 border-transparent hover:border-slate-200"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-tppslate">
                    {admin?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-tppslate/60 capitalize">
                    {admin?.role || 'admin'}
                  </p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-tpppink to-tpppeach rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-semibold">
                    {getInitials(admin?.name)}
                  </span>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-slate-200 z-50 animate-scale-in">
                  <div className="p-2">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="text-sm font-semibold text-tppslate">
                        {admin?.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-tppslate/60">
                        {admin?.email || 'admin@tpp.com'}
                      </p>
                    </div>

                    {/* Profile */}
                    <button
                      onClick={() => {
                        navigate('/admin/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-tppslate hover:bg-slate-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>

                    {/* Settings */}
                    <button
                      onClick={() => {
                        navigate('/admin/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-tppslate hover:bg-slate-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>

                    <div className="my-2 border-t-2 border-slate-200" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium border-2 border-transparent hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          <span>Logging out...</span>
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Session Expiry Warning Banner */}
      {showExpiryWarning && timeRemaining > 0 && timeRemaining <= 5 * 60 * 1000 && (
        <div className="bg-orange-50 border-t-2 border-orange-200 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-900">
                <span className="font-semibold">Session expiring soon!</span> Your session will expire in{' '}
                <span className="font-bold">{formatTimeRemaining(timeRemaining)}</span>. 
                Save your work to avoid losing changes.
              </p>
            </div>
            <button
              onClick={() => setShowExpiryWarning(false)}
              className="text-orange-600 hover:text-orange-800 transition-colors"
              aria-label="Dismiss warning"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}