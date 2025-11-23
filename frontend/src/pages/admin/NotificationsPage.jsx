// frontend/src/pages/admin/Notifications.jsx

import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  Trash2,
  X
} from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${API_URL}/api/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || mockNotifications);
      } else {
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  // Mock notifications for demo
  const mockNotifications = [
    {
      id: 1,
      type: 'order',
      title: 'New order received',
      message: 'Order #ORD-001 has been placed by John Doe',
      time: '5 minutes ago',
      unread: true,
      icon: ShoppingCart,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      id: 2,
      type: 'stock',
      title: 'Low stock alert',
      message: 'Teddy Bear is running low on stock (5 units remaining)',
      time: '1 hour ago',
      unread: true,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      id: 3,
      type: 'customer',
      title: 'New customer registered',
      message: 'Jane Smith has created a new account',
      time: '2 hours ago',
      unread: false,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: 4,
      type: 'product',
      title: 'Product out of stock',
      message: 'Pink Pouch - Medium is now out of stock',
      time: '3 hours ago',
      unread: false,
      icon: Package,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      id: 5,
      type: 'order',
      title: 'Order shipped',
      message: 'Order #ORD-002 has been shipped to the customer',
      time: '5 hours ago',
      unread: false,
      icon: ShoppingCart,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.unread;
    if (filter === 'read') return !n.unread;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />

      {/* Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg border-2 border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-tppslate text-white'
                : 'bg-white text-tppslate border-2 border-slate-200 hover:border-tppslate'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'unread'
                ? 'bg-tppslate text-white'
                : 'bg-white text-tppslate border-2 border-slate-200 hover:border-tppslate'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'read'
                ? 'bg-tppslate text-white'
                : 'bg-white text-tppslate border-2 border-slate-200 hover:border-tppslate'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-tppmint text-tppslate rounded-lg text-sm font-medium hover:bg-tppmint/80 transition-all duration-200 border-2 border-transparent hover:border-tppslate"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border-2 border-slate-200 p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-tppslate mb-2">No notifications</h3>
          <p className="text-sm text-tppslate/60">
            {filter === 'unread' 
              ? "You're all caught up! No unread notifications."
              : filter === 'read'
              ? "No read notifications yet."
              : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-sm cursor-pointer ${
                  notification.unread
                    ? 'border-tppslate bg-tpppeach/10'
                    : 'border-slate-200 hover:border-tppslate'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 ${notification.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${notification.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-tppslate">
                        {notification.title}
                        {notification.unread && (
                          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-tppslate/50 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-tppslate/70 mb-2">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {notification.unread && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-tppslate bg-tppmint/20 hover:bg-tppmint/40 rounded-lg transition-all duration-200"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}