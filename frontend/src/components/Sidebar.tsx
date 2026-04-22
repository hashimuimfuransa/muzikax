'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useOffline } from '../contexts/OfflineContext'

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(() => {
    // Persist sidebar state in localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarExpanded')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const { isAuthenticated, user } = useAuth()
  const { t } = useLanguage()
  const { isOnline } = useOffline()
  const router = useRouter()
  const pathname = usePathname()

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded))
  }, [isExpanded])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  // Navigation items
  const navItems = [
    {
      name: t('home'),
      href: '/',
      icon: (
        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: t('explore'),
      href: '/explore',
      icon: (
        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: t('charts'),
      href: '/charts',
      icon: (
        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: t('beats'),
      href: '/beats',
      icon: (
        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
    },
    {
      name: t('playlists'),
      href: '/playlists',
      icon: (
        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Help',
      href: '/help',
      icon: (
        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  // Categories for the sidebar
  const categories = [
    { name: 'Afrobeat', href: '/explore?category=afrobeat', emoji: '🌍' },
    { name: 'Hip Hop', href: '/explore?category=hiphop', emoji: '🎤' },
    { name: 'R&B', href: '/explore?category=rnb', emoji: '🎷' },
    { name: 'Gospel', href: '/explore?category=gospel', emoji: '⛪' },
    { name: 'Amapiano', href: '/explore?category=amapiano', emoji: '🎹' },
    { name: 'Afropop', href: '/explore?category=afropop', emoji: '🎸' },
    { name: 'Dancehall', href: '/explore?category=dancehall', emoji: '💃' },
    { name: 'Reggae', href: '/explore?category=reggae', emoji: '🇯🇲' },
    { name: 'Pop', href: '/explore?category=pop', emoji: '✨' },
    { name: 'Electronic', href: '/explore?category=electronic', emoji: '⚡' },
  ]

  const isActive = (href: string) => pathname === href

  // Show sidebar when expanded OR hovered
  const showExpanded = isExpanded || isHovered

  return (
    <motion.aside 
      initial={false}
      animate={{ width: showExpanded ? 200 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`hidden md:flex flex-col fixed top-16 left-0 h-[calc(100vh-64px)] z-30 
        bg-[#0B0F14] border-r border-[#1F2937]
        overflow-y-auto scrollbar-hide sidebar-scrollbar-hide shadow-xl`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => !isExpanded && setIsHovered(false)}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Toggle Button - Hamburger Menu */}
      <div className="p-2 border-b border-[#1F2937]">
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl 
            text-[#9CA3AF] hover:text-white hover:bg-[#1A2330] 
            transition-all duration-300
            ${!showExpanded && 'justify-center'}`}
          title={showExpanded ? 'Minimize Sidebar' : 'Maximize Sidebar'}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showExpanded ? (
              // Close/Minimize icon
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              // Hamburger/Menu icon
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          {showExpanded && (
            <span className="font-medium text-sm">{showExpanded ? 'Minimize' : 'Menu'}</span>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 p-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl 
              transition-all duration-300
              ${isActive(item.href) 
                ? 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]' 
                : 'text-[#9CA3AF] hover:text-white hover:bg-[#1A2330]'
              } 
              ${!isHovered && 'justify-center'}`}
            title={item.name}
          >
            {/* Active indicator with glow */}
            {isActive(item.href) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#F59E0B] rounded-r-full"></div>
            )}
            
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {item.icon}
              </div>
              {showExpanded && (
                <span className="font-medium text-sm whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </div>
          </Link>
        ))}

        {/* Offline Mode Button - Only visible when offline */}
        {!isOnline && (
          <Link
            href="/offline"
            className={`group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl 
              transition-all duration-300
              ${isActive('/offline') 
                ? 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]' 
                : 'text-[#9CA3AF] hover:text-white hover:bg-[#1A2330]'
              } 
              ${!isHovered && 'justify-center'}`}
            title="Offline Player"
          >
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-3.244m16.942-12.73a9 9 0 00-12.728 0m0 0l2.829 2.829m-2.829-2.829L3 3m5.658 16.942a9 9 0 01-2.83-1.414" />
            </svg>
            {showExpanded && (
              <span className="font-medium text-sm">Offline Player</span>
            )}
          </Link>
        )}

        {/* Upload Button */}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              router.push("/login");
            } else {
              router.push("/upload");
            }
          }}
          className={`group relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl 
            text-[#9CA3AF] hover:text-white hover:bg-[#1A2330] 
            transition-all duration-300
            ${!isHovered && 'justify-center'}`}
          title={t('upload')}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {showExpanded && (
            <span className="font-medium text-sm">{t('upload')}</span>
          )}
        </button>
      </nav>

      {/* Categories Section - Compact Grid */}
      {showExpanded && (
        <div className="px-2 py-3">
          <h2 className="text-[9px] uppercase tracking-[0.2em] text-[#6B7280] font-bold mb-2 px-2">
            {t('categories')}
          </h2>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium 
                  text-[#9CA3AF] hover:text-white hover:bg-[#1A2330] 
                  rounded-lg transition-all duration-200"
              >
                <span className="truncate">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Library Section - Compact */}
      {showExpanded && (
        <div className="px-2 py-3">
          <h2 className="text-[9px] uppercase tracking-[0.2em] text-[#6B7280] font-bold mb-2 px-2">
            {t('library')}
          </h2>
          <div className="space-y-1">
            <Link
              href="/favorites"
              className="flex items-center gap-3 px-2.5 py-2 text-xs font-medium 
                text-[#9CA3AF] hover:text-white hover:bg-[#1A2330] 
                rounded-lg transition-all duration-200"
            >
              <span className="truncate">{t('favorites') || 'Favorites'}</span>
            </Link>
            <Link
              href="/recently-played"
              className="flex items-center gap-3 px-2.5 py-2 text-xs font-medium 
                text-[#9CA3AF] hover:text-white hover:bg-[#1A2330] 
                rounded-lg transition-all duration-200"
            >
              <span className="truncate">{t('recentlyPlayed') || 'Recently Played'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* User Profile Card - Minimal */}
      {showExpanded && isAuthenticated && user && (
        <div className="mt-auto p-2">
          <div className="bg-[#121821] rounded-xl p-2.5 flex items-center gap-2.5 border border-[#1F2937]">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={36}
                height={36}
                className="rounded-full object-cover ring-2 ring-[#F59E0B]/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#FFB020] flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-[#9CA3AF] capitalize truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  )
}
