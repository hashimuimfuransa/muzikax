'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

interface NavItem {
  name: string
  href: string
  icon: string
  category?: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Analytics', href: '/admin/analytics', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Messages', href: '/admin/messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Content', href: '/admin/content', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
    { name: 'Playlists', href: '/admin/playlists', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
    { name: 'Monetization', href: '/admin/monetization', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Notifications', href: '/admin/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { name: 'Reports', href: '/admin/reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Modern Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        } bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-black/95 backdrop-blur-xl border-r border-gray-800/50 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : ''} border-b border-gray-800/50`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#FF4D67]/30">
                A
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] text-xl">
                    MuzikaX
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-[#FF4D67]/20 to-[#FFCB2B]/10 text-white border border-[#FF4D67]/30 shadow-lg shadow-[#FF4D67]/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active Indicator */}
                {pathname === item.href && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#FF4D67] to-[#FFCB2B] rounded-r-full" />
                )}
                
                <svg 
                  className={`w-6 h-6 flex-shrink-0 transition-transform duration-200 ${
                    pathname === item.href ? 'scale-110' : 'group-hover:scale-110'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                </svg>
                
                {!isCollapsed && (
                  <span className={`font-medium text-sm ${pathname === item.href ? 'text-white' : ''}`}>
                    {item.name}
                  </span>
                )}

                {/* Hover Effect */}
                {!isCollapsed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className={`p-4 border-t border-gray-800/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <button
              onClick={logout}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all duration-200 w-full ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-200 z-50"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out min-h-screen ${
          isCollapsed ? 'md:ml-20' : 'md:ml-72'
        }`}
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
