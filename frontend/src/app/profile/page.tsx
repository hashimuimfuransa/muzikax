'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'

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
  uniquePlays?: number
}

interface AnalyticsData {
  totalTracks: number
  totalPlays: number
  totalUniquePlays: number
  monthlyListeners: number
  totalLikes: number
  topCountries: { country: string; count: number }[]
}

interface RecentlyPlayedTrack extends Track {
  playedAt: string
}

type ExpandedSection = 'about' | 'genres' | 'contact' | null

export default function MyProfile() {
  const router = useRouter()
  const { user, logout, fetchUserProfile, isLoading: isAuthLoading } = useAuth()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null)
  const [showBioFull, setShowBioFull] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [pullRefresh, setPullRefresh] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)

  // CSS Animations for smooth transitions
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideDown {
      from { 
        opacity: 0;
        transform: translateY(-10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
    .animate-slideDown {
      animation: slideDown 0.2s ease-out;
    }
  `

  // Track scroll position with optimized throttling
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Pull-to-refresh handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY > 0 && window.scrollY === 0) {
      const currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - touchStartY)
      setPullDistance(distance)
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 100 && !loading && !pullRefresh) {
      setPullRefresh(true)
      setPullDistance(0)
      
      // Refresh all data
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        if (token && user?.id) {
          // Fetch tracks
          const tracksResponse = await fetch(`${API_BASE_URL}/api/tracks/creator`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (tracksResponse.ok) {
            const tracksData = await tracksResponse.json()
            setTracks(tracksData.tracks || [])
          }
          
          // Fetch analytics
          const analyticsResponse = await fetch(`${API_BASE_URL}/api/creator/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            setAnalytics(analyticsData)
          }
          
          // Fetch recently played
          const recentlyPlayedResponse = await fetch(`${API_BASE_URL}/api/recently-played?userId=${user.id}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (recentlyPlayedResponse.ok) {
            const recentlyPlayedData = await recentlyPlayedResponse.json()
            setRecentlyPlayed(recentlyPlayedData.tracks || [])
          }
        }
      } catch (err) {
        console.error('Error refreshing data:', err)
      } finally {
        setTimeout(() => setPullRefresh(false), 500)
      }
    } else {
      setPullDistance(0)
    }
    setTouchStartY(0)
  }

  // Fetch profile data - use user data from AuthContext directly
  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (isAuthLoading) {
      console.log('AuthContext is still loading, waiting...')
      return
    }

    let isMounted = true // Track component mount status
    
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        // User data from AuthContext already has everything we need
        if (!user) {
          console.log('No user found after auth loaded, redirecting to login')
          router.push('/auth/login?redirect=/profile')
          return
        }

        console.log('Profile page - User from AuthContext:', user)
        console.log('Profile page - User role:', user.role)
        console.log('Profile page - User creatorType:', user.creatorType)
        
        // Convert user object to match our UserProfile interface
        setProfile({
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          followersCount: user.followersCount || 0,
          followingCount: user.followingCount || 0,
          creatorType: user.creatorType,
          role: user.role,
          genres: user.genres,
          whatsappContact: user.whatsappContact
        })

        let token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        
        if (!token || !user.id) {
          console.error('No token or user ID found')
          if (isMounted) setLoading(false)
          return
        }

        // Fetch user's tracks using the authenticated endpoint
        console.log('Fetching creator tracks...')
        try {
          const tracksResponse = await fetch(`${API_BASE_URL}/api/tracks/creator`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          console.log('Tracks response status:', tracksResponse.status)
          
          // Handle 503 Service Unavailable gracefully (backend temporarily down)
          if (tracksResponse.status === 503) {
            console.warn('Backend service temporarily unavailable. Using cached data.')
            if (isMounted) setTracks([]) // Set empty tracks instead of reloading
          } else if (tracksResponse.status === 401) {
            console.error('Unauthorized - Token may be expired. Attempting refresh...')
            // Token might be expired, try to refresh
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ refreshToken })
                })
                
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json()
                  localStorage.setItem('accessToken', refreshData.accessToken)
                  localStorage.setItem('refreshToken', refreshData.refreshToken)
                  token = refreshData.accessToken
                  
                  // Retry fetching tracks with new token
                  const retryTracksResponse = await fetch(`${API_BASE_URL}/api/tracks/creator`, {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  })
                  
                  if (retryTracksResponse.ok) {
                    const retryTracksData = await retryTracksResponse.json()
                    console.log('Fetched tracks after refresh:', retryTracksData)
                    if (isMounted) setTracks(retryTracksData.tracks || [])
                  } else {
                    console.error('Failed to fetch tracks after refresh:', retryTracksResponse.status)
                    const errorText = await retryTracksResponse.text()
                    console.error('Error response:', errorText)
                    if (isMounted) setTracks([])
                  }
                } else {
                  console.error('Token refresh failed')
                  if (isMounted) setTracks([])
                }
              } catch (refreshError) {
                console.error('Error during token refresh:', refreshError)
                if (isMounted) setTracks([])
              }
            } else {
              console.error('No refresh token available')
              if (isMounted) setTracks([])
            }
          } else if (tracksResponse.ok) {
            const tracksData = await tracksResponse.json()
            console.log('Fetched tracks:', tracksData)
            console.log('Number of tracks:', tracksData.tracks ? tracksData.tracks.length : 0)
            // Handle both array response and object with tracks property
            const tracksArray = Array.isArray(tracksData) ? tracksData : (tracksData.tracks || [])
            if (isMounted) setTracks(tracksArray)
          } else {
            console.error('Failed to fetch tracks:', tracksResponse.status)
            const errorText = await tracksResponse.text()
            console.error('Error response:', errorText)
            
            // If 403 or 401 after refresh, user might not be a creator
            if (tracksResponse.status === 403 || tracksResponse.status === 401) {
              console.warn('User may not have creator role. Current role:', user.role)
              // Don't set error state, just show empty tracks section
            }
            if (isMounted) setTracks([])
          }
        } catch (tracksError) {
          console.error('Error fetching tracks:', tracksError)
          if (isMounted) setTracks([])
        }
        
        // Fetch analytics - only creators will get successful response
        console.log('Fetching analytics for user...')
        try {
          const analyticsResponse = await fetch(`${API_BASE_URL}/api/creator/analytics`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            console.log('Fetched analytics:', analyticsData)
            if (isMounted) setAnalytics(analyticsData)
          } else if (analyticsResponse.status === 401 || analyticsResponse.status === 503) {
            console.log('Analytics not available (not a creator/DJ or backend unavailable)')
            // User is not a creator/DJ or backend is down
          } else {
            console.error('Analytics response not OK:', analyticsResponse.status)
          }
        } catch (err) {
          console.error('Error fetching analytics:', err)
          // Analytics failed but continue loading rest of page
        }
        
        // Fetch recently played
        try {
          const recentlyPlayedResponse = await fetch(`${API_BASE_URL}/api/recently-played?userId=${user.id}&limit=10`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (recentlyPlayedResponse.ok) {
            const recentlyPlayedData = await recentlyPlayedResponse.json()
            if (isMounted) setRecentlyPlayed(recentlyPlayedData.tracks || [])
          }
        } catch (err) {
          console.error('Error fetching recently played:', err)
        }
      } catch (err) {
        console.error('Error fetching profile data:', err)
        if (isMounted) setError(err instanceof Error ? err.message : 'An error occurred while loading your profile')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProfileData()
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false
    }
  }, [user, router, isAuthLoading])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.name || 'My Profile',
          text: `Check out my profile on MuzikaX`,
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Profile link copied to clipboard!')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Show loading state while AuthContext is initializing or profile data is loading
  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4D67]"></div>
          <p className="mt-4 text-gray-400 font-medium">
            {isAuthLoading ? 'Authenticating...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something Went Wrong</h2>
          <p className="text-gray-400 mb-6 max-w-md">{error}</p>
          <button
            onClick={() => router.push('/auth/login?redirect=/profile')}
            className="bg-[#FF4D67] hover:bg-[#FF4D67]/80 text-white font-bold py-2 px-6 rounded-lg transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your profile</p>
          <button
            onClick={() => router.push('/auth/login?redirect=/profile')}
            className="inline-block bg-[#FF4D67] hover:bg-[#FF4D67]/80 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const isCompact = scrollY > 200

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Custom Animations */}
      <style>{animationStyles}</style>
      
      {/* Pull-to-Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center pointer-events-none"
          style={{ transform: `translateY(${pullDistance - 100}px)` }}
        >
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 border-2 border-[#FF4D67] border-t-transparent rounded-full animate-spin ${pullRefresh ? '' : 'hidden'}`}></div>
              <span className="text-white font-bold text-sm">
                {pullRefresh ? 'Refreshing...' : 'Pull to refresh'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Sticky Profile Header with Smooth Scroll Effect */}
      <div 
        className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
          isCompact 
            ? 'bg-gray-900/98 backdrop-blur-xl shadow-2xl shadow-black/50 py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Top Bar with Back Button and Actions Menu */}
          <div className={`flex items-center justify-between transition-all duration-300 ${isCompact ? 'mb-2' : 'mb-4'}`}>
            {/* Back Button */}
            <Link href="/" className="text-gray-400 hover:text-[#FF4D67] text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>

            {/* Actions Menu Button (Mobile) with Proper Z-Index */}
            <div className="relative md:hidden z-50">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 text-gray-400 hover:text-white transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {/* Mobile Actions Dropdown with Backdrop */}
              {showActionsMenu && (
                <>
                  {/* Backdrop for better UX */}
                  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowActionsMenu(false)}></div>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 z-50 overflow-hidden animate-slideDown">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/edit-profile')
                          setShowActionsMenu(false)
                        }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <svg className="w-5 h-5 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                      {analytics && (
                        <button
                          onClick={() => {
                            router.push('/profile/analytics')
                            setShowActionsMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                        >
                          <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          View Analytics
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          await handleShare()
                          setShowActionsMenu(false)
                        }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <svg className="w-5 h-5 text-[#FFCB2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 1.342a4 4 0 11-8 0 4 4 0 018 0zm.016 4.658a4 4 0 11-8 0 4 4 0 018 0zm13.342-6.658a4 4 0 11-8 0 4 4 0 018 0zm.016 4.658a4 4 0 11-8 0 4 4 0 018 0zM17 9a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Share Profile
                      </button>
                      <hr className="my-2 border-gray-700" />
                      <button
                        onClick={async () => {
                          await handleLogout()
                          setShowActionsMenu(false)
                        }}
                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile Info with Smooth Transitions */}
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isCompact ? 'flex items-center gap-3 sm:gap-4' : 'flex items-start'
            }`}
          >
            {/* Avatar with Responsive Sizing */}
            <div 
              className={`relative group transition-all duration-300 ease-in-out transform ${
                isCompact ? 'w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 scale-95' : 'w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 scale-100'
              }`}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative rounded-full border-2 border-gray-900 overflow-hidden shadow-xl bg-gray-800">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
                    <span className={`${isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-black text-white transition-all duration-300`}>
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Name & Stats - Mobile Optimized */}
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isCompact ? 'py-2 pl-2 sm:pl-3' : 'mt-3 sm:mt-4 md:mt-6 ml-0'}`}>
              <h1 className={`${isCompact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-black text-white tracking-tight transition-all duration-300 leading-tight truncate`}>
                {profile.name}
              </h1>
              
              {!isCompact && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400 animate-fadeIn overflow-x-auto scrollbar-hide pb-1">
                  <div className="flex flex-col flex-shrink-0 cursor-pointer hover:bg-gray-800/50 rounded-lg p-1.5 sm:p-2 transition-all active:scale-95" onClick={() => router.push('/profile/tracks')}>
                    <span className="text-white font-bold text-sm sm:text-base">{tracks.length || 0}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium whitespace-nowrap">Tracks</span>
                  </div>
                  <div className="w-px h-6 sm:h-8 bg-gray-700/50 flex-shrink-0"></div>
                  <div className="flex flex-col flex-shrink-0 cursor-pointer hover:bg-gray-800/50 rounded-lg p-1.5 sm:p-2 transition-all active:scale-95" onClick={() => router.push('/profile/followers')}>
                    <span className="text-white font-bold text-sm sm:text-base">{(profile.followersCount || 0).toLocaleString()}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium whitespace-nowrap">Followers</span>
                  </div>
                  <div className="w-px h-6 sm:h-8 bg-gray-700/50 flex-shrink-0"></div>
                  <div className="flex flex-col flex-shrink-0 cursor-pointer hover:bg-gray-800/50 rounded-lg p-1.5 sm:p-2 transition-all active:scale-95" onClick={() => router.push('/profile/following')}>
                    <span className="text-white font-bold text-sm sm:text-base">{(profile.followingCount || 0).toLocaleString()}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium whitespace-nowrap">Following</span>
                  </div>
                  {analytics && (
                    <>
                      <div className="w-px h-6 sm:h-8 bg-gray-700/50 flex-shrink-0 hidden sm:block"></div>
                      <div className="hidden sm:flex flex-col flex-shrink-0 cursor-pointer hover:bg-gray-800/50 rounded-lg p-1.5 sm:p-2 transition-all active:scale-95" onClick={() => router.push('/profile/analytics')}>
                        <span className="text-white font-bold text-sm sm:text-base">{analytics.monthlyListeners.toLocaleString()}</span>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium whitespace-nowrap">Monthly</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Action Buttons - Fully Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 my-4 sm:my-6">
          <button 
            onClick={() => router.push('/edit-profile')}
            className="flex-1 bg-[#FF4D67] hover:bg-[#FF4D67]/90 text-white font-bold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all active:scale-95 shadow-lg shadow-[#FF4D67]/20 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </button>
          {analytics && (
            <button 
              onClick={() => router.push('/profile/analytics')}
              className="flex-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#6366F1]/90 hover:to-[#8B5CF6]/90 text-white font-bold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all active:scale-95 shadow-lg shadow-[#6366F1]/20 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">View Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </button>
          )}
          <button 
            onClick={handleShare}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all active:scale-95 border border-gray-700 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 1.342a4 4 0 11-8 0 4 4 0 018 0zm.016 4.658a4 4 0 11-8 0 4 4 0 018 0zm13.342-6.658a4 4 0 11-8 0 4 4 0 018 0zm.016 4.658a4 4 0 11-8 0 4 4 0 018 0zM17 9a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="hidden sm:inline">Share Profile</span>
            <span className="sm:hidden">Share</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all active:scale-95 border border-red-600/20 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Logout</span>
          </button>
        </div>

        {/* Collapsible Info Cards */}
        <div className="space-y-3 mb-10">
          {/* Analytics Summary for Creators */}
          {analytics && (
            <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 backdrop-blur-sm rounded-2xl border border-[#6366F1]/30 overflow-hidden">
              <div className="p-5 border-b border-[#6366F1]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-bold text-white text-lg">Your Analytics</span>
                  </div>
                  <button
                    onClick={() => router.push('/profile/analytics')}
                    className="text-[#6366F1] hover:text-[#8B5CF6] text-sm font-bold transition-colors flex items-center gap-1"
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-5">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-[#FF4D67]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Plays</span>
                  </div>
                  <p className="text-2xl font-black text-white">{analytics.totalPlays.toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Monthly Listeners</span>
                  </div>
                  <p className="text-2xl font-black text-white">{analytics.monthlyListeners.toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-[#EF4444]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Unique Listeners</span>
                  </div>
                  <p className="text-2xl font-black text-white">{analytics.totalUniquePlays.toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Likes</span>
                  </div>
                  <p className="text-2xl font-black text-white">{analytics.totalLikes.toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-[#FFCB2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tracks</span>
                  </div>
                  <p className="text-2xl font-black text-white">{analytics.totalTracks}</p>
                </div>
              </div>
              
              {analytics.topCountries && analytics.topCountries.length > 0 && (
                <div className="px-5 pb-5 pt-2 border-t border-[#6366F1]/20">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Top Countries</h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.topCountries.slice(0, 5).map((item, idx) => (
                      <span key={idx} className="bg-gray-800/80 text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-700/50 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></span>
                        {item.country}: {item.count.toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* About Section */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-bold text-white">About</span>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedSection === 'about' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSection === 'about' && (
              <div className="px-5 pb-5 pt-0 border-t border-gray-700/30">
                {profile.bio ? (
                  <>
                    <p className={`text-gray-400 leading-relaxed mt-4 text-sm ${!showBioFull && 'line-clamp-3'}`}>
                      "{profile.bio}"
                    </p>
                    {profile.bio.length > 150 && (
                      <button
                        onClick={() => setShowBioFull(!showBioFull)}
                        className="text-[#FF4D67] text-sm font-bold mt-2 hover:underline"
                      >
                        {showBioFull ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic text-sm mt-4">No bio added yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Genres Section */}
          {profile.genres && profile.genres.length > 0 && (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'genres' ? null : 'genres')}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="font-bold text-white">Genres</span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedSection === 'genres' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSection === 'genres' && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-700/30">
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.genres.map((genre, idx) => (
                      <span key={idx} className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-700/50 font-medium">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact Section */}
          {profile.whatsappContact && (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'contact' ? null : 'contact')}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.524.909 3.284 1.389 5.083 1.391 5.646.003 10.243-4.591 10.246-10.238.002-2.737-1.065-5.307-3.001-7.245-1.936-1.938-4.505-3.007-7.244-3.008-5.647 0-10.243 4.595-10.246 10.242-.001 1.93.52 3.811 1.507 5.435l.165.271-1.084 3.957 4.074-1.065zm10.59-6.345c-.277-.139-1.638-.809-1.892-.901-.254-.093-.439-.139-.624.139-.185.277-.717.901-.878 1.086-.161.185-.323.208-.6.069-.277-.139-1.17-.431-2.228-1.374-.824-.735-1.38-1.644-1.542-1.921-.162-.277-.017-.427.121-.565.125-.124.277-.323.416-.485.139-.161.185-.277.277-.462.093-.185.046-.347-.023-.485-.069-.139-.624-1.503-.855-2.057-.225-.541-.45-.467-.624-.476-.161-.008-.347-.01-.532-.01-.185 0-.485.069-.739.347-.254.277-.971.948-.971 2.312 0 1.364.993 2.682 1.132 2.867.139.185 1.953 2.982 4.731 4.183.661.286 1.177.457 1.579.585.663.211 1.267.181 1.744.11.533-.08 1.638-.67 1.869-1.318.231-.647.231-1.202.162-1.318-.069-.116-.254-.185-.531-.324z" />
                  </svg>
                  <span className="font-bold text-white">WhatsApp Contact</span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedSection === 'contact' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSection === 'contact' && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-700/30">
                  <p className="text-gray-300 text-sm mt-4 font-mono">{profile.whatsappContact}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recently Played - Horizontal Scroll */}
        {recentlyPlayed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-white tracking-tight mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#FF4D67]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Recently Played
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {recentlyPlayed.slice(0, 10).map((track) => (
                <Link
                  key={track._id}
                  href={`/tracks/${track._id}`}
                  className="flex-shrink-0 w-40 group bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:bg-gray-800/50 hover:border-[#FF4D67]/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={track.coverURL || '/placeholder-cover.jpg'}
                      alt={track.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-cover.jpg'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-white group-hover:text-[#FF4D67] transition-colors truncate text-sm">
                      {track.title}
                    </h3>
                    <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Tracks Grid */}
        <div>
          <h2 className="text-xl font-black text-white tracking-tight mb-6">
            {recentlyPlayed.length > 0 ? 'Your Tracks' : 'Your Activity'}
          </h2>

          {tracks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map((track) => (
                <Link
                  key={track._id}
                  href={`/tracks/${track._id}`}
                  className="group flex flex-col bg-gray-800/20 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:bg-gray-800/40 hover:border-[#FF4D67]/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#FF4D67]/5"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={track.coverURL || '/placeholder-cover.jpg'}
                      alt={track.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-cover.jpg'
                      }}
                    />
                    <div className="absolute bottom-3 left-3 flex gap-1">
                      <span className="px-2 py-0.5 bg-[#FF4D67] text-[9px] font-black text-white uppercase rounded">
                        {track.type || 'Track'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-white group-hover:text-[#FF4D67] transition-colors mb-1 truncate text-sm">
                      {track.title}
                    </h3>
                    <p className="text-gray-400 text-xs truncate mb-4">{track.artist}</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-3 border-t border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#FF4D67]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          {track.plays || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          {track.likes || 0}
                        </span>
                      </div>
                      <span className="text-[#FF4D67]">Play →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800/10 rounded-2xl border border-dashed border-gray-700/50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center text-gray-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No tracks yet</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">Start uploading your music to share with the world!</p>
              <button
                onClick={() => router.push('/upload')}
                className="bg-[#FF4D67] hover:bg-[#FF4D67]/90 text-white font-bold py-3 px-8 rounded-2xl transition-all active:scale-95 shadow-lg shadow-[#FF4D67]/20"
              >
                Upload Your First Track
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
