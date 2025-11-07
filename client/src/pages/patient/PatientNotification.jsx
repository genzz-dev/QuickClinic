import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../service/notificationApiService';
import {
  Bell,
  Calendar,
  FileText,
  XCircle,
  CheckCircle,
  Trash2,
  CheckCheck,
  Filter,
  Loader,
} from 'lucide-react';

const PatientNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications({
        limit: 50,
        skip: 0,
        unreadOnly: filter === 'unread',
      });

      if (response.success) {
        setNotifications(response.notifications || []);
        setTotalCount(response.total || 0);
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      }

      // Redirect based on notification type
      if (notification.relatedId && notification.relatedModel) {
        switch (notification.relatedModel) {
          case 'Appointment':
            navigate(`/patient/appointment/${notification.relatedId._id}`);
            break;
          case 'Prescription':
            navigate(`/patient/appointment/${notification.relatedId.appointmentId}`);
            break;
          default:
            break;
        }
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_reminder':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'appointment_status_change':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'appointment_cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'prescription_added':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return notifDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: notifDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className=" bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black">Notifications</h1>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <button
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                {filter === 'all' ? 'All' : 'Unread'}
              </button>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                  notification.isRead
                    ? 'bg-white border-gray-200 hover:border-gray-300'
                    : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.isRead ? 'bg-gray-100' : 'bg-white'
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-semibold mb-1 ${
                          notification.isRead ? 'text-gray-900' : 'text-black'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-all"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Load More (Optional) */}
        {totalCount > notifications.length && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientNotifications;
