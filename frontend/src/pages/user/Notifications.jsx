// frontend/src/pages/user/Notifications.jsx

import { useState, useEffect } from 'react';
import { Bell, Package, AlertCircle, CheckCircle, Trash2, CheckCheck, Info } from 'lucide-react';

// ==================== SKELETON COMPONENTS ====================

const NotificationCardSkeleton = () => (
  <div className="border border-tppslate/10 rounded-lg p-3 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 bg-tppslate/10 rounded-full skeleton-shimmer flex-shrink-0 mt-0.5"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-tppslate/10 rounded skeleton-shimmer w-40"></div>
        <div className="h-3 bg-tppslate/10 rounded skeleton-shimmer w-full"></div>
        <div className="h-3 bg-tppslate/10 rounded skeleton-shimmer w-24"></div>
      </div>
      <div className="flex gap-1.5">
        <div className="w-7 h-7 bg-tppslate/10 rounded skeleton-shimmer"></div>
        <div className="w-7 h-7 bg-tppslate/10 rounded skeleton-shimmer"></div>
      </div>
    </div>
  </div>
);

const NotificationsSkeleton = () => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 bg-tppslate/10 rounded skeleton-shimmer w-48"></div>
        <div className="h-4 bg-tppslate/10 rounded skeleton-shimmer w-64"></div>
      </div>
      <div className="h-9 bg-tppslate/10 rounded skeleton-shimmer w-32"></div>
    </div>

    {/* Notifications */}
    <div className="space-y-2">
      <NotificationCardSkeleton />
      <NotificationCardSkeleton />
      <NotificationCardSkeleton />
      <NotificationCardSkeleton />
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #ORD-001 has been delivered successfully!',
      time: '2 hours ago',
      read: false,
      icon: Package,
    },
    {
      id: 2,
      type: 'alert',
      title: 'Special Offer',
      message: 'Get 20% off on all jewelry items this week!',
      time: '1 day ago',
      read: false,
      icon: AlertCircle,
    },
    {
      id: 3,
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #ORD-002 is on its way!',
      time: '3 days ago',
      read: true,
      icon: Package,
    },
    {
      id: 4,
      type: 'success',
      title: 'Payment Confirmed',
      message: 'Payment of ₹2,499 has been confirmed for order #ORD-003',
      time: '5 days ago',
      read: true,
      icon: CheckCircle,
    },
    {
      id: 5,
      type: 'order',
      title: 'Order Placed',
      message: 'Your order #ORD-004 has been placed successfully.',
      time: '1 week ago',
      read: true,
      icon: Package,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type) => {
    const colors = {
      order: 'bg-blue-50/50 border-blue-200/50',
      alert: 'bg-yellow-50/50 border-yellow-200/50',
      success: 'bg-emerald-50/50 border-emerald-200/50',
      error: 'bg-red-50/50 border-red-200/50',
    };
    return colors[type] || 'bg-tppslate/5 border-tppslate/10';
  };

  const getIconColor = (type) => {
    const colors = {
      order: 'text-blue-600',
      alert: 'text-yellow-600',
      success: 'text-emerald-600',
      error: 'text-red-600',
    };
    return colors[type] || 'text-tppslate';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="mb-3">
          <div className="h-6 bg-tppslate/10 rounded skeleton-shimmer w-48 mb-1.5"></div>
          <div className="h-4 bg-tppslate/10 rounded skeleton-shimmer w-64"></div>
        </div>
        <NotificationsSkeleton />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="space-y-4">
        <div className="mb-3">
          <h1 className="text-lg font-bold text-tppslate flex items-center gap-2">
            <Bell className="w-5 h-5 text-tpppink" />
            Notifications
          </h1>
          <p className="text-xs text-tppslate/60 mt-0.5">Stay updated with your orders and offers</p>
        </div>

        <div className="bg-white rounded-lg border border-tppslate/10 p-8 text-center">
          <Bell className="w-12 h-12 text-tppslate/20 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-tppslate mb-1">No notifications</h3>
          <p className="text-xs text-tppslate/60">You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-tppslate flex items-center gap-2">
            <Bell className="w-5 h-5 text-tpppink" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-tpppink text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-tppslate/60 mt-0.5">Stay updated with your orders and offers</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-3 py-1.5 text-xs font-medium text-tpppink hover:bg-tpppeach/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          
          return (
            <div
              key={notification.id}
              className={`border rounded-lg p-3 transition-all ${
                getTypeColor(notification.type)
              } ${
                notification.read 
                  ? 'opacity-60 hover:opacity-80' 
                  : 'shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 mt-0.5 ${getIconColor(notification.type)}`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className={`font-semibold text-tppslate ${
                      !notification.read ? 'text-sm' : 'text-sm'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="flex-shrink-0 w-1.5 h-1.5 bg-tpppink rounded-full mt-1.5" />
                    )}
                  </div>

                  <p className="text-xs text-tppslate/70 mb-1.5 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-tppslate/50">{notification.time}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-2">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-1.5 text-tppslate/60 hover:text-tppslate hover:bg-white/60 rounded transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-1.5 text-red-600/70 hover:text-red-700 hover:bg-white/60 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      {unreadCount > 0 && (
        <div className="p-3 bg-tpppeach/10 border border-tppslate/10 rounded-lg flex items-center gap-2">
          <Info className="w-4 h-4 text-tpppink flex-shrink-0" />
          <p className="text-xs text-tppslate">
            You have <span className="font-semibold">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;