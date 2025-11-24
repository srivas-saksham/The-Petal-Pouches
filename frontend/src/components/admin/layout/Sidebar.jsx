// frontend/src/components/admin/layout/Sidebar.jsx

import { 
  Home, 
  Package, 
  FolderTree, 
  Gift, 
  ShoppingCart, 
  Users, 
  Bell, 
  Settings,
  ChevronsLeft,
  ChevronsRight,
  CheckCheck,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS, NAVIGATION_SECTIONS } from '../../../utils/constants';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { logout, admin } = useAdminAuth();
  const navigate = useNavigate();
  
  const markAllAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsMarkingRead(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      //   }
      // });
      // if (response.ok) {
      //   setNotificationCount(0);
      // }
      
      // For now, just set to 0
      setNotificationCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if error
      navigate('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Group navigation items by section
  const groupedItems = NAVIGATION_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});

  // Icon mapping
  const iconMap = {
    dashboard: Home,
    product: Package,
    category: FolderTree,
    bundle: Gift,
    order: ShoppingCart,
    customer: Users,
    notification: Bell,
    settings: Settings,
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  // Get admin initials
  const getInitials = (name) => {
    if (!name) return 'AD';
    if (name == 'Miss Founder') return '❤';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-tppslate
          z-50
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div className="flex flex-col h-full relative">
          {/* Toggle Button - Desktop Only */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex absolute -right-4 top-6 w-8 h-8 bg-white border-2 border-slate-200 rounded-full items-center justify-center shadow-lg hover:shadow-xl hover:border-tppslate transition-all duration-200 group z-50"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4 text-tppslate" />
            ) : (
              <ChevronsLeft className="w-4 h-4 text-tppslate" />
            )}
          </button>

          {/* Logo */}
          <div className={`bg-tpppink flex items-center gap-3 border-b border-white/10 transition-all ${isCollapsed ? 'justify-center px-3 py-6' : 'px-5 py-5'}`}>
            <div className={`bg-white rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isCollapsed ? 'w-11 h-11' : 'w-9 h-9'}`}>
              <span className={`text-tppslate font-bold transition-all ${isCollapsed ? 'text-lg' : 'text-base'}`}>TP</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <h1 className="text-white font-semibold text-base truncate">The Petal Pouches</h1>
                <p className="text-white/50 text-xs">Admin Panel</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 bg-tpppink">
            {Object.keys(groupedItems).map((section) => (
              <div key={section}>
                {/* Section Label */}
                {section !== 'main' && !isCollapsed && (
                  <div className="px-3 mb-2">
                    <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                      {NAVIGATION_SECTIONS[section]}
                    </h3>
                  </div>
                )}

                {/* Section Items */}
                <div className="space-y-0.5">
                  {groupedItems[section].map((item) => {
                    const Icon = iconMap[item.icon];
                    const isNotificationItem = item.icon === 'notification';
                    const badgeCount = isNotificationItem ? notificationCount : (item.badge || 0);
                    
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={onClose}
                        title={isCollapsed ? item.label : ''}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                            isCollapsed ? 'justify-center' : ''
                          } ${
                            isActive
                              ? 'bg-white text-tppslate shadow-sm'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="relative">
                              <Icon
                                className={`flex-shrink-0 transition-all ${
                                  isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                                } ${
                                  isActive
                                    ? 'text-tppslate'
                                    : 'text-white/60 group-hover:text-white'
                                }`}
                              />
                              {badgeCount > 0 && isCollapsed && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                            {!isCollapsed && (
                              <>
                                <span className="truncate">{item.label}</span>
                                {isNotificationItem && badgeCount > 0 ? (
                                  <div className="ml-auto relative group/notif w-8 h-6 flex items-center justify-center">
                                    {/* Notification Count - Shows by default */}
                                    <span className={`absolute text-sm group-hover/notif:opacity-0 transition-opacity duration-200 ${
                                      isActive ? 'text-tppslate' : 'text-white/95'
                                    }`}>
                                      {badgeCount}
                                    </span>
                                    {/* Mark as Read Button - Shows on hover */}
                                    <button
                                      onClick={markAllAsRead}
                                      disabled={isMarkingRead}
                                      className={`absolute opacity-0 group-hover/notif:opacity-100 p-1 rounded transition-all duration-200 ${
                                        isActive ? 'hover:bg-slate-100' : 'hover:bg-white/20'
                                      } ${
                                        isMarkingRead ? 'cursor-not-allowed' : ''
                                      }`}
                                      title="Mark all as read"
                                    >
                                      <CheckCheck className={`w-4 h-4 transition-colors ${
                                        isActive ? 'text-tppslate hover:text-tppslate/80' : 'text-white/70 hover:text-white'
                                      }`} />
                                    </button>
                                  </div>
                                ) : badgeCount > 0 ? (
                                  <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                                    {badgeCount}
                                  </span>
                                ) : null}
                              </>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="bg-tpppink border-t border-white/10 p-3">
            {/* User Info */}
            <div 
              onClick={isCollapsed ? undefined : toggleUserMenu}
              className={`flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isCollapsed ? 'justify-center px-2' : 'px-3 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <div className={`bg-white rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isCollapsed ? 'w-10 h-10' : 'w-8 h-8'
              }`}>
                <span className={`text-tppslate font-semibold transition-all ${
                  isCollapsed ? 'text-sm' : 'text-xs'
                }`}>
                  {getInitials(admin?.name)}
                </span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-white text-sm font-medium truncate">
                      {admin?.name || 'Admin User'}
                    </p>
                    <p className="text-white/50 text-[10px] truncate capitalize">
                      {admin?.role || 'admin'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </>
              )}
            </div>

            {/* User Menu Dropdown - Only show when not collapsed */}
            {!isCollapsed && showUserMenu && (
              <div className="mt-2 space-y-1 animate-scale-in">
                {/* Profile Button */}
                <button
                  onClick={() => {
                    navigate('/admin/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 bg-white/95 hover:bg-white/70 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
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
            )}

            {/* Collapsed Logout Button */}
            {isCollapsed && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Logout"
                className="w-full mt-2 flex items-center justify-center p-2.5 text-red-300 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <div className="w-5 h-5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}