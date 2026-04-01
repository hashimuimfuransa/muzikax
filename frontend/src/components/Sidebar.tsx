'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useOffline } from '../contexts/OfflineContext'

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false)
  const { isAuthenticated, userRole } = useAuth()
  const { t } = useLanguage()
  const { isOnline } = useOffline()
  const router = useRouter()
  const pathname = usePathname()

  // Categories for the sidebar
  const categories = [
    { name: 'Afrobeat', href: '/explore?category=afrobeat' },
    { name: 'Hip Hop', href: '/explore?category=hiphop' },
    { name: 'R&B', href: '/explore?category=rnb' },
    { name: 'Gospel', href: '/explore?category=gospel' },
    { name: 'Traditional', href: '/explore?category=traditional' },
    { name: 'Pop', href: '/explore?category=pop' },
    { name: 'Jazz', href: '/explore?category=jazz' },
    { name: 'Soul', href: '/explore?category=soul' },
    { name: 'Reggae', href: '/explore?category=reggae' },
    { name: 'Amapiano', href: '/explore?category=amapiano' },
    { name: 'Electronic', href: '/explore?category=electronic' },
  ]

  return (
    <aside 
      className={`hidden md:flex flex-col bg-[#0B0E14] border-r border-gray-800/50 p-4 overflow-y-auto scrollbar-hide sidebar-scrollbar-hide fixed top-16 left-0 h-[calc(100vh-64px)] z-30 transition-all duration-300 ease-in-out ${
        isHovered ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <nav className="space-y-1 flex-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/' 
              ? 'bg-[#FF4D67] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          } ${!isHovered && 'justify-center'}`}
          title={t('home')}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {isHovered && <span className="font-semibold tracking-wide">{t('home')}</span>}
        </Link>

        <Link
          href="/explore"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/explore' 
              ? 'bg-[#FF4D67] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          } ${!isHovered && 'justify-center'}`}
          title={t('explore')}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isHovered && <span className="font-semibold tracking-wide">{t('explore')}</span>}
        </Link>

        <Link
          href="/charts"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/charts' 
              ? 'bg-[#FF4D67] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          } ${!isHovered && 'justify-center'}`}
          title={t('charts')}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {isHovered && <span className="font-semibold tracking-wide">{t('charts')}</span>}
        </Link>

        <Link
          href="/beats"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/beats' 
              ? 'bg-[#FF4D67] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          } ${!isHovered && 'justify-center'}`}
          title={t('beats')}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          {isHovered && <span className="font-semibold tracking-wide">{t('beats')}</span>}
        </Link>

        <Link
          href="/playlists"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/playlists' 
              ? 'bg-[#FF4D67] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
          } ${!isHovered && 'justify-center'}`}
          title={t('playlists')}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {isHovered && <span className="font-semibold tracking-wide">{t('playlists')}</span>}
        </Link>

        {/* Offline Mode Button - Only visible when offline */}
        {!isOnline && (
          <Link
            href="/offline"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              pathname === '/offline' 
                ? 'bg-[#FF4D67] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
            } ${!isHovered && 'justify-center'}`}
            title="Offline Player"
          >
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-3.244m16.942-12.73a9 9 0 00-12.728 0m0 0l2.829 2.829m-2.829-2.829L3 3m5.658 16.942a9 9 0 01-2.83-1.414" />
            </svg>
            {isHovered && <span className="font-semibold tracking-wide">Offline Player</span>}
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
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all duration-200 w-full text-left ${!isHovered && 'justify-center'}`}
          title={t('upload')}
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {isHovered && <span className="font-semibold tracking-wide">{t('upload')}</span>}
        </button>

        {isHovered && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="mt-8 pt-4 border-t border-gray-800/50">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4 px-4">
                {t('categories')}
              </h2>
              <div className="space-y-0.5 px-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="flex items-center px-4 py-2 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-all duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 mr-3 group-hover:bg-[#FF4D67] transition-colors" />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-800/50">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4 px-4">
                {t('library')}
              </h2>
              <div className="space-y-0.5 px-2">
                <Link
                  href="/favorites"
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{t('favorites') || 'Favorites'}</span>
                </Link>
                <Link
                  href="/recently-played"
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('recentlyPlayed') || 'Recently Played'}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {isHovered && (
        <div className="mt-auto pt-4 border-t border-gray-800/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="px-4 py-4">
            <p className="text-[10px] text-gray-500 font-medium">
              © {new Date().getFullYear()} {t('allRightsReserved')}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
