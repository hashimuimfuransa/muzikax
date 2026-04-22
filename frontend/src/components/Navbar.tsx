'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import notificationService from '../services/notificationService'
import LanguageModal from './LanguageModal'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated: actualAuth, userRole: actualRole, logout, user } = useAuth()
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Handle user menu navigation
  const handleProfileClick = () => {
    setShowUserMenu(false)
    // Force a small delay to allow menu to close before navigation
    setTimeout(() => {
      router.push('/library')
    }, 100)
  }

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
    router.push('/')
  }

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // App-like categories similar to Spotify/Apple Music
  const categories = [
    { id: 'home', name: t('home'), icon: '🏠' },
    { id: 'charts', name: t('charts'), icon: '📊' },
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
      case 'charts':
        router.push('/charts');
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

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus on search input if it exists
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block glass-strong sticky top-0 z-40">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo - Left Side */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg ring-2 ring-[#F59E0B]/30 transition-all duration-300 group-hover:ring-[#FFB020]/50">
                <img src="/muzikax.png" alt="MuzikaX Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black text-white hidden lg:block">MuzikaX</span>
            </Link>

            {/* Search Bar - Modern with Functionality */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery('');
                }
              }}
              className="flex-1 max-w-2xl hidden md:block"
            >
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-[#F59E0B] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-24 py-2.5 bg-[#121821]/80 backdrop-blur-sm text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 focus:bg-[#1A2330] transition-all duration-300 rounded-full border border-[#1F2937] hover:border-[#374151] text-sm shadow-sm"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                ) : (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center gap-1 pointer-events-none">
                    <kbd className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-800/50 border border-gray-700 rounded">⌘</kbd>
                    <kbd className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-800/50 border border-gray-700 rounded">K</kbd>
                  </div>
                )}
              </div>
            </form>
            
            {/* Mobile Search Button */}
            <button
              onClick={() => router.push('/search')}
              className="md:hidden p-2.5 text-gray-400 hover:text-white hover:bg-[#121821] rounded-full transition-all"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#121821] hover:bg-[#1A2330] border border-[#1F2937] text-white rounded-full text-sm font-medium transition-all duration-300 active:scale-95"
              >
                <span>{language === 'en' ? '🇬🇧' : language === 'rw' ? '🇷🇼' : '🇫🇷'}</span>
                <span className="hidden lg:inline">{t('language')}</span>
              </button>

              {/* Authentication / Profile Buttons */}
              {!mounted ? (
                <div className="w-24 h-9 bg-[#121821] rounded-full animate-pulse"></div>
              ) : isAuthenticated ? (
                user?.role === 'admin' && !pathname?.startsWith('/admin') ? (
                  <Link
                    href="/admin"
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#FF8C00] to-[#FFB020] hover:from-[#FF7A00] hover:to-[#FFA010] text-black rounded-full text-sm font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-[#FF8C00]/30"
                  >
                    {t('adminDashboard')}
                  </Link>
                ) : (
                  <Link
                    href="/library"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF8C00] to-[#FFB020] hover:from-[#FF7A00] hover:to-[#FFA010] text-black rounded-full text-sm font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-[#FF8C00]/30"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    )}
                    <span className="hidden lg:inline">{user?.name || t('profile')}</span>
                  </Link>
                )
              ) : (
                <Link
                  href="/login"
                  className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#FF8C00] to-[#FFB020] hover:from-[#FF7A00] hover:to-[#FFA010] text-black rounded-full text-sm font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-[#FF8C00]/30"
                >
                  {t('login')}
                </Link>
              )}

              {/* Upload Button - Show when authenticated */}
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    router.push('/upload');
                  }}
                  className="flex items-center px-5 py-2.5 bg-[#121821] hover:bg-[#1A2330] text-white border border-[#1F2937] rounded-full text-sm font-bold transition-all duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                  {t('upload')}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100 animate-in fade-in zoom-in-95 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header with Close Button */}
            <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Select Language
              </h2>
              <button
                onClick={() => setShowLanguageModal(false)}
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
                  setLanguage('en');
                  setShowLanguageModal(false);
                }}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400 transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🇬🇧</span>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-white">English</span>
                    <span className="text-xs opacity-60">United Kingdom</span>
                  </div>
                </div>
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Kinyarwanda Option */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLanguage('rw');
                  setShowLanguageModal(false);
                }}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-red-500/10 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🇷🇼</span>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-white">Kinyarwanda</span>
                    <span className="text-xs opacity-60">Rwanda</span>
                  </div>
                </div>
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Kiswahili Option */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLanguage('sw');
                  setShowLanguageModal(false);
                }}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-green-600/20 to-blue-600/10 border border-green-500/30 hover:border-green-400 transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🇹🇿</span>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-white">Kiswahili</span>
                    <span className="text-xs opacity-60">Tanzania/Kenya</span>
                  </div>
                </div>
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
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
      )}
    </>
  )
}