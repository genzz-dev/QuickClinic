import { useEffect, useState } from 'react';
import apiService from '../../service/apiservice';

const NotificationPermission = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  // Check if browser supports push notifications
  const checkNotificationSupport = async () => {
    try {
      const supported =
        'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

      console.log('✓ Notification support check:', supported);
      setIsSupported(supported);

      if (supported) {
        // Check current permission status
        checkSubscriptionStatus();
        checkPermissionStatus();
        // Register service worker
        registerServiceWorker();
      } else {
        console.warn('Push notifications not supported in this browser');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking notification support:', error);
      setIsLoading(false);
    }
  };

  // Check current permission status from browser
  const checkPermissionStatus = () => {
    if (Notification.permission === 'default') {
      // User hasn't decided yet - show prompt
      console.log('Notification permission: default (not decided)');
      setShowPrompt(true);
    } else if (Notification.permission === 'denied') {
      console.log('Notification permission: denied');
      setShowPrompt(false);
    } else if (Notification.permission === 'granted') {
      console.log('Notification permission: granted');
      setShowPrompt(false);
    }
  };

  // Check if user already has active subscription
  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        setIsSubscribed(true);
        console.log('✓ Already subscribed to push notifications');
      } else {
        setIsSubscribed(false);
        console.log('Not subscribed yet');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register service worker
  const registerServiceWorker = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers not supported');
        return;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('✓ Service Worker registered:', registration.scope);

      // Listen for messages from service worker
      navigator.serviceWorker.onmessage = (event) => {
        console.log('Message from Service Worker:', event.data);
      };
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  // Request notification permission and subscribe
  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated FIRST
      const token = localStorage.getItem('accessToken');
      console.log('Token found:', !!token);

      if (!token) {
        setError('❌ Please login first before enabling notifications');
        setIsLoading(false);
        return;
      }

      // Step 1: Request permission from browser
      console.log('Requesting browser notification permission...');
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setError('❌ Notification permission denied. You can enable it in browser settings.');
        console.log('Permission result:', permission);
        setIsLoading(false);
        setShowPrompt(false);
        return;
      }

      console.log('✓ Browser notification permission granted');

      // Step 2: Get service worker
      console.log('Getting service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('✓ Service worker ready');

      // Step 3: Get VAPID public key from server
      console.log('Fetching VAPID public key from server...');
      const keyResponse = await apiService.get('/push-notifications/public-key');

      if (!keyResponse.success || !keyResponse.publicKey) {
        throw new Error('Server did not provide VAPID public key');
      }

      console.log('✓ Got VAPID public key from server');

      // Step 4: Subscribe to push notifications
      console.log('Subscribing to push notifications...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyResponse.publicKey),
      });

      console.log('✓ Subscribed to push manager');

      // Step 5: Send subscription to server
      const subscriptionJson = subscription.toJSON();
      console.log('Sending subscription to server:', subscriptionJson);

      const saveResponse = await apiService.post('/push-notifications/subscribe', {
        subscription: subscriptionJson,
      });

      if (!saveResponse.success) {
        throw new Error(saveResponse.message || 'Failed to save subscription');
      }

      console.log('✓ Subscription saved to server');

      setIsSubscribed(true);
      setShowPrompt(false);
      setError(null);
      alert('✓ Notifications enabled! You will now receive notifications.');
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setError(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Disable notifications
  const handleDisableNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('❌ Please login first');
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('✓ Unsubscribed from push notifications');
      }

      // Notify server
      await apiService.post('/push-notifications/unsubscribe', {});

      setIsSubscribed(false);
      setError(null);
      alert('✓ Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setError(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function: Convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  if (!isSupported) {
    return (
      <div className="alert alert-warning" role="alert">
        <strong>⚠️ Browser Limitation:</strong> Push notifications are not supported in your
        browser. Please use Chrome, Firefox, or Edge.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex align-items-center">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <span>Loading notification settings...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Error messages */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Automatic prompt if permission not decided */}
      {showPrompt && (
        <div className="alert alert-info" role="alert">
          <strong>🔔 Enable Notifications:</strong> Get real-time updates about your appointments
          and prescriptions.
          <div className="mt-3">
            <button
              className="btn btn-sm btn-primary"
              onClick={handleEnableNotifications}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Setting up...
                </>
              ) : (
                'Enable Now'
              )}
            </button>
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => setShowPrompt(false)}
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Manual toggle button */}
      {!showPrompt && (
        <div className="notification-settings">
          {isSubscribed ? (
            <div
              className="alert alert-success d-flex align-items-center justify-content-between"
              role="alert"
            >
              <span>✓ Notifications enabled - You will receive real-time updates</span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={handleDisableNotifications}
                disabled={isLoading}
              >
                {isLoading ? 'Disabling...' : 'Disable'}
              </button>
            </div>
          ) : (
            <div
              className="alert alert-secondary d-flex align-items-center justify-content-between"
              role="alert"
            >
              <span>Notifications disabled</span>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleEnableNotifications}
                disabled={isLoading}
              >
                {isLoading ? 'Enabling...' : 'Enable'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPermission;
