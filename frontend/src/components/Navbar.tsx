'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
              <Link href="/upload" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Upload
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                Login
              </Link>
              <Link href="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 btn-primary text-sm">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
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
          <Link href="/upload" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
            Upload
          </Link>
          <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800">
            Dashboard
          </Link>
          <div className="pt-4 pb-3 border-t border-gray-800">
            <div className="flex items-center px-5">
              <Link href="/login" className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white">
                Login
              </Link>
              <Link href="/login" className="w-full text-center ml-3 px-4 py-2 btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}