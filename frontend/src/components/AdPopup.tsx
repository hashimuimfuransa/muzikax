'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface AdPopupProps {
  isEnabled?: boolean;
}

export default function AdPopup({ isEnabled = true }: AdPopupProps) {
  const [showAd, setShowAd] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    // Show ad after a delay to not interrupt initial page load
    const timer = setTimeout(() => {
      setShowAd(true);
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, [isEnabled]);

  const handleClose = () => {
    setShowAd(false);
    setIsClosed(true);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isEnabled || isClosed) {
    return null;
  }

  return (
    <>
      {/* Ad Scripts */}
      <Script
        async={true}
        data-cfasync="false"
        src="https://pl28605937.profitablecpmratenetwork.com/31924f27da870fbdf752dfdc1f58c7bc/invoke.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://pl28605916.profitablecpmratenetwork.com/a9/c3/dc/a9c3dc3a3a8377732b2d96aa69ab8c62.js"
        strategy="lazyOnload"
      />

      {/* Ad Popup Container */}
      <div
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
          isMinimized ? 'w-16 h-16' : 'w-80 md:w-96'
        }`}
      >
        {/* Popup Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header with Controls */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {isMinimized ? 'Advertisement' : 'Sponsored Content'}
            </span>
            <div className="flex items-center space-x-1">
              {/* Minimize Button */}
              <button
                onClick={handleMinimize}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l10 10M20 16v4m0 0h-4m4 0L10 10" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                aria-label="Close ad"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Ad Content */}
          {!isMinimized && (
            <div className="p-3">
              {/* Ad Container */}
              <div className="min-h-[250px] flex items-center justify-center">
                <div id="container-31924f27da870fbdf752dfdc1f58c7bc" className="w-full" />
              </div>
              
              {/* User Control Info */}
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
                You can minimize or close this ad anytime
              </div>
            </div>
          )}

          {/* Minimized State Indicator */}
          {isMinimized && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer" onClick={handleMinimize}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Responsive Adjustments */}
      <style jsx>{`
        @media (max-width: 640px) {
          .fixed {
            bottom: 0.5rem !important;
            right: 0.5rem !important;
            left: 0.5rem !important;
            width: calc(100% - 1rem) !important;
          }
        }
      `}</style>
    </>
  );
}
