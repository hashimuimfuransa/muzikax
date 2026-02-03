'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import notificationService from '../services/notificationService'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, userRole, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('') // Add search state
  const [showCategories, setShowCategories] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // App-like categories similar to Spotify/Apple Music
  const categories = [
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'beats', name: 'Beats', icon: '🎵' },
    { id: 'mixes', name: 'Mixes', icon: '🎧' },
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
    { id: 'community', name: 'Community', icon: '👥' },
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
      
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/muzikax.png" alt="MuzikaX Logo" className="h-8 w-auto" />
              <span className="ml-3 text-xl font-bold text-white">MuzikaX</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 sm:space-x-3 mx-2">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Home
              </Link>
              <Link href="/explore" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Explore
              </Link>
              <Link href="/beats" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Beats
              </Link>
              <Link href="/playlists" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Playlists
              </Link>
              <Link href="/community" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Community
              </Link>
              <div className="relative group hidden lg:block">
                <button className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base flex items-center">
                  More
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <Link href="/about" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                    About Us
                  </Link>
                  <Link href="/faq" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                    FAQ
                  </Link>
                  <Link href="/contact" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                    Contact
                  </Link>
                  <div className="border-t border-gray-700 my-1"></div>
                  <Link href="/terms" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                    Terms of Use
                  </Link>
                  <Link href="/privacy" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                    Privacy Policy
                  </Link>
                  <Link href="/copyright" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                    Copyright
                  </Link>
                </div>
              </div>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search music, artists, albums..."
                  className="w-32 sm:w-48 md:w-56 px-3 py-1.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent text-sm transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </form>
              
              {/* Upload button for all users with proper navigation */}
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    // If not authenticated, go to login
                    router.push('/login');
                  } else if (userRole === 'creator') {
                    // If already a creator, go to upload
                    router.push('/upload');
                  } else {
                    // If authenticated but not a creator, go to upload to upgrade
                    router.push('/upload');
                  }
                }}
                className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base bg-transparent border-none cursor-pointer"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Notification Icon */}
          {isAuthenticated && (
            <Link 
              href="/notifications" 
              className="relative p-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4D67] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          
          {/* Auth Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                    Profile
                  </Link>
                  {userRole === 'admin' && (
                    <Link href="/admin" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base bg-transparent border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                    Login
                  </Link>
                  <Link href="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 btn-primary text-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-1">
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
            
            {/* Notification icon for mobile */}
            {isAuthenticated && (
              <Link
                href="/notifications"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none relative"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF4D67] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* Menu button for mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
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
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-0 pt-2 pb-3 space-y-1 sm:px-1">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            Explore
          </Link>
          <Link href="/beats" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            Beats
          </Link>
          <Link href="/playlists" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            Playlists
          </Link>
          <Link href="/community" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
            Community
          </Link>
          <div className="px-3 py-2">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Information</div>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              About Us
            </Link>
            <Link href="/faq" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              FAQ
            </Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </div>
          <div className="px-3 py-2">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Legal</div>
            <Link href="/terms" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              Terms of Use
            </Link>
            <Link href="/privacy" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              Privacy Policy
            </Link>
            <Link href="/copyright" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
              Copyright
            </Link>
          </div>
          {/* Upload button for all users with proper navigation */}
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                // If not authenticated, go to login
                router.push('/login');
              } else if (userRole === 'creator') {
                // If already a creator, go to upload
                router.push('/upload');
              } else {
                // If authenticated but not a creator, go to upload to upgrade
                router.push('/upload');
              }
            }}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 w-full text-left bg-transparent border-none cursor-pointer"
          >
            Upload
          </button>
          <div className="pt-4 pb-3 border-t border-gray-800">
            <div className="flex items-center px-5">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link href="/notifications" className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                    Notifications
                  </Link>
                  {userRole === 'admin' && (
                    <Link href="/admin" className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      router.push('/');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/login" className="w-full text-center ml-3 px-4 py-2 btn-primary" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
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