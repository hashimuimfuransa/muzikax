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
    <>
      <nav className="hidden md:block bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40" data-testid="desktop-navbar">
        {/* Categories Bar */}
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
                <div className="w-9 h-9 rounded-lg overflow-hidden shadow-md">
                  <img src="/muzikax.png" alt="MuzikaX Logo" className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105" />
                </div>
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
              {/* Login Button - Show when not authenticated */}
              {!isAuthenticated && (
                <button 
                  onClick={() => router.push('/login?mode=login')}
                  className="flex items-center px-4 py-2 bg-[#FF4D67] hover:bg-[#FF4D67]/90 text-white rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg shadow-[#FF4D67]/20"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16a1 1 0 110-2 1 1 0 010 2zM13 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('login')}
                </button>
              )}

              {/* Upload Button - Show when authenticated */}
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    router.push('/upload');
                  }}
                  className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold border border-white/10 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                  </svg>
                  {t('upload')}
                </button>
              )}

              {/* Language Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setShowLanguageModal(true)}
                  className="p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-800 flex items-center space-x-1.5"
                  aria-label="Switch Language"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="hidden sm:inline text-xs font-bold uppercase">{language === 'en' ? 'EN' : language === 'rw' ? 'RW' : 'SW'}</span>
                </button>
              </div>

              {/* User Profile Dropdown - Only when authenticated */}
              {isAuthenticated && userRole && (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-800 transition-all active:scale-95"
                    aria-label="User Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {userRole === 'creator' ? '🎵' : userRole === 'admin' ? '⚡' : '👤'}
                    </div>
                  </button>

                  {/* Dropdown Menu - Rendered outside navbar with fixed positioning */}
                  {showUserMenu && (
                    <div 
                      ref={userMenuRef}
                      className="fixed top-16 right-4 w-56 bg-gray-900/98 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-br from-[#FF4D67]/10 to-[#FFCB2B]/5">
                        <p className="text-sm font-bold text-white">My Account</p>
                        <p className="text-xs text-gray-300 capitalize">{userRole}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-[#FF4D67]/20 hover:to-[#FF4D67]/10 transition-all group"
                        >
                          <svg className="w-5 h-5 mr-3 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">Library</span>
                        </button>
                        
                        {/* Profile Submenu Items - Desktop Only */}
                        <div className="border-t border-gray-700/50 my-1"></div>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/library?tab=tracks')
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-[#FF4D67]/20 hover:to-[#FF4D67]/10 transition-all group"
                        >
                          <svg className="w-5 h-5 mr-3 text-[#FFCB2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <span className="font-medium">My Tracks</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/library?tab=analytics')
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-[#FF4D67]/20 hover:to-[#FF4D67]/10 transition-all group"
                        >
                          <svg className="w-5 h-5 mr-3 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="font-medium">Analytics</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/library?tab=followers')
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-[#FF4D67]/20 hover:to-[#FF4D67]/10 transition-all group"
                        >
                          <svg className="w-5 h-5 mr-3 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">Followers</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/library?tab=following')
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-[#FF4D67]/20 hover:to-[#FF4D67]/10 transition-all group"
                        >
                          <svg className="w-5 h-5 mr-3 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">Following</span>
                        </button>
                        
                        <div className="border-t border-gray-700/50 my-1"></div>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            router.push('/edit-profile')
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-[#FF4D67]/20 hover:to-[#FF4D67]/10 transition-all group"
                        >
                          <svg className="w-5 h-5 mr-3 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="font-medium">Edit Profile</span>
                        </button>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-700/50 my-1"></div>
                      
                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
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