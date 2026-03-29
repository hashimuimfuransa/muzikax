'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOffline } from '../contexts/OfflineContext';

/**
 * Hook to handle offline routing
 * - Redirects to /offline page when offline
 * - Prevents navigation to home when offline
 * - Allows access to local audio player
 */
export function useOfflineRouting() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOnline, isOfflineMode, offlineTracks } = useOffline();

  useEffect(() => {
    // If user goes offline and not already on offline page, redirect
    if (!isOnline && !isOfflineMode) {
      console.log('Going offline...');
    }

    // When offline mode is active
    if (isOfflineMode) {
      console.log('Offline mode active, tracks available:', offlineTracks.length);
      
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
        console.log('No downloaded tracks, suggesting offline mode');
        // Show a notification or banner instead of hard redirect
        // User can choose to go to offline page or stay
      }
    }

    // AUTO-REDIRECT TO OFFLINE PAGE WHEN OFFLINE
    if (!isOnline && pathname !== '/offline') {
      // Give user 2 seconds to see the banner before redirecting
      const redirectTimeout = setTimeout(() => {
        console.log('Redirecting to offline player...');
        router.push('/offline');
      }, 2000);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [isOnline, isOfflineMode, pathname, router, offlineTracks.length]);

  // Function to manually navigate to offline page
  const goToOfflinePage = () => {
    router.push('/offline');
  };

  // Function to check if should show offline suggestions
  const shouldShowOfflineSuggestion = () => {
    return isOfflineMode && offlineTracks.length === 0;
  };

  return {
    goToOfflinePage,
    shouldShowOfflineSuggestion,
    isOnOfflinePage: pathname === '/offline',
  };
}
