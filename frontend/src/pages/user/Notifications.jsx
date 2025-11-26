// frontend/src/pages/user/Notifications.jsx

import React, { useState } from 'react';
import { Bell, Package, AlertCircle, CheckCircle, Trash2, CheckCheck } from 'lucide-react';

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
  ]);

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
      order: 'bg-blue-50 border-blue-200',
      alert: 'bg-yellow-50 border-yellow-200',
      success: 'bg-emerald-50 border-emerald-200',
      error: 'bg-red-50 border-red-200',
    };
    return colors[type] || 'bg-slate-50 border-slate-200';
  };

  const getIconColor = (type) => {
    const colors = {
      order: 'text-blue-600',
      alert: 'text-yellow-600',
      success: 'text-emerald-600',
      error: 'text-red-600',
    };
    return colors[type] || 'text-slate-600';
  };

  if (notifications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-tppslate flex items-center gap-2 mb-2">
            <Bell className="w-8 h-8 text-tpppink" />
            Notifications
          </h1>
          <p className="text-tppslate/70">Stay updated with your orders and offers</p>
        </div>

        <div className="bg-white rounded-lg border-2 border-tppslate/10 p-12 text-center">
          <Bell className="w-16 h-16 text-tppslate/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-tppslate mb-2">No notifications</h3>
          <p className="text-tppslate/60">You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tppslate flex items-center gap-2 mb-2">
            <Bell className="w-8 h-8 text-tpppink" />
            Notifications
          </h1>
          <p className="text-tppslate/70">Stay updated with your orders and offers</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm font-medium text-tpppink hover:bg-tpppeach/20 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          
          return (
            <div
              key={notification.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                getTypeColor(notification.type)
              } ${notification.read ? 'opacity-75' : 'shadow-md'}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 mt-1 ${getIconColor(notification.type)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold text-tppslate ${!notification.read ? 'text-lg' : 'text-base'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="flex-shrink-0 w-2 h-2 bg-tpppink rounded-full mt-2" />
                    )}
                  </div>

                  <p className="text-sm text-tppslate/70 mb-2">{notification.message}</p>
                  <p className="text-xs text-tppslate/50">{notification.time}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-tppslate/60 hover:text-tppslate hover:bg-white/50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-white/50 rounded-lg transition-colors"
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

      {/* Info */}
      {unreadCount > 0 && (
        <div className="p-4 bg-tpppeach/20 border-2 border-tppslate/10 rounded-lg">
          <p className="text-sm text-tppslate">
            You have <span className="font-semibold">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;