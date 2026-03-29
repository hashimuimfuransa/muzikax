'use client';

import { useEffect, useState } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import Link from 'next/link';

export default function OfflineIndicator() {
  const { isOnline, isOfflineMode, offlineTracks } = useOffline();
  const [showNotification, setShowNotification] = useState(false);
  const [prevOnline, setPrevOnline] = useState(true);

  useEffect(() => {
    if (prevOnline && !isOnline) {
      // Just went offline - show notification
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    } else if (!prevOnline && isOnline) {
      // Just came back online - show notification
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevOnline(isOnline);
  }, [isOnline, prevOnline]);

  // Don't show if always been online
  if (isOnline && prevOnline) return null;

  return (
    <>
      {/* Persistent Status Bar */}
      <div className={`fixed top-0 left-0 right-0 z-[9999] py-2 px-4 text-center text-sm font-medium transition-all duration-300 ${
        isOfflineMode 
          ? 'bg-orange-600 text-white' 
          : 'bg-green-600 text-white'
      }`}>
        <div className="flex items-center justify-center gap-2">
          {isOfflineMode ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-3.244m16.942-12.73a9 9 0 00-12.728 0m0 0l2.829 2.829m-2.829-2.829L3 3m5.658 16.942a9 9 0 01-2.83-1.414" />
              </svg>
              <span>Offline Mode - {offlineTracks.length} songs available</span>
              {offlineTracks.length === 0 && (
                <Link 
                  href="/offline"
                  className="ml-3 underline hover:no-underline flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Open Local Player
                </Link>
              )}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <span>Back Online - Full features restored</span>
            </>
          )}
        </div>
      </div>

      {/* Temporary Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce-in">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 ${
            isOfflineMode 
              ? 'bg-orange-600 text-white' 
              : 'bg-green-600 text-white'
          }`}>
            {isOfflineMode ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-3.244m16.942-12.73a9 9 0 00-12.728 0m0 0l2.829 2.829m-2.829-2.829L3 3m5.658 16.942a9 9 0 01-2.83-1.414" />
                </svg>
                <span className="font-medium">You&apos;re offline - {offlineTracks.length > 0 ? 'Downloaded tracks are available' : 'Open local player'}</span>
                {offlineTracks.length === 0 && (
                  <Link 
                    href="/offline"
                    className="ml-2 underline hover:no-underline font-semibold"
                  >
                    Open Now →
                  </Link>
                )}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Back online!</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Spacer for status bar */}
      <div className={`h-8 transition-all duration-300 ${
        isOfflineMode || !prevOnline ? 'block' : 'hidden'
      }`} />
    </>
  );
}
