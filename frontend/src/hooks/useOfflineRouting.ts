'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOffline } from '../contexts/OfflineContext';
import React from 'react';

/**
 * Hook to handle offline routing
 * - Auto-detects network changes and redirects to /offline page
 * - Prevents navigation to home when offline
 * - Allows access to local audio player
 * - Supports mobile apps with better UX
 */
export function useOfflineRouting() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOnline, isOfflineMode, offlineTracks, isMobileApp } = useOffline();
  const redirectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If user goes offline and not already on offline page, redirect
    if (!isOnline && !isOfflineMode) {
      console.log('🌐 Going offline...');
    }

    // When offline mode is active
    if (isOfflineMode) {
      console.log('📴 Offline mode active, tracks available:', offlineTracks.length);
      
      // Don't redirect if already on offline page
      if (pathname === '/offline') {
        return;
      }

      // Don't redirect if on essential pages (player, tracks, etc.)
      const essentialPages = ['/player', '/tracks', '/upload'];
      if (essentialPages.some(page => pathname.startsWith(page))) {
        return;
      }

      // For other pages when offline with no downloaded tracks, suggest offline page
      if (offlineTracks.length === 0 && pathname !== '/') {
        console.log('💡 No downloaded tracks, suggesting offline mode');
        // Show a notification or banner instead of hard redirect
        // User can choose to go to offline page or stay
      }
    }

    // AUTO-REDIRECT TO OFFLINE PAGE WHEN OFFLINE
    if (!isOnline && pathname !== '/offline') {
      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      
      // Faster redirect for mobile apps (1 second), slower for desktop (2 seconds)
      const redirectDelay = isMobileApp ? 1000 : 2000;
      
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('➡️ Redirecting to offline player...');
        router.push('/offline');
      }, redirectDelay);
      
      return () => {
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }
      };
    }
  }, [isOnline, isOfflineMode, pathname, router, offlineTracks.length, isMobileApp]);

  // Function to manually navigate to offline page
  const goToOfflinePage = () => {
    router.push('/offline');
  };

  // Function to check if should show offline suggestions
  const shouldShowOfflineSuggestion = () => {
    return isOfflineMode && offlineTracks.length === 0;
  };

  // Function to check if currently on offline page
  const isOnOfflinePage = pathname === '/offline';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  return {
    goToOfflinePage,
    shouldShowOfflineSuggestion,
    isOnOfflinePage,
  };
}
