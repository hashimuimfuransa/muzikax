/**
 * Capacitor Native Features Utility
 * Provides access to native device APIs through Capacitor
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';

// Check if running in Capacitor environment
export const isNative = (): boolean => {
  return !!(window as any).capacitor;
};

// Camera Functions
export const takePhoto = async (): Promise<string | null> => {
  try {
    if (!isNative()) {
      console.warn('Camera only available in native environment');
      return null;
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      saveToGallery: true,
    });

    return image.webPath || null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    if (!isNative()) {
      console.warn('Gallery only available in native environment');
      return null;
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    return image.webPath || null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

// Share Function
export const shareContent = async (options: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<void> => {
  try {
    await Share.share({
      title: options.title || 'MuzikaX',
      text: options.text || 'Check out MuzikaX!',
      url: options.url || 'https://www.muzikax.com/',
      dialogTitle: 'Share via',
    });
  } catch (error) {
    console.error('Error sharing:', error);
    throw error;
  }
};

// Push Notifications
export const initPushNotifications = async (): Promise<void> => {
  try {
    if (!isNative()) {
      console.log('Push notifications only available in native environment');
      return;
    }

    // Request permission
    await PushNotifications.requestPermissions();

    // Register for push notifications
    await PushNotifications.register();

    // Listen for registration
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      // Save this token to your backend for sending push notifications
    });

    // Listen for push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    // Listen for push notification tapped
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      // Handle navigation based on notification data
    });

  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};

// Haptic Feedback
export const hapticSelection = async (): Promise<void> => {
  try {
    if (!isNative()) return;
    // @ts-ignore - Capacitor haptics selection
    await Haptics.selection();
  } catch (error) {
    console.error('Error with haptic selection:', error);
  }
};

export const hapticLight = async (): Promise<void> => {
  try {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    console.error('Error with haptic light:', error);
  }
};

export const hapticMedium = async (): Promise<void> => {
  try {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.error('Error with haptic medium:', error);
  }
};

export const hapticHeavy = async (): Promise<void> => {
  try {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    console.error('Error with haptic heavy:', error);
  }
};

// Device Information
export const getDeviceInfo = async (): Promise<{
  platform: string;
  model: string;
  osVersion: string;
  manufacturer: string;
}> => {
  try {
    const info = await Device.getInfo();
    return {
      platform: info.platform,
      model: info.model,
      osVersion: info.osVersion || '',
      manufacturer: info.manufacturer || '',
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      platform: 'web',
      model: 'Unknown',
      osVersion: '',
      manufacturer: '',
    };
  }
};

// Battery Status (if available)
export const getBatteryStatus = async (): Promise<number> => {
  try {
    const battery = await Device.getBatteryInfo();
    return battery.batteryLevel || -1;
  } catch (error) {
    console.error('Error getting battery status:', error);
    return -1;
  }
};
