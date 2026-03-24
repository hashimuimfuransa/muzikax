'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import notificationService from '../services/notificationService'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated: actualAuth, userRole: actualRole, logout } = useAuth()
  const { t, language: actualLanguage, setLanguage } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  
  // Use mounted state to avoid hydration mismatch
  const mountedAuth = mounted ? actualAuth : false;
  const isAuthenticated = mountedAuth;
  const userRole = mounted ? actualRole : null;
  const language = mounted ? actualLanguage : 'en';
  const [searchQuery, setSearchQuery] = useState('') // Add search state
  const [showCategories, setShowCategories] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // App-like categories similar to Spotify/Apple Music
  const categories = [
    { id: 'home', name: t('home'), icon: '🏠' },
    { id: 'beats', name: t('beats'), icon: '🎵' },
    { id: 'mixes', name: t('mixes'), icon: '🎧' },
    { id: 'afrobeat', name: 'Afrobeat', icon: '🌍' },
    { id: 'hiphop', name: 'Hip Hop', icon: '🎤' },
    { id: 'rnb', name: 'R&B', icon: '🎷' },
    { id: 'afropop', name: 'Afropop', icon: '🎸' },
    { id: 'gospel', name: 'Gospel', icon: '⛪' },
    { id: 'dancehall', name: 'Dancehall', icon: '💃' },
    { id: 'reggae', name: 'Reggae', icon: '🇯🇲' },
    { id: 'pop', name: 'Pop', icon: '✨' },
    { id: 'rock', name: 'Rock', icon: '🎸' },
    { id: 'electronic', name: 'Electronic', icon: '⚡' },
    { id: 'house', name: 'House', icon: '🏠' },
    { id: 'jazz', name: 'Jazz', icon: '🎹' },
    { id: 'soul', name: 'Soul', icon: '❤️' },
    { id: 'community', name: t('community'), icon: '👥' },
  ];

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    // Navigate to appropriate pages
    switch(categoryId) {
      case 'home':
        router.push('/');
        break;
      case 'beats':
      case 'mixes':
        router.push(`/explore?type=${categoryId}`);
        break;
      case 'community':
        router.push('/community');
        break;
      default:
        // For genre categories, go to explore with filter
        router.push(`/explore?genre=${categoryId}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page with query parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Auto-hide categories when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (showCategories && categoriesRef.current) {
        const rect = categoriesRef.current.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          setShowCategories(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showCategories]);

  // Fetch unread notification count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            notificationService.setToken(token);
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.count);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
      {/* Categories Bar - Slides up/down on mobile */}
      <div 
        ref={categoriesRef}
        className={`bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 transition-all duration-300 overflow-hidden ${
          showCategories ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        } md:hidden`}
      >
        <div className="px-4 py-3">
          <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategorySelect(category.id);
                  setShowCategories(false); // Close categories after selection
                }}
                className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <span className="text-lg mb-1">{category.icon}</span>
                <span className="text-xs font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="w-full px-1 sm:px-3 lg:px-4">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <img src="/muzikax.png" alt="MuzikaX Logo" className="h-9 w-auto transition-transform group-hover:scale-105" />
              <span className="ml-2 text-2xl font-black text-white tracking-tighter">MuzikaX</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 justify-start px-12 max-w-2xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-800/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/50 focus:bg-gray-800/60 transition-all rounded-full border border-gray-700/50 text-sm"
              />
            </form>
          </div>

          {/* Desktop Controls (Right) */}
          <div className="hidden md:flex items-center space-x-3 bg-gray-800/40 px-3 py-1.5 rounded-2xl border border-gray-700/50">
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  router.push('/login');
                } else {
                  router.push('/upload');
                }
              }}
              className="hidden lg:flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold border border-white/10 transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              {t('upload')}
            </button>

            {/* Language Switcher */}
            <div className="relative group">
              <button className="p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-800 flex items-center space-x-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${language === 'en' ? 'text-[#FF4D67] bg-[#FF4D67]/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'} transition-colors`}
                >
                  <span>English</span>
                  {language === 'en' && <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D67]"></div>}
                </button>
                <button 
                  onClick={() => setLanguage('rw')}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${language === 'rw' ? 'text-[#FF4D67] bg-[#FF4D67]/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'} transition-colors`}
                >
                  <span>Kinyarwanda</span>
                  {language === 'rw' && <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D67]"></div>}
                </button>
              </div>
            </div>

            {isAuthenticated && (
              <Link 
                href="/notifications" 
                className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-[#FF4D67] text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-gray-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <div className="h-6 w-[1px] bg-gray-800 mx-1"></div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile" className="flex items-center space-x-2 p-1 pl-3 pr-3 hover:bg-gray-800 rounded-full transition-all group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4D67] to-[#FF3352] flex items-center justify-center text-white font-bold text-xs uppercase">
                    {t('profile').charAt(0)}
                  </div>
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title={t('logout')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="px-4 py-2 text-sm font-bold text-white hover:text-[#FF4D67] transition-all">
                  {t('login')}
                </Link>
                <Link href="/login" className="px-5 py-2 btn-primary text-white text-sm font-bold rounded-full transition-all shadow-lg hover:scale-105 active:scale-95">
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-1 bg-gray-800/40 px-2 py-1 rounded-2xl border border-gray-700/50">
            {/* Category toggle button for mobile */}
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              <svg 
                className={`h-6 w-6 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Search icon for mobile */}
            <button
              onClick={() => router.push('/search')}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            
            {/* Language switch for mobile */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'rw' : 'en')}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none relative"
              title={language === 'en' ? 'Switch to Kinyarwanda' : 'Switch to English'}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-black uppercase bg-[#FF4D67] text-white px-1 rounded-sm border border-gray-900 shadow-sm leading-none py-0.5 min-w-[18px] text-center">
                {language}
              </span>
            </button>
            
            {/* Menu button for mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
              title={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-gray-900 border-b border-gray-800`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            {t('home')}
          </Link>
          <Link href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            {t('explore')}
          </Link>
          <Link href="/charts" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            🎵 Charts
          </Link>
          <Link href="/beats" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            {t('beats')}
          </Link>
          <Link href="/playlists" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            {t('playlists')}
          </Link>
          <Link href="/community" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            {t('community')}
          </Link>
          
          <div className="px-3 py-2 border-t border-gray-800 mt-2">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t('more')}</div>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              {t('aboutUs')}
            </Link>
            <Link href="/faq" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              {t('faq')}
            </Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              {t('contact')}
            </Link>
          </div>
          
          <div className="px-3 py-2 border-t border-gray-800 mt-2">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Language / Ururimi</div>
            <div className="flex space-x-2 px-3 py-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'en' ? 'bg-[#FF4D67] text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('rw')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'rw' ? 'bg-[#FF4D67] text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                Kinyarwanda
              </button>
            </div>
          </div>

          {/* Upload button for all users */}
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              if (!isAuthenticated) {
                router.push('/login');
              } else {
                router.push('/upload');
              }
            }}
            className="block px-6 py-3 mt-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#FF4D67] to-[#FF3352] w-full text-center shadow-lg shadow-[#FF4D67]/20"
          >
            {t('upload')}
          </button>
          
          <div className="pt-4 pb-3 border-t border-gray-800 mt-4">
            <div className="flex flex-col items-center px-5 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="w-full text-center px-4 py-3 text-base font-medium text-gray-300 hover:text-white bg-gray-800 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                    {t('profile')}
                  </Link>
                  <Link href="/notifications" className="w-full text-center px-4 py-3 text-base font-medium text-gray-300 hover:text-white bg-gray-800 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                    {t('notifications')}
                  </Link>
                  {userRole === 'admin' && (
                    <Link href="/admin" className="w-full text-center px-4 py-3 text-base font-medium text-[#FF4D67] bg-gray-800 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                      {t('adminDashboard')}
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      router.push('/');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-3 text-base font-medium text-gray-400 hover:text-white bg-transparent border border-gray-800 rounded-xl"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full text-center px-4 py-3 text-base font-medium text-gray-300 hover:text-white bg-gray-800 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                    {t('login')}
                  </Link>
                  <Link href="/login" className="w-full text-center px-4 py-3 text-base font-bold text-white bg-[#FF4D67] rounded-xl shadow-lg" onClick={() => setIsMenuOpen(false)}>
                    {t('signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}