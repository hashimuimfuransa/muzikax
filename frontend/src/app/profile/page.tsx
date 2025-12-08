'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites'>('profile')
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Don't render the profile if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4">
              Your Profile
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="card-bg rounded-2xl p-6 sm:p-8 mb-8 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{user?.name || 'User'}</h2>
                <p className="text-gray-400 mb-2">{user?.email || 'user@example.com'}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-xs sm:text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  {user?.role === 'creator' ? 'Creator Account' : 'Fan Account'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-bg rounded-xl p-4 border border-gray-700/30">
                <h3 className="text-gray-400 text-sm mb-1">Member Since</h3>
                <p className="text-white font-medium">January 2024</p>
              </div>
              <div className="card-bg rounded-xl p-4 border border-gray-700/30">
                <h3 className="text-gray-400 text-sm mb-1">Favorite Genres</h3>
                <p className="text-white font-medium">Afrobeat, Hip Hop</p>
              </div>
              <div className="card-bg rounded-xl p-4 border border-gray-700/30">
                <h3 className="text-gray-400 text-sm mb-1">Following</h3>
                <p className="text-white font-medium">24 Creators</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800 mb-6">
            <button
              className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${
                activeTab === 'profile'
                  ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Settings
            </button>
            <Link 
              href="/favorites"
              className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${
                activeTab === 'favorites'
                  ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Favorites
            </Link>
          </div>

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="card-bg rounded-2xl p-6 sm:p-8 border border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6">Account Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    defaultValue={user?.name || ''}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                  />
                </div>

                {user?.role !== 'creator' && (
                  <div className="card-bg rounded-xl p-4 border-l-4 border-[#FFCB2B]">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#FFCB2B]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                      </svg>
                      Want to become a creator?
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400 mb-3">
                      Upgrade your account to upload music and connect with fans.
                    </p>
                    <button 
                      onClick={() => router.push('/upload')}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs sm:text-sm font-medium transition-colors"
                    >
                      Upgrade to Creator
                    </button>
                  </div>
                )}

                <div className="flex justify-end">
                  <button className="px-5 py-2.5 sm:px-6 sm:py-3 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  )
}