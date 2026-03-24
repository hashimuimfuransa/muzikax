'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { offlineCacheService, OfflineData } from '@/services/offlineCacheService';
import { dataPreloaderService, PreloadedData } from '@/services/dataPreloader';

export default function Loading() {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'offline'>('fast');
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [hasCachedContent, setHasCachedContent] = useState(false);
  const [preloadData, setPreloadData] = useState<PreloadedData | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  const loadingMessages = [
    'Loading your music experience...',
    'Discover unique African sounds',
    'Connect with your favorite artists',
    'Stream unlimited music',
    'Explore charts and trending tracks',
  ];

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check for cached offline data immediately
    const cachedData = offlineCacheService.getOfflineData();
    setOfflineData(cachedData);
    
    // Check if we have meaningful cached content
    const hasContent = !!(
      cachedData.recentTracks?.length ||
      cachedData.popularTracks?.length ||
      cachedData.homepageSlides?.length
    );
    setHasCachedContent(hasContent);

    // Sync fresh data if online
    if (navigator.onLine) {
      offlineCacheService.syncData().then(() => {
        // Update with fresh data after sync
        const freshData = offlineCacheService.getOfflineData();
        setOfflineData(freshData);
      });
    }

    // PRELOAD DATA FROM BACKEND BEFORE PROCEEDING
    const initializeApp = async () => {
      try {
        console.log('🚀 Preloading critical data before proceeding...');
        setIsPreloading(true);
        
        // Fetch data from backend with timeout
        const data = await dataPreloaderService.preloadData(15000); // 15 second timeout
        setPreloadData(data);
        setPreloadError(null);
        
        console.log('✅ Data preloaded! Proceeding to current page...', pathname);
        
        // Wait a bit more for smooth UX (optional)
        setTimeout(() => {
          setIsPreloading(false);
          // DON'T redirect - just let the current page render
          // The loading component will disappear and the actual page will show
        }, 1000);
        
      } catch (error) {
        console.error('❌ Preload failed:', error);
        setPreloadError(error instanceof Error ? error.message : 'Failed to load data');
        setIsPreloading(false);
        
        // Still proceed without redirect - let the page handle its own data fetching
        setTimeout(() => {
          setIsPreloading(false);
          // DON'T redirect - just let the current page render
        }, 2000);
      }
    };

    initializeApp();

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    // Detect connection speed using Network Information API
    const detectConnection = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (!navigator.onLine) {
        setConnectionSpeed('offline');
        return;
      }

      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;

        if (effectiveType === '2g' || effectiveType === 'slow-2g' || (downlink && downlink < 0.5)) {
          setConnectionSpeed('slow');
          setTimeout(() => setShowSlowMessage(true), 3000); // Show slow message after 3 seconds
        } else if (effectiveType === '3g') {
          setConnectionSpeed('slow');
          setTimeout(() => setShowSlowMessage(true), 5000); // Show slow message after 5 seconds
        } else {
          setConnectionSpeed('fast');
        }
      } else {
        // Fallback: estimate based on resource load time
        const start = performance.now();
        const img = new window.Image();
        img.src = '/muzikax.png?test=' + Date.now();
        img.onload = () => {
          const loadTime = performance.now() - start;
          if (loadTime > 3000) {
            setConnectionSpeed('slow');
            setShowSlowMessage(true);
          } else {
            setConnectionSpeed('fast');
          }
        };
        img.onerror = () => {
          setConnectionSpeed('offline');
        };
      }
    };

    detectConnection();

    // Listen for online/offline events
    window.addEventListener('online', detectConnection);
    window.addEventListener('offline', () => setConnectionSpeed('offline'));

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      window.removeEventListener('online', detectConnection);
      window.removeEventListener('offline', () => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center z-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF4D67]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFCB2B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
        {/* Logo and Brand */}
        <div className="mb-8 relative">
          {/* Spinning vinyl record effect with actual logo */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-800 animate-spin shadow-2xl" style={{ animationDuration: '3s' }}>
              <div className="absolute inset-0 rounded-full border-t-2 border-[#FF4D67]"></div>
            </div>
            
            {/* Middle ring */}
            <div className="absolute inset-4 rounded-full border-2 border-gray-700 animate-spin shadow-xl" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
              <div className="absolute inset-0 rounded-full border-b-2 border-[#FFCB2B]"></div>
            </div>
            
            {/* Inner circle with actual logo */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center shadow-2xl overflow-hidden">
              <Image
                src="/muzikax.png"
                alt="MuzikaX Logo"
                width={80}
                height={80}
                className="object-contain animate-pulse"
                priority
              />
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-3 h-3 bg-[#FF4D67] rounded-full shadow-lg"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDelay: '1.33s' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-3 h-3 bg-[#FFCB2B] rounded-full shadow-lg"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDelay: '2.66s' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-3 h-3 bg-purple-500 rounded-full shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#FF4D67] via-[#FFCB2B] to-purple-500 bg-clip-text text-transparent animate-pulse">
          MuzikaX
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 text-sm md:text-base mb-6 font-medium">
          Rwanda & African Artists Music Platform
        </p>

        {/* Connection Status Warning */}
        {connectionSpeed === 'offline' && (
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg backdrop-blur-sm">
              <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.071-7.071A9 9 0 0121 12c0 .428-.03.85-.086 1.268" />
              </svg>
              <p className="text-red-200 font-semibold text-sm">No Internet Connection</p>
              <p className="text-red-300 text-xs mt-1">Showing cached content from your last visit</p>
            </div>

            {/* Show cached content if available */}
            {hasCachedContent && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur-sm max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">Available Offline Content</h3>
                  <span className="text-xs text-gray-400">
                    {offlineData?.lastSyncTime ? `Last synced ${formatTimeAgo(offlineData.lastSyncTime)}` : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {offlineData?.recentTracks && offlineData.recentTracks.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-[#FF4D67] rounded-full"></div>
                      <span className="text-gray-300">
                        {offlineData.recentTracks.length} Recent Tracks
                      </span>
                    </div>
                  )}

                  {offlineData?.popularTracks && offlineData.popularTracks.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-[#FFCB2B] rounded-full"></div>
                      <span className="text-gray-300">
                        {offlineData.popularTracks.length} Popular Songs
                      </span>
                    </div>
                  )}

                  {offlineData?.trendingCreators && offlineData.trendingCreators.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-300">
                        {offlineData.trendingCreators.length} Trending Artists
                      </span>
                    </div>
                  )}

                  {offlineData?.homepageSlides && offlineData.homepageSlides.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">
                        {offlineData.homepageSlides.length} Featured Updates
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-gray-500 text-xs mt-3 pt-3 border-t border-gray-700">
                  💡 Tip: You can browse cached content while offline. Changes will sync when you're back online.
                </p>
              </div>
            )}

            {!hasCachedContent && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-gray-400 text-xs">
                  No cached content available. Connect to the internet to load fresh content.
                </p>
              </div>
            )}
          </div>
        )}

        {connectionSpeed === 'slow' && showSlowMessage && (
          <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg backdrop-blur-sm">
            <svg className="w-8 h-8 text-yellow-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-200 font-semibold text-sm">Slow Connection Detected</p>
            <p className="text-yellow-300 text-xs mt-1">Loading may take longer than usual. Please wait...</p>
          </div>
        )}

        {/* Loading Progress Bar */}
        <div className="w-64 max-w-[80vw] mx-auto mb-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#FF4D67] via-[#FFCB2B] to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-xs mt-2 text-right">{Math.round(Math.min(loadingProgress, 100))}%</p>
        </div>

        {/* Loading Message */}
        <div className="space-y-2 min-h-[60px]">
          {isPreloading ? (
            <>
              <p className="text-gray-300 text-sm md:text-base font-medium animate-fade-in-out transition-opacity duration-500">
                {preloadError ? 'Loading failed - trying anyway...' : 'Fetching latest content from server...'}
              </p>
              {preloadData && (
                <div className="flex justify-center gap-2 text-xs text-gray-400 mt-2">
                  {preloadData.recentTracks.length > 0 && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#FF4D67] rounded-full"></div>
                      {preloadData.recentTracks.length} Tracks
                    </span>
                  )}
                  {preloadData.popularTracks.length > 0 && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#FFCB2B] rounded-full"></div>
                      {preloadData.popularTracks.length} Popular
                    </span>
                  )}
                  {preloadData.trendingCreators.length > 0 && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      {preloadData.trendingCreators.length} Artists
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-green-400 text-sm md:text-base font-medium">
              {preloadError ? 'Proceeding with cached data...' : 'Ready! Taking you to your music...'}
            </p>
          )}
        </div>

        {/* Sound waves animation */}
        <div className="mt-8 flex justify-center items-end space-x-1 h-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-[#FF4D67] to-[#FFCB2B] rounded-full animate-sound-wave"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: `${20 + Math.random() * 80}%`
              }}
            ></div>
          ))}
        </div>

        {/* Additional help text for slow connections */}
        {connectionSpeed === 'slow' && showSlowMessage && (
          <div className="mt-6 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <p className="text-gray-400 text-xs">
              <strong>Tip:</strong> Close other tabs or apps to improve loading speed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
