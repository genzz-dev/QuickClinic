import apiService from './apiservice';

/**
 * Notification API Service - All notification-related API calls
 */

/**
 * Get Notifications
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of notifications to fetch (default: 20)
 * @param {number} options.skip - Number of notifications to skip (default: 0)
 * @param {boolean} options.unreadOnly - Fetch only unread notifications (default: false)
 */
export const getNotifications = async (options = {}) => {
  const { limit = 20, skip = 0, unreadOnly = false } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString(),
    unreadOnly: unreadOnly.toString(),
  });

  return await apiService.get(`/notifications?${params.toString()}`);
};

/**
 * Get Unread Notification Count
 */
export const getUnreadCount = async () => {
  return await apiService.get('/notifications/unread-count');
};

/**
 * Mark Notification as Read
 * @param {string} notificationId - The ID of the notification to mark as read
 */
export const markNotificationAsRead = async (notificationId) => {
  return await apiService.patch(
    `/notifications/${notificationId}/read`,
    {},
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

/**
 * Mark All Notifications as Read
 */
export const markAllAsRead = async () => {
  return await apiService.patch(
    '/notifications/read-all',
    {},
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

/**
 * Delete Notification
 * @param {string} notificationId - The ID of the notification to delete
 */
export const deleteNotification = async (notificationId) => {
  return await apiService.delete(`/notifications/${notificationId}`);
};

/**
 * Get Paginated Notifications
 * @param {number} page - Page number (starting from 1)
 * @param {number} pageSize - Number of items per page
 * @param {boolean} unreadOnly - Fetch only unread notifications
 */
export const getPaginatedNotifications = async (page = 1, pageSize = 20, unreadOnly = false) => {
  const skip = (page - 1) * pageSize;
  return await getNotifications({ limit: pageSize, skip, unreadOnly });
};
