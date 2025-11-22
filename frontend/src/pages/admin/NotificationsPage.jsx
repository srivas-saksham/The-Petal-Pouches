// frontend/src/pages/admin/NotificationsPage.jsx

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Archive, Mail, MailOpen } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import Button from '../../components/admin/ui/Button';
import { formatDate, getRelativeTime } from '../../utils/adminHelpers';
import { mockNotifications } from '../../utils/mockData';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this notification?')) return;
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      order: '🛒',
      product: '📦',
      customer: '👤',
      system: '⚙️',
      alert: '⚠️',
    };
    return iconMap[type] || '🔔';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Notifications"
        description="Stay updated with important events"
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              icon={<Check className="w-5 h-5" />}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )
        }
      />

      {/* Stats Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-text-primary">
              {unreadCount}
            </h3>
            <p className="text-text-secondary text-sm">Unread Notifications</p>
          </div>
          <div className="w-12 h-12 bg-admin-pink bg-opacity-10 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-admin-pink" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${filter === 'all'
                ? 'bg-admin-pink text-white'
                : 'text-text-secondary hover:bg-surface'
              }
            `}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${filter === 'unread'
                ? 'bg-admin-pink text-white'
                : 'text-text-secondary hover:bg-surface'
              }
            `}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${filter === 'read'
                ? 'bg-admin-pink text-white'
                : 'text-text-secondary hover:bg-surface'
              }
            `}
          >
            Read ({notifications.length - unreadCount})
          </button>
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
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </h3>
          <p className="text-text-secondary text-sm">
            {filter === 'unread'
              ? 'You have no unread notifications'
              : 'No notifications to display'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`
                card p-4 transition-all animate-fade-in
                ${notif.read ? 'bg-white' : 'bg-admin-peach bg-opacity-30 border-l-4 border-admin-pink'}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 text-2xl">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">
                        {notif.title}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-text-muted mt-2">
                        {getRelativeTime(notif.time)} • {formatDate(notif.time, 'full')}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notif.read && (
                      <div className="w-2 h-2 bg-admin-pink rounded-full mt-2"></div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-2 hover:bg-surface rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <MailOpen className="w-4 h-4 text-text-secondary" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}