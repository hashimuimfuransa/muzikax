'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';

export default function AppLauncher() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if running in Capacitor native app
    const isNative = typeof window !== 'undefined' && 
                     (window as any).capacitor?.isNative === true;

    // Also show for PWA that's been installed to home screen
    const isPWA = typeof window !== 'undefined' && 
                  window.matchMedia('(display-mode: standalone)').matches;

    if (!isNative && !isPWA) {
      setIsVisible(false);
      return;
    }

    // Play animation sequence
    const playAnimation = async () => {
      setIsAnimating(true);
      
      // Wait for initial render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Scale up animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fade out
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsAnimating(false);
      setIsVisible(false);
      
      // Hide native splash screen if Capacitor
      if (isNative) {
        try {
          await CapacitorSplashScreen.hide();
        } catch (error) {
          console.log('Error hiding splash screen:', error);
        }
      }
    };

    playAnimation();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Pulsing Glow Effect */}
      <div className={`absolute w-80 h-80 rounded-full bg-gradient-to-r from-pink-500/30 to-red-500/30 blur-3xl transition-all duration-1000 ${
        isAnimating ? 'scale-150 opacity-50' : 'scale-100 opacity-30'
      }`} />
      
      {/* Main App Icon with Animation - INCREASED SIZE */}
      <div className={`relative z-10 transition-all duration-700 ease-out ${
        isAnimating ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <div className="relative w-48 h-48 md:w-64 md:h-64 animate-pulse-slow rounded-3xl overflow-hidden">
          <Image
            src="/app.png"
            alt="MuzikaX"
            fill
            className="object-contain drop-shadow-2xl rounded-3xl"
            priority
          />
        </div>
        
        {/* Loading Spinner Below Icon */}
        <div className="mt-8 flex justify-center">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-pink-500 border-r-pink-500 rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* App Name */}
        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-white tracking-wider text-center">
          MUZIKAX
        </h1>
        <p className="mt-2 text-base md:text-lg text-gray-400">
          Rwanda&apos;s Digital Music Ecosystem
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-72 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-1000 ease-out ${
          isAnimating ? 'w-full opacity-0' : 'w-full opacity-100'
        }`} />
      </div>
    </div>
  );
}
