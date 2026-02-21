'use client';

import { useState, useEffect } from 'react';

export default function ContactFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Initialize visibility on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-hide tooltip after delay
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleContactClick = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  return (
    <div className="fixed right-6 bottom-6 md:right-8 md:bottom-8 z-[99999] transition-all duration-300 translate-x-0 opacity-100">
      <div className="relative">
        {/* Main Contact Button */}
        <button
          onClick={handleContactClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative group"
          aria-label="Contact Us"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-75 blur-sm animate-pulse"></div>
          
          {/* Main button content */}
          <div className="relative z-10">
            <svg 
              className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white border-2 border-white">
            !
          </div>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 md:left-auto md:right-0 md:transform-none mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap animate-fadeIn">
            Contact Us
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 md:left-auto md:right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Expanded Contact Options */}
        {isOpen && (
          <div className="absolute bottom-20 left-0 md:bottom-24 md:left-auto md:right-0 mb-2 space-y-3 animate-slideUp">
            {/* WhatsApp Option */}
            <div className="transition-all duration-200 transform hover:scale-105">
              <button
                onClick={() => {
                  window.open('https://wa.me/250793828834', '_blank');
                  setIsOpen(false);
                }}
                className="flex items-center bg-white text-gray-800 px-3 py-2 md:px-4 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 md:mr-3">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">WhatsApp</span>
              </button>
            </div>

            {/* Email Option */}
            <div className="transition-all duration-200 transform hover:scale-105">
              <button
                onClick={() => {
                  window.location.href = 'mailto:support@muzikax.com?subject=Help%20Needed&body=Hello%20MuzikaX%20Team,';
                  setIsOpen(false);
                }}
                className="flex items-center bg-white text-gray-800 px-3 py-2 md:px-4 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 md:mr-3">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Email</span>
              </button>
            </div>

            {/* Call Option */}
            <div className="transition-all duration-200 transform hover:scale-105">
              <button
                onClick={() => {
                  window.location.href = 'tel:+250793828834';
                  setIsOpen(false);
                }}
                className="flex items-center bg-white text-gray-800 px-3 py-2 md:px-4 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="w-6 h-6 md:w-8 md:h-8 bg-red-100 rounded-full flex items-center justify-center mr-2 md:mr-3">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Call</span>
              </button>
            </div>

            {/* Feedback Option */}
            <div className="transition-all duration-200 transform hover:scale-105">
              <button
                onClick={() => {
                  // You can open a feedback form modal here
                  console.log('Opening feedback form');
                  setIsOpen(false);
                }}
                className="flex items-center bg-white text-gray-800 px-3 py-2 md:px-4 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 md:mr-3">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-3V7h-2v4h2z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium">Feedback</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}