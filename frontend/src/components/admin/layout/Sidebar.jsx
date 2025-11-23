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
  CheckCheck
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, NAVIGATION_SECTIONS } from '../../../utils/constants';

export default function Sidebar({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  
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
          <div className={`flex items-center gap-3 border-b border-white/10 transition-all ${isCollapsed ? 'justify-center px-3 py-6' : 'px-5 py-5'}`}>
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
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
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
                                    <span className="absolute text-red-500 text-sm font-bold group-hover/notif:opacity-0 transition-opacity duration-200">
                                      {badgeCount}
                                    </span>
                                    {/* Mark as Read Button - Shows on hover */}
                                    <button
                                      onClick={markAllAsRead}
                                      disabled={isMarkingRead}
                                      className={`absolute opacity-0 group-hover/notif:opacity-100 p-1 hover:bg-white/20 rounded transition-all duration-200 ${
                                        isMarkingRead ? 'cursor-not-allowed' : ''
                                      }`}
                                      title="Mark all as read"
                                    >
                                      <CheckCheck className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
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

          {/* User Profile */}
          <div className="border-t border-white/10 p-3">
            <div className={`flex items-center gap-3 py-2.5 hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer group ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}>
              <div className={`bg-white rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'}`}>
                <span className={`text-tppslate font-semibold transition-all ${isCollapsed ? 'text-sm' : 'text-xs'}`}>AD</span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">Admin</p>
                  <p className="text-white/50 text-[10px] truncate">admin@tpp.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}