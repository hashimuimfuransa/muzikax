'use client';

import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Device } from '@capacitor/device';

export default function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const [isCapacitorReady, setIsCapacitorReady] = useState(false);

  useEffect(() => {
    // Check if running in Capacitor
    const checkCapacitor = async () => {
      try {
        // Check if we're running on a native platform
        const deviceInfo = await Device.getInfo();
        const isNative = !!(window as any).capacitor;
        
        if (isNative) {
          console.log('Running in native Capacitor environment');
          
          // Initialize StatusBar
          try {
            await StatusBar.setStyle({ style: Style.Dark });
            await StatusBar.setBackgroundColor({ color: '#000000' });
            console.log('StatusBar initialized');
          } catch (err) {
            console.warn('StatusBar not available:', err);
          }

          // Configure Keyboard behavior
          try {
            // @ts-ignore - Capacitor keyboard mode
            await Keyboard.setResizeMode({ mode: 'body' });
            console.log('Keyboard configured');
          } catch (err) {
            console.warn('Keyboard not available:', err);
          }

          // Handle back button (Android)
          try {
            App.addListener('backButton', ({ canGoBack }) => {
              if (canGoBack) {
                window.history.back();
              } else {
                // Exit app - use Capacitor's App method
                App.exitApp();
              }
            });
            console.log('Back button listener added');
          } catch (err) {
            console.warn('Back button listener failed:', err);
          }

          // Handle app state changes
          try {
            App.addListener('appStateChange', ({ isActive }) => {
              if (isActive) {
                console.log('App resumed');
              } else {
                console.log('App paused');
              }
            });
          } catch (err) {
            console.warn('App state listener failed:', err);
          }

          // Hide splash screen after delay
          setTimeout(async () => {
            try {
              await SplashScreen.hide();
              console.log('Splash screen hidden');
            } catch (err) {
              console.warn('Failed to hide splash screen:', err);
            }
          }, 2000);

          setIsCapacitorReady(true);
        } else {
          console.log('Running in web browser');
          // Still hide splash screen for web testing
          setTimeout(() => {
            SplashScreen.hide().catch(() => {});
          }, 1000);
          setIsCapacitorReady(true);
        }
      } catch (error) {
        console.log('Capacitor not available, running in web:', error);
        setIsCapacitorReady(true);
      }
    };

    checkCapacitor();
  }, []);

  if (!isCapacitorReady) {
    return null;
  }

  return <>{children}</>;
}
