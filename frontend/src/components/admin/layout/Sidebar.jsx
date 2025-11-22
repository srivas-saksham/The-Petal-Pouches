// frontend/src/components/admin/layout/Sidebar.jsx

import { 
  Home, 
  Package, 
  FolderTree, 
  Gift, 
  ShoppingCart, 
  Users, 
  Bell, 
  Settings 
} from 'lucide-react';
import NavItem from './NavItem';
import { NAVIGATION_ITEMS, NAVIGATION_SECTIONS } from '../../../utils/constants';

export default function Sidebar({ isOpen, onClose }) {
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
    dashboard: <Home className="w-5 h-5" />,
    product: <Package className="w-5 h-5" />,
    category: <FolderTree className="w-5 h-5" />,
    bundle: <Gift className="w-5 h-5" />,
    order: <ShoppingCart className="w-5 h-5" />,
    customer: <Users className="w-5 h-5" />,
    notification: <Bell className="w-5 h-5" />,
    settings: <Settings className="w-5 h-5" />,
  };

  return (
    <>
      {/* Mobile Overlay - only show on mobile when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Fixed: Removed onClick handler that was blocking navigation */}
      <aside
        className={`
          admin-sidebar fixed lg:sticky top-0 left-0 h-screen
          scrollbar-custom z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white border-opacity-10">
            <div className="w-10 h-10 bg-admin-pink rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">TP</span>
            </div>
            <div className="flex-1">
              <h1 className="text-white font-bold text-lg">The Petal Pouches</h1>
              <p className="text-gray-400 text-xs">Admin Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-custom px-4 py-6">
            <div className="space-y-6">
              {Object.keys(groupedItems).map((section) => (
                <div key={section}>
                  {/* Section Label */}
                  {section !== 'main' && (
                    <div className="px-4 mb-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {NAVIGATION_SECTIONS[section]}
                      </h3>
                    </div>
                  )}

                  {/* Section Items */}
                  <div className="space-y-1">
                    {groupedItems[section].map((item) => (
                      <NavItem
                        key={item.id}
                        item={{
                          ...item,
                          icon: iconMap[item.icon],
                        }}
                        onClick={onClose}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-white border-opacity-10 p-4">
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-white hover:bg-opacity-5 rounded-lg transition-colors cursor-pointer">
              <div className="w-9 h-9 bg-admin-mint rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Admin User</p>
                <p className="text-gray-400 text-xs truncate">admin@petalpouches.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}