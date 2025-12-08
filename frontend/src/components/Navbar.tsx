'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, userRole, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('') // Add search state

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page with query parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B]">
              MUZIKAX
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6 sm:space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Home
              </Link>
              <Link href="/explore" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Explore
              </Link>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search music, artists, albums..."
                  className="w-48 sm:w-64 px-4 py-1.5 sm:py-2 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent text-sm transition-all"
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

          {/* Auth Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                    Profile
                  </Link>
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Search icon for mobile */}
            <button
              onClick={() => router.push('/search')}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            
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
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
            Home
          </Link>
          <Link href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
            Explore
          </Link>
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
                  <Link href="/profile" className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white">
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white">
                    Login
                  </Link>
                  <Link href="/login" className="w-full text-center ml-3 px-4 py-2 btn-primary">
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