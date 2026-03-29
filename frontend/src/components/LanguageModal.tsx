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
      // Delay longer to avoid conflict with AI popup (appears at 2s)
      // Language modal will appear at 2.5s if AI popup is not blocking
      const timer = setTimeout(() => {
        // Check if AI popup was already seen (if not, AI popup will show first)
        const hasSeenAIPopup = localStorage.getItem('aiAssistantPopupSeen');
        
        if (hasSeenAIPopup) {
          // AI popup already shown before, show language modal now
          setIsVisible(true);
        } else {
          // Wait for AI popup to finish (it shows at 2s, closes after user action)
          // Check again after additional 3 seconds
          const secondTimer = setTimeout(() => {
            setIsVisible(true);
          }, 3000);
          
          return () => clearTimeout(secondTimer);
        }
      }, 2500);
      
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
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm transform transition-all animate-slide-up sm:animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Minimalist Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white text-center">
            Select Language
          </h2>
        </div>

        {/* Language Options - Simple & Clean */}
        <div className="p-4 space-y-2">
          {/* English Option */}
          <button
            onClick={() => handleLanguageSelect('en')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-[#FF4D67]/10 border border-gray-700 hover:border-[#FF4D67] transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">EN</span>
              </div>
              <span className="text-sm font-medium text-white group-hover:text-[#FF4D67] transition-colors">
                English
              </span>
            </div>
            <svg className="w-5 h-5 text-gray-500 group-hover:text-[#FF4D67] transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Kinyarwanda Option */}
          <button
            onClick={() => handleLanguageSelect('rw')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-[#FFCB2B]/10 border border-gray-700 hover:border-[#FFCB2B] transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">RW</span>
              </div>
              <span className="text-sm font-medium text-white group-hover:text-[#FFCB2B] transition-colors">
                Kinyarwanda
              </span>
            </div>
            <svg className="w-5 h-5 text-gray-500 group-hover:text-[#FFCB2B] transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Info Text */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-500">
            You can change this later in settings
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes scale-up {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
