"use client";

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed or in native app
    const isNative = Capacitor.isNativePlatform();
    const isStandalone = typeof window !== 'undefined' && 
                        window.matchMedia('(display-mode: standalone)').matches;
    
    if (isNative || isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user has been prompted before
    const hasBeenPrompted = localStorage.getItem('pwaInstallPrompted');
    const lastPromptDate = localStorage.getItem('pwaInstallPromptDate');
    
    // Don't show if prompted in the last 7 days
    if (hasBeenPrompted && lastPromptDate) {
      const daysSincePrompt = (Date.now() - parseInt(lastPromptDate)) / (1000 * 60 * 60 * 24);
      if (daysSincePrompt < 7) {
        return;
      }
    }

    const handler = (e: Event) => {
      const beforeInstallPromptEvent = e as any;
      // Prevent the mini-infobar from appearing on mobile
      beforeInstallPromptEvent.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(beforeInstallPromptEvent);
      // Show the install prompt after 30 seconds
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000);
      console.log('PWA install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handler as any);

    // Check if installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      localStorage.removeItem('pwaInstallPrompted');
      localStorage.removeItem('pwaInstallPromptDate');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any);
    };
  }, []);

  const installApp = () => {
    if (!deferredPrompt) {
      console.warn('Install prompt is not available');
      return;
    }

    // Log that we've prompted the user
    localStorage.setItem('pwaInstallPrompted', 'true');
    localStorage.setItem('pwaInstallPromptDate', Date.now().toString());

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsInstalled(true);
        } else {
          console.log('User dismissed the install prompt');
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
        // Hide the install prompt
        setShowInstallPrompt(false);
      });
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const closePrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwaInstallPrompted', 'true');
    localStorage.setItem('pwaInstallPromptDate', Date.now().toString());
  };

  if (!showInstallPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9998] animate-bounce-in">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-pink-500/30 rounded-2xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-black shadow-lg">
            <img src="/app.png" alt="MuzikaX" className="w-full h-full object-cover rounded-xl" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg mb-1">
              Install MuzikaX
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Get the full app experience with offline mode, faster loading, and more!
            </p>
            
            {/* Features */}
            <ul className="text-xs text-gray-400 space-y-1 mb-3">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Play music offline
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Instant loading
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Native app feel
              </li>
            </ul>
            
            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={installApp}
                className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-pink-600 hover:to-red-600 transition-all"
              >
                Install Now
              </button>
              <button
                onClick={closePrompt}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={closePrompt}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;