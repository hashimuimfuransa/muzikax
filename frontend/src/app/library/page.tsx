'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'
import { getUserProfile, getUserFollowers, getUserFollowing, getCreatorTracks } from '@/services/userService'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface UserProfile {
  _id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  followersCount?: number
  followingCount?: number
  creatorType?: string
  role?: string
  genres?: string[]
  whatsappContact?: string
}

interface Track {
  _id: string
  title: string
  artist: string
  coverURL?: string
  plays?: number
  likes?: number
  type?: 'song' | 'beat' | 'mix'
}

interface AnalyticsData {
  totalTracks: number
  totalPlays: number
  totalUniquePlays: number
  monthlyListeners: number
  totalLikes: number
  topCountries: { country: string; count: number }[]
}

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  role: string
  creatorType?: string
  followersCount: number
  followingCount: number
  bio?: string
}

type TabType = 'overview' | 'tracks' | 'analytics' | 'followers' | 'following'

export default function LibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { logout, isLoading: isAuthLoading } = useAuth()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Get tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType
    if (tab && ['overview', 'tracks', 'analytics', 'followers', 'following'].includes(tab)) {
      setActiveTab(tab)
    } else {
      setActiveTab('overview')
    }
  }, [searchParams])

  // Fetch all data on mount
  useEffect(() => {
    if (isAuthLoading) return

    let isMounted = true
    
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        
        if (!token) {
          router.push('/auth/login?redirect=/library')
          setLoading(false)
          return
        }

        // Fetch user profile using dedicated service
        const userProfile = await getUserProfile()
        if (!userProfile) {
          router.push('/auth/login?redirect=/library')
          setLoading(false)
          return
        }
        
        const currentProfile = {
          _id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          avatar: userProfile.avatar,
          bio: userProfile.bio,
          followersCount: userProfile.followersCount || 0,
          followingCount: userProfile.followingCount || 0,
          creatorType: userProfile.creatorType,
          role: userProfile.role,
          genres: userProfile.genres,
          whatsappContact: userProfile.whatsappContact
        }
        
        if (isMounted) {
          setProfile(currentProfile)
        }

        // Fetch tracks using dedicated service
        try {
          const tracksData = await getCreatorTracks()
          if (isMounted) setTracks(tracksData)
        } catch (err) {
          console.error('Error fetching tracks:', err)
        }

        // Fetch analytics (only for creators)
        try {
          const analyticsResponse = await fetch(`${API_BASE_URL}/api/creator/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            if (isMounted) setAnalytics(analyticsData)
          }
        } catch (err) {
          console.error('Error fetching analytics:', err)
        }

        // Fetch followers and following using the current profile ID
        if (currentProfile._id) {
          try {
            const followersData = await getUserFollowers(currentProfile._id)
            if (isMounted) setFollowers(followersData)
          } catch (err) {
            console.error('Error fetching followers:', err)
          }

          try {
            const followingData = await getUserFollowing(currentProfile._id)
            if (isMounted) setFollowing(followingData)
          } catch (err) {
            console.error('Error fetching following:', err)
          }
        }

        // Fetch recently played from localStorage
        try {
          const storedRecentlyPlayed = localStorage.getItem('recentlyPlayed')
          if (storedRecentlyPlayed) {
            const parsed = JSON.parse(storedRecentlyPlayed)
            if (isMounted) setRecentlyPlayed(parsed.slice(0, 10)) // Get last 10
          }
        } catch (err) {
          console.error('Error fetching recently played:', err)
        }

      } catch (err) {
        console.error('Error fetching library data:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [router, isAuthLoading])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4D67]"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading your library...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your library</p>
          <button
            onClick={() => router.push('/auth/login?redirect=/library')}
            className="inline-block bg-[#FF4D67] hover:bg-[#FF4D67]/80 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black pb-20 pt-14 md:pt-0">
      {/* Header - Desktop & Mobile */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">My Library</h1>
              <p className="text-sm text-gray-400">Manage your music and profile</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold py-2 px-4 rounded-lg transition-all active:scale-95 border border-red-600/20"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Summary Card - Enhanced for Desktop */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-[#FF4D67]/10 to-[#FFCB2B]/10 backdrop-blur-sm rounded-2xl border border-[#FF4D67]/20 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF4D67]/40 flex-shrink-0">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center text-white font-bold text-xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">{profile.name}</h2>
                <p className="text-sm text-gray-400">{profile.email}</p>
                {profile.role === 'creator' && (
                  <span className="inline-block mt-1 text-xs px-2 py-1 bg-[#FF4D67]/20 text-[#FF4D67] rounded-full font-medium">
                    {profile.creatorType || 'Creator'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Quick Stats - Desktop Layout */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-0 md:border-l md:border-[#FF4D67]/20 md:pl-6">
              <div className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/library?tab=tracks')}>
                <p className="text-2xl md:text-3xl font-black text-white">{tracks.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Tracks</p>
              </div>
              <div className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/library?tab=followers')}>
                <p className="text-2xl md:text-3xl font-black text-white">{(profile.followersCount || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Followers</p>
              </div>
              <div className="text-center cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/library?tab=following')}>
                <p className="text-2xl md:text-3xl font-black text-white">{(profile.followingCount || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {/* My Tracks */}
          <button
            onClick={() => router.push('/library?tab=tracks')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#FFCB2B]/15 to-[#FFCB2B]/5 border border-[#FFCB2B]/30 hover:border-[#FFCB2B]/50 transition-all group active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#FFCB2B]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#FFCB2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">My Tracks</span>
              <span className="text-xs text-gray-400 mt-1">{tracks.length} songs</span>
            </div>
          </button>

          {/* Analytics */}
          <button
            onClick={() => router.push('/library?tab=analytics')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#6366F1]/15 to-[#6366F1]/5 border border-[#6366F1]/30 hover:border-[#6366F1]/50 transition-all group active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#6366F1]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Analytics</span>
              <span className="text-xs text-gray-400 mt-1">Insights</span>
            </div>
          </button>

          {/* Followers */}
          <button
            onClick={() => router.push('/library?tab=followers')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#10B981]/15 to-[#10B981]/5 border border-[#10B981]/30 hover:border-[#10B981]/50 transition-all group active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Followers</span>
              <span className="text-xs text-gray-400 mt-1">{(profile.followersCount || 0).toLocaleString()}</span>
            </div>
          </button>

          {/* Following */}
          <button
            onClick={() => router.push('/library?tab=following')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#EF4444]/15 to-[#EF4444]/5 border border-[#EF4444]/30 hover:border-[#EF4444]/50 transition-all group active:scale-[0.98]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#EF4444]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Following</span>
              <span className="text-xs text-gray-400 mt-1">{(profile.followingCount || 0).toLocaleString()}</span>
            </div>
          </button>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => router.push('/edit-profile')}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#FF4D67]/15 to-[#FF4D67]/5 border border-[#FF4D67]/30 hover:border-[#FF4D67]/50 transition-all group active:scale-[0.98] mb-6 flex items-center justify-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-[#FF4D67]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span className="text-base font-semibold text-white">Edit Profile</span>
        </button>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">Recently Played</h3>
              <button
                onClick={() => router.push('/history')}
                className="text-xs text-[#FF4D67] hover:text-[#FF4D67]/80 font-medium"
              >
                See All
              </button>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide -mx-4 px-4">
              {recentlyPlayed.map((track) => (
                <div
                  key={track._id}
                  className="flex-shrink-0 w-36 bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer group"
                  onClick={() => router.push(`/player?id=${track._id}`)}
                >
                  <div className="relative mb-3">
                    <img
                      src={track.coverURL || '/default-cover.jpg'}
                      alt={track.title}
                      className="w-full aspect-square object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                  <p className="text-xs text-gray-400 truncate mt-1">{track.artist}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation - Mobile Bottom Bar Style */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/98 backdrop-blur-lg border-t border-gray-800 z-50 md:hidden">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            <button
              onClick={() => router.push('/library?tab=overview')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                activeTab === 'overview' 
                  ? 'bg-[#FF4D67]/20 text-[#FF4D67]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-medium">Home</span>
            </button>
            
            <button
              onClick={() => router.push('/library?tab=tracks')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                activeTab === 'tracks' 
                  ? 'bg-[#FFCB2B]/20 text-[#FFCB2B]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="text-[10px] font-medium">Tracks</span>
            </button>
            
            <button
              onClick={() => router.push('/library?tab=analytics')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                activeTab === 'analytics' 
                  ? 'bg-[#6366F1]/20 text-[#6366F1]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-[10px] font-medium">Stats</span>
            </button>
            
            <button
              onClick={() => router.push('/library?tab=followers')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                activeTab === 'followers' 
                  ? 'bg-[#10B981]/20 text-[#10B981]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-[10px] font-medium">Fans</span>
            </button>
            
            <button
              onClick={() => router.push('/library?tab=following')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                activeTab === 'following' 
                  ? 'bg-[#EF4444]/20 text-[#EF4444]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-[10px] font-medium">Following</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/edit-profile')}
                className="bg-gradient-to-br from-[#FF4D67]/20 to-[#FF4D67]/10 backdrop-blur-sm rounded-2xl p-5 border border-[#FF4D67]/30 hover:border-[#FF4D67]/50 transition-all active:scale-[0.98]"
              >
                <svg className="w-8 h-8 text-[#FF4D67] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="font-bold text-white mb-1">Edit Profile</h3>
                <p className="text-xs text-gray-400">Update your info</p>
              </button>
              
              <button
                onClick={() => router.push('/upload')}
                className="bg-gradient-to-br from-[#FFCB2B]/20 to-[#FFCB2B]/10 backdrop-blur-sm rounded-2xl p-5 border border-[#FFCB2B]/30 hover:border-[#FFCB2B]/50 transition-all active:scale-[0.98]"
              >
                <svg className="w-8 h-8 text-[#FFCB2B] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <h3 className="font-bold text-white mb-1">Upload</h3>
                <p className="text-xs text-gray-400">New track</p>
              </button>
            </div>

            {/* Recent Tracks Preview */}
            {tracks.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Your Tracks</h3>
                  <button
                    onClick={() => router.push('/library?tab=tracks')}
                    className="text-[#FF4D67] text-sm font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {tracks.slice(0, 3).map((track) => (
                    <Link
                      key={track._id}
                      href={`/tracks/${track._id}`}
                      className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={track.coverURL || '/placeholder-cover.jpg'} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate text-sm">{track.title}</p>
                        <p className="text-xs text-gray-400">{track.plays || 0} plays</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Preview */}
            {analytics && (
              <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 backdrop-blur-sm rounded-2xl border border-[#6366F1]/30 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Analytics</h3>
                  <button
                    onClick={() => router.push('/library?tab=analytics')}
                    className="text-[#6366F1] text-sm font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-2xl font-black text-white">{analytics.totalPlays.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Plays</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-2xl font-black text-white">{analytics.monthlyListeners.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Monthly</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracks' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Your Tracks</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} uploaded
                </p>
              </div>
              <button
                onClick={() => router.push('/upload')}
                className="bg-[#FF4D67] hover:bg-[#FF4D67]/90 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload New
              </button>
            </div>
            
            {tracks.length > 0 ? (
              <>
                {/* Refresh indicator */}
                <div className="flex justify-end mb-3">
                  <button
                    onClick={async () => {
                      setLoading(true)
                      try {
                        const tracksData = await getCreatorTracks()
                        setTracks(tracksData)
                      } catch (err) {
                        console.error('Error refreshing tracks:', err)
                      }
                      setLoading(false)
                    }}
                    disabled={loading}
                    className="text-xs text-[#FF4D67] hover:text-[#FF4D67]/80 font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {tracks.map((track) => (
                  <Link
                    key={track._id}
                    href={`/tracks/${track._id}`}
                    className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:bg-gray-800/50 hover:border-[#FF4D67]/40 transition-all duration-300"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img src={track.coverURL || '/placeholder-cover.jpg'} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-[#FF4D67] text-[10px] md:text-xs font-black text-white uppercase rounded">
                          {track.type || 'Track'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-bold text-white group-hover:text-[#FF4D67] transition-colors truncate text-sm md:text-base">
                        {track.title}
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm mt-1">
                        {track.plays || 0} plays • {track.likes || 0} likes
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              </>
            ) : (
              <div className="text-center py-16 bg-gray-800/10 rounded-2xl border border-dashed border-gray-700/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center text-gray-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No tracks yet</h3>
                <p className="text-gray-500 text-sm mb-4">Start uploading your music!</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="bg-[#FF4D67] hover:bg-[#FF4D67]/90 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
                >
                  Upload First Track
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            {analytics ? (
              <>
                <h2 className="text-xl font-bold text-white mb-4">Analytics Dashboard</h2>
                
                {/* Overview Stats - Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-[#FF4D67]/10 to-[#FF4D67]/5 rounded-2xl p-5 border border-[#FF4D67]/20">
                    <p className="text-2xl font-black text-white mb-1">{analytics.totalPlays.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total Plays</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 rounded-2xl p-5 border border-[#10B981]/20">
                    <p className="text-2xl font-black text-white mb-1">{analytics.monthlyListeners.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Monthly Listeners</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5 rounded-2xl p-5 border border-[#EF4444]/20">
                    <p className="text-2xl font-black text-white mb-1">{analytics.totalUniquePlays.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Unique Listeners</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5 rounded-2xl p-5 border border-[#8B5CF6]/20">
                    <p className="text-2xl font-black text-white mb-1">{analytics.totalLikes.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total Likes</p>
                  </div>
                </div>

                {/* Top Countries - Responsive Layout */}
                {analytics.topCountries && analytics.topCountries.length > 0 && (
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-5">
                    <h3 className="font-bold text-white mb-4">Top Countries</h3>
                    <div className="space-y-3">
                      {analytics.topCountries.slice(0, 5).map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-white">{item.country}</span>
                            <span className="text-xs text-gray-400">{item.count.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                              style={{ width: `${(item.count / analytics.topCountries[0].count) * 100}%` }}
                            ></div>
                          </div>
                        </div>))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-gray-800/10 rounded-2xl border border-dashed border-gray-700/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center text-gray-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Analytics Not Available</h3>
                <p className="text-gray-500 text-sm">Only available for creators and DJs</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Your Followers</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {followers.length} {followers.length === 1 ? 'follower' : 'followers'}
                </p>
              </div>
              <button
                onClick={async () => {
                  if (profile && profile._id) {
                    setLoading(true)
                    try {
                      const followersData = await getUserFollowers(profile._id)
                      setFollowers(followersData)
                    } catch (err) {
                      console.error('Error refreshing followers:', err)
                    }
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="text-xs text-[#FF4D67] hover:text-[#FF4D67]/80 font-medium flex items-center gap-1 disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            
            {followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {followers.map((follower) => (
                  <Link
                    key={follower._id}
                    href={`/profile/${follower._id}`}
                    className="flex items-center gap-3 p-4 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 hover:bg-gray-800/50 hover:border-[#FF4D67]/40 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700">
                      {follower.avatar ? (
                        <img src={follower.avatar} alt={follower.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center text-white font-bold">
                          {follower.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{follower.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{follower.email}</p>
                      {follower.role === 'creator' && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-[#FF4D67]/20 text-[#FF4D67] rounded-full font-medium">
                          {follower.creatorType || 'Creator'}
                        </span>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-800/10 rounded-2xl border border-dashed border-gray-700/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center text-gray-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Followers Yet</h3>
                <p className="text-gray-500 text-sm mb-4">Keep creating great music!</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="bg-[#FF4D67] hover:bg-[#FF4D67]/90 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
                >
                  Upload Music
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Following</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {following.length} {following.length === 1 ? 'creator' : 'creators'}
                </p>
              </div>
              <button
                onClick={async () => {
                  if (profile && profile._id) {
                    setLoading(true)
                    try {
                      const followingData = await getUserFollowing(profile._id)
                      setFollowing(followingData)
                    } catch (err) {
                      console.error('Error refreshing following:', err)
                    }
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="text-xs text-[#FF4D67] hover:text-[#FF4D67]/80 font-medium flex items-center gap-1 disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-4 hidden"></h2>
            
            {following.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {following.map((creator) => (
                  <Link
                    key={creator._id}
                    href={`/profile/${creator._id}`}
                    className="flex items-center gap-3 p-4 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 hover:bg-gray-800/50 hover:border-[#FF4D67]/40 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700">
                      {creator.avatar ? (
                        <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center text-white font-bold">
                          {creator.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{creator.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{creator.email}</p>
                      {creator.role === 'creator' && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-[#FF4D67]/20 text-[#FF4D67] rounded-full font-medium">
                          {creator.creatorType || 'Creator'}
                        </span>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-800/10 rounded-2xl border border-dashed border-gray-700/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center text-gray-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Not Following Anyone</h3>
                <p className="text-gray-500 text-sm mb-4">Discover amazing creators!</p>
                <button
                  onClick={() => router.push('/explore')}
                  className="bg-[#FF4D67] hover:bg-[#FF4D67]/90 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
                >
                  Discover Creators
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button - Quick Actions */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden">
        <button
          onClick={() => router.push('/upload')}
          className="w-14 h-14 bg-gradient-to-r from-[#FF4D67] to-[#FF3352] rounded-full shadow-lg shadow-[#FF4D67]/40 flex items-center justify-center active:scale-90 transition-transform border-2 border-white/20"
          aria-label="Upload Track"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}

