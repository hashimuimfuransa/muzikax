'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageModal() {
  const { setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already selected a language
    const hasSelectedLanguage = localStorage.getItem('languageSelected');
    
    // Show modal only if user hasn't selected a language yet
    if (!hasSelectedLanguage) {
      // Quick appearance - no delay
      const timer = setTimeout(() => {
        // Check if AI popup was already seen
        const hasSeenAIPopup = localStorage.getItem('aiAssistantPopupSeen');
        
        if (hasSeenAIPopup) {
          // AI popup already shown before, show language modal now
          setIsVisible(true);
        } else {
          // Wait for AI popup to finish
          const secondTimer = setTimeout(() => {
            setIsVisible(true);
          }, 500); // Reduced from 3000ms to 500ms
          
          return () => clearTimeout(secondTimer);
        }
      }, 500); // Reduced from 2500ms to 500ms
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLanguageSelect = (lang: 'en' | 'rw') => {
    setLanguage(lang);
    // Save to localStorage so user won't be asked again
    localStorage.setItem('languageSelected', 'true');
    localStorage.setItem('language', lang);
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => setIsVisible(false)}
    >
      <div 
        className="bg-gray-900/95 backdrop-blur-xl border-t sm:border border-gray-700/50 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Close Button */}
        <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Select Language
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Language Options - Large & Touch-Friendly */}
        <div className="p-4 space-y-3 pb-6">
          {/* English Option */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLanguageSelect('en');
            }}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400 transition-all duration-200 group active:scale-[0.98]"
          >
            <div className="flex items-center space-x-4">
              <span className="text-3xl">🇬🇧</span>
              <span className="text-base font-semibold text-white">English</span>
            </div>
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Kinyarwanda Option */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLanguageSelect('rw');
            }}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-red-500/10 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-200 group active:scale-[0.98]"
          >
            <div className="flex items-center space-x-4">
              <span className="text-3xl">🇷🇼</span>
              <span className="text-base font-semibold text-white">Kinyarwanda</span>
            </div>
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Info Text */}
        <div className="px-6 pb-5 text-center border-t border-gray-800/50 pt-4">
          <p className="text-xs text-gray-400">
            You can change this later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
