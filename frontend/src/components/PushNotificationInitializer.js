'use client';

import { useEffect } from 'react';
import pushNotificationService from '../services/pushNotificationService';

const PushNotificationInitializer = () => {
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        // VAPID public key (should be moved to environment variables in production)
        const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY_HERE';
        
        if (VAPID_PUBLIC_KEY && VAPID_PUBLIC_KEY !== 'YOUR_VAPID_PUBLIC_KEY_HERE') {
          const isInitialized = await pushNotificationService.initialize(VAPID_PUBLIC_KEY);
          if (isInitialized) {
            console.log('Push notifications initialized successfully');
          }
        } else {
          console.log('VAPID public key not configured - push notifications disabled');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    // Only initialize if we're in a browser environment and user is logged in
    if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
      initializePushNotifications();
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PushNotificationInitializer;