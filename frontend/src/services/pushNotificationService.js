class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.registration = null;
    this.subscription = null;
  }

  // Check if push notifications are supported
  isPushSupported() {
    return this.isSupported;
  }

  // Register service worker
  async registerServiceWorker() {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported in this browser');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw-muzikax.js');
      console.log('Service Worker registered:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Request permission for push notifications
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(vapidPublicKey) {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for push notifications');
      }

      // Convert VAPID key from base64 URL to Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('Push subscription successful:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/push-notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      const result = await response.json();
      console.log('Subscription saved on server:', result);
      return result;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    if (!this.subscription) {
      // Get current subscription
      if (!this.registration) {
        await this.registerServiceWorker();
      }
      this.subscription = await this.registration.pushManager.getSubscription();
    }

    if (this.subscription) {
      try {
        // Remove from server
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/push-notifications/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            endpoint: this.subscription.endpoint
          })
        });

        // Unsubscribe locally
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('Successfully unsubscribed from push notifications');
      } catch (error) {
        console.error('Error unsubscribing:', error);
        throw error;
      }
    }
  }

  // Get current subscription
  async getCurrentSubscription() {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  // Check if user is subscribed
  async isSubscribed() {
    const subscription = await this.getCurrentSubscription();
    return !!subscription;
  }

  // Initialize push notifications
  async initialize(vapidPublicKey) {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Check if already subscribed
      const existingSubscription = await this.getCurrentSubscription();
      
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        this.subscription = existingSubscription;
        return true;
      }

      // Check permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Push notification permission not granted');
        return false;
      }

      // Subscribe to push
      const subscription = await this.subscribeToPush(vapidPublicKey);
      
      // Send to server
      await this.sendSubscriptionToServer(subscription);
      
      console.log('Push notifications initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Helper function to convert base64 URL to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get user's subscriptions from server
  async getUserSubscriptions() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/push-notifications/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const result = await response.json();
      return result.subscriptions;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  }
}

const pushNotificationService = new PushNotificationService();
export default pushNotificationService;