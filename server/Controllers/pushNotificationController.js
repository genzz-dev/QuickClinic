import pushNotificationService from '../services/pushNotificationService.js';

/**
 * Subscribe to push notifications
 */
export const subscribeToNotifications = async (req, res) => {
  try {
    const { profileId } = req.user; // Patient's profile ID
    const { subscription } = req.body;
    const userAgent = req.get('user-agent');

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data',
      });
    }

    const pushSubscription = await pushNotificationService.saveSubscription(
      profileId,
      req.user.userId,
      subscription,
      userAgent
    );

    res.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
      subscription: pushSubscription,
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to push notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get VAPID public key
 */
export const getPublicKey = (req, res) => {
  try {
    const publicKey = pushNotificationService.getPublicKey();

    if (!publicKey) {
      return res.status(500).json({
        success: false,
        message: 'Push notifications not configured',
      });
    }

    res.json({
      success: true,
      publicKey,
    });
  } catch (error) {
    console.error('Error getting public key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get public key',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromNotifications = async (req, res) => {
  try {
    const { profileId } = req.user;

    await pushNotificationService.removeSubscription(profileId);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications',
    });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from push notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Test push notification (for testing only)
 */
export const testPushNotification = async (req, res) => {
  try {
    const { profileId } = req.user;

    await pushNotificationService.sendNotificationToPatient(profileId, {
      title: 'Test Notification',
      message: 'This is a test push notification',
      type: 'test',
      icon: '/logo-192x192.png',
    });

    res.json({
      success: true,
      message: 'Test notification sent',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
