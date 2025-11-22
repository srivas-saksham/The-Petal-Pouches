// frontend/src/pages/admin/NotificationsPage.jsx

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle,
  Trash2,
  Check,
  Filter
} from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';
import { formatDate, getRelativeTime } from '../../utils/adminHelpers';

// Import services
import { getProducts } from '../../services/productService';
import { getOrders } from '../../services/orderService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, orders, inventory, system

  useEffect(() => {
    generateNotifications();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredNotifications(notifications);
    } else if (filter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.read));
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === filter));
    }
  }, [filter, notifications]);

  const generateNotifications = async () => {
    setLoading(true);
    const generatedNotifications = [];

    try {
      // Fetch products for inventory alerts
      const productsResult = await getProducts({ limit: 1000 });
      if (productsResult.success) {
        const products = productsResult.data.data || [];
        
        // Low stock notifications
        products
          .filter(p => p.stock > 0 && p.stock <= 10)
          .forEach(product => {
            generatedNotifications.push({
              id: `low-stock-${product.id}`,
              type: 'inventory',
              title: 'Low Stock Alert',
              message: `${product.title} has only ${product.stock} units left`,
              icon: AlertTriangle,
              iconColor: 'text-yellow-500',
              bgColor: 'bg-yellow-50',
              timestamp: new Date().toISOString(),
              read: false,
              link: '/admin/products',
            });
          });

        // Out of stock notifications
        products
          .filter(p => p.stock === 0)
          .forEach(product => {
            generatedNotifications.push({
              id: `out-stock-${product.id}`,
              type: 'inventory',
              title: 'Out of Stock',
              message: `${product.title} is out of stock`,
              icon: Package,
              iconColor: 'text-red-500',
              bgColor: 'bg-red-50',
              timestamp: new Date().toISOString(),
              read: false,
              link: '/admin/products',
            });
          });
      }

      // Fetch recent orders for order notifications
      const ordersResult = await getOrders({ limit: 20 });
      if (ordersResult.success) {
        const orders = ordersResult.data.data || [];
        
        // Pending orders
        orders
          .filter(o => o.status === 'pending')
          .slice(0, 5)
          .forEach(order => {
            generatedNotifications.push({
              id: `pending-order-${order.id}`,
              type: 'orders',
              title: 'New Order Pending',
              message: `Order from ${order.customer_name || 'Guest'} needs processing`,
              icon: ShoppingCart,
              iconColor: 'text-blue-500',
              bgColor: 'bg-blue-50',
              timestamp: order.created_at,
              read: false,
              link: '/admin/orders',
            });
          });

        // Recent completed orders
        orders
          .filter(o => o.status === 'delivered')
          .slice(0, 3)
          .forEach(order => {
            generatedNotifications.push({
              id: `delivered-${order.id}`,
              type: 'orders',
              title: 'Order Delivered',
              message: `Order to ${order.customer_name || 'Guest'} was delivered`,
              icon: CheckCircle,
              iconColor: 'text-green-500',
              bgColor: 'bg-green-50',
              timestamp: order.updated_at || order.created_at,
              read: true,
              link: '/admin/orders',
            });
          });
      }

      // System notifications (static for now)
      generatedNotifications.push({
        id: 'system-welcome',
        type: 'system',
        title: 'Welcome to Admin Dashboard',
        message: 'Your new admin dashboard is ready. Explore all features!',
        icon: Bell,
        iconColor: 'text-admin-pink',
        bgColor: 'bg-admin-peach',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: true,
        link: '/admin',
      });

      // Sort by timestamp (newest first)
      generatedNotifications.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotifications(generatedNotifications);
      setFilteredNotifications(generatedNotifications);
    } catch (err) {
      console.error('Failed to generate notifications:', err);
    }

    setLoading(false);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleClearAll = () => {
    if (confirm('Clear all notifications? This cannot be undone.')) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'orders', label: 'Orders', count: notifications.filter(n => n.type === 'orders').length },
    { value: 'inventory', label: 'Inventory', count: notifications.filter(n => n.type === 'inventory').length },
    { value: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === option.value
                  ? 'bg-admin-pink text-white'
                  : 'bg-surface text-text-secondary hover:bg-admin-grey'
                }
              `}
            >
              {option.label}
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${filter === option.value
                  ? 'bg-white/20 text-white'
                  : 'bg-admin-grey text-text-muted'
                }
              `}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-pink mx-auto"></div>
          <p className="text-text-muted mt-4">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Bell className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No notifications
          </h3>
          <p className="text-text-secondary text-sm">
            {filter !== 'all' 
              ? 'No notifications in this category' 
              : 'You\'re all caught up!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            
            return (
              <div
                key={notification.id}
                className={`
                  card p-4 transition-all animate-fade-in
                  ${!notification.read ? 'border-l-4 border-l-admin-pink' : ''}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${notification.bgColor}
                  `}>
                    <Icon className={`w-5 h-5 ${notification.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className={`
                          font-semibold text-text-primary
                          ${!notification.read ? 'font-bold' : ''}
                        `}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-text-secondary mt-1">
                          {notification.message}
                        </p>
                        <div className="text-xs text-text-muted mt-2">
                          {getRelativeTime(notification.timestamp)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-admin-pink hover:bg-admin-peach rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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