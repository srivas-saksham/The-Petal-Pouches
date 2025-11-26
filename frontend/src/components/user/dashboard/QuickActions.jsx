// frontend/src/components/user/dashboard/QuickActions.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Truck, 
  ShoppingBag, 
  Heart,
  CreditCard,
  User,
  Settings
} from 'lucide-react';

/**
 * QuickActions Component
 * Display action cards for quick navigation to common tasks
 * 
 * @param {Object} stats - Statistics object with counts
 * @param {number} stats.pendingOrders - Number of pending orders
 * @param {number} stats.addresses - Number of saved addresses
 * @param {number} stats.wishlistItems - Number of wishlist items
 */
const QuickActions = ({ stats = {} }) => {
  const actions = [
    {
      id: 'orders',
      title: 'My Orders',
      description: 'View and track your orders',
      icon: Package,
      color: 'pink',
      link: '/user/orders',
      badge: stats.pendingOrders || null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'addresses',
      title: 'Addresses',
      description: 'Manage delivery addresses',
      icon: MapPin,
      color: 'blue',
      link: '/user/addresses',
      badge: stats.addresses || null,
      badgeColor: 'bg-slate-500'
    },
    {
      id: 'track',
      title: 'Track Order',
      description: 'Track your shipments',
      icon: Truck,
      color: 'purple',
      link: '/user/orders?filter=shipped',
      badge: null,
      badgeColor: null
    },
    {
      id: 'products',
      title: 'Browse Products',
      description: 'Explore our collection',
      icon: ShoppingBag,
      color: 'mint',
      link: '/products',
      badge: null,
      badgeColor: null
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      description: 'Your saved items',
      icon: Heart,
      color: 'pink',
      link: '/user/wishlist',
      badge: stats.wishlistItems || null,
      badgeColor: 'bg-pink-500'
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'Update account details',
      icon: User,
      color: 'slate',
      link: '/user/profile',
      badge: null,
      badgeColor: null
    }
  ];

  const colorClasses = {
    pink: {
      bg: 'bg-pink-50',
      icon: 'text-pink-500',
      hover: 'hover:bg-pink-100',
      border: 'border-pink-200'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-500',
      hover: 'hover:bg-blue-100',
      border: 'border-blue-200'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-500',
      hover: 'hover:bg-purple-100',
      border: 'border-purple-200'
    },
    mint: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-500',
      hover: 'hover:bg-emerald-100',
      border: 'border-emerald-200'
    },
    slate: {
      bg: 'bg-slate-50',
      icon: 'text-slate-500',
      hover: 'hover:bg-slate-100',
      border: 'border-slate-200'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-500',
      hover: 'hover:bg-amber-100',
      border: 'border-amber-200'
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const colors = colorClasses[action.color];
          const Icon = action.icon;

          return (
            <Link
              key={action.id}
              to={action.link}
              className={`relative group border ${colors.border} rounded-lg p-4 transition-all duration-200 ${colors.bg} ${colors.hover} hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ${colors.icon} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                    {action.title}
                    {action.badge && (
                      <span className={`text-xs font-bold text-white ${action.badgeColor} px-2 py-0.5 rounded-full`}>
                        {action.badge}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Arrow indicator on hover */}
              <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${colors.icon}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Simplified QuickActionsGrid for compact layouts
 */
export const QuickActionsGrid = ({ actions = [] }) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.id}
          to={action.link}
          className="group bg-white border border-slate-200 rounded-lg p-4 hover:border-pink-200 hover:shadow-sm transition-all duration-200 text-center"
        >
          <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-100 transition-colors">
            <action.icon className="w-6 h-6 text-pink-500" />
          </div>
          <p className="text-sm font-medium text-slate-900 group-hover:text-pink-500 transition-colors">
            {action.title}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;