import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.muzikax.app',
  appName: 'MuzikaX',
  webDir: 'out',
  server: {
    // For development with live reload - ENABLED
    url: 'http://localhost:3000',
    // Clear text traffic allowed (for development only)
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      spinnerColor: '#FF4D67',
      splashImmersive: true
    },
    Keyboard: {
      // @ts-ignore - Keyboard resize mode
      resize: 'body',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
