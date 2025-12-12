'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { fetchCreatorAnalytics, fetchCreatorTracks } from '../../services/creatorService'
import { getAlbumsByCreator, deleteAlbum } from '../../services/albumService'
import { deleteTrack } from '../../services/trackService'
import { ITrack } from '../../types'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'

interface CreatorAnalytics {
  totalTracks: number
  totalPlays: number
  totalLikes: number
  tracks: number
}

interface ProfileAlbum {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  year: number;
  tracks: number;
  createdAt: string;
}

// Extend the Album interface to match backend data structure
interface Album {
  _id: string;
  id: string;
  title: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
  } | string;
  coverURL: string;
  releaseDate: string;
  tracks: Array<any>;
  createdAt: string;
  updatedAt: string;
}

// Add User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  followersCount?: number;
  // Add other user properties as needed
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'analytics' | 'tracks' | 'albums'>('profile')
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null)
  const [tracks, setTracks] = useState<ITrack[]>([])
  const [albums, setAlbums] = useState<ProfileAlbum[]>([])
  const [filteredTracks, setFilteredTracks] = useState<ITrack[]>([])
  const [filteredAlbums, setFilteredAlbums] = useState<ProfileAlbum[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [loadingAlbums, setLoadingAlbums] = useState(false)
  const [tracksPage, setTracksPage] = useState(1)
  const [tracksTotalPages, setTracksTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{type: 'track' | 'album', id: string, title: string} | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bio, setBio] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [newGenre, setNewGenre] = useState('')
  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist } = useAudioPlayer()
  const router = useRouter()
  const { isAuthenticated, user, isLoading, updateProfile } = useAuth()

  // Check authentication on component mount
  useEffect(() => {
    // Don't redirect while loading
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      router.push('/login')
    }
  }, [isAuthenticated, router, isLoading]) // Add isLoading to dependency array

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setBio(user.bio || '')
      setGenres(user.genres || [])
      
      // Fetch analytics for creators
      if (user.role === 'creator') {
        fetchAnalytics()
        fetchTracks(1)
        fetchAlbums()
      }
    }
  }, [isAuthenticated, user])

  // Listen for track updates (when favorites are added/removed)
  useEffect(() => {
    const handleTrackUpdate = (event: CustomEvent) => {
      const detail = event.detail;
      if (detail && detail.trackId) {
        // Also refresh analytics since total likes may have changed
        fetchAnalytics()
      }
    };
    
    // Listen for analytics updates specifically
    const handleAnalyticsUpdate = () => {
      fetchAnalytics();
    };

    // Add event listeners
    window.addEventListener('trackUpdated', handleTrackUpdate as EventListener);
    window.addEventListener('analyticsUpdated', handleAnalyticsUpdate);

    // Clean up event listeners
    return () => {
      window.removeEventListener('trackUpdated', handleTrackUpdate as EventListener);
      window.removeEventListener('analyticsUpdated', handleAnalyticsUpdate);
    }
  }, [user, tracksPage]);

  const fetchAnalytics = async () => {
    if (!user || user.role !== 'creator') return
    
    setLoadingAnalytics(true)
    setError(null)
    
    try {
      const data = await fetchCreatorAnalytics()
      setAnalytics(data)
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err)
      setError(`Failed to fetch analytics: ${err.message || 'Unknown error'}`)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const fetchTracks = async (page: number = 1) => {
    if (!user || user.role !== 'creator') return
    
    setLoadingTracks(true)
    setError(null)
    
    try {
      const data = await fetchCreatorTracks(page, 6) // 6 items per page
      setTracks(data.tracks)
      setFilteredTracks(data.tracks)
      setTracksTotalPages(data.pages)
      setTracksPage(data.page)
    } catch (err: any) {
      console.error('Failed to fetch tracks:', err)
      setError(`Failed to fetch tracks: ${err.message || 'Unknown error'}`)
    } finally {
      setLoadingTracks(false)
    }
  }

  const fetchAlbums = async () => {
    if (!user || user.role !== 'creator') return
  
    setLoadingAlbums(true)
    setError(null)
    
    try {
      const albumsData = await getAlbumsByCreator(user.id) // Pass actual user ID instead of empty string
      // Transform the data to match our interface
      const transformedAlbums = albumsData.map((album: any) => ({
        id: album._id,
        title: album.title,
        artist: typeof album.creatorId === 'object' ? album.creatorId.name : 'Unknown Artist',
        coverImage: album.coverURL,
        year: new Date(album.releaseDate || album.createdAt).getFullYear(),
        tracks: album.tracks?.length || 0,
        createdAt: album.createdAt
      }))
      setAlbums(transformedAlbums)
      setFilteredAlbums(transformedAlbums)
    } catch (err: any) {
      console.error('Failed to fetch albums:', err)
      setError(`Failed to fetch albums: ${err.message || 'Unknown error'}`)
    } finally {
      setLoadingAlbums(false)
    }
  }

  const handlePageChange = (newPage: number, type: 'tracks' | 'albums') => {
    if (type === 'tracks') {
      fetchTracks(newPage)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const form = e.target as HTMLFormElement
      const name = (form.elements.namedItem('name') as HTMLInputElement)?.value || ''
      const email = (form.elements.namedItem('email') as HTMLInputElement)?.value || ''
      const bio = (form.elements.namedItem('bio') as HTMLTextAreaElement)?.value || ''
      
      const currentPasswordInput = form.elements.namedItem('currentPassword') as HTMLInputElement
      const passwordInput = form.elements.namedItem('password') as HTMLInputElement
      
      const currentPassword = currentPasswordInput?.value || ''
      const password = passwordInput?.value || ''
      
      // Prepare update data
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        genres: genres // Use the genres from state directly
      }
      
      // Only include password fields if they have values
      if (currentPassword) {
        updateData.currentPassword = currentPassword
      }
      
      if (password) {
        updateData.password = password
      }
      
      // Call the update profile function from AuthContext
      const success = await updateProfile(updateData)
      
      if (success) {
        // Refresh tracks to show updated creator name
        if (user?.role === 'creator') {
          await fetchTracks()
        }
        
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile. Please try again.')
      }
      
      // Clear password fields
      if (currentPasswordInput) {
        currentPasswordInput.value = ''
      }
      if (passwordInput) {
        passwordInput.value = ''
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      // Show more specific error messages
      if (error.message && error.message.includes('duplicate key')) {
        alert('Email is already in use by another account')
      } else {
        alert(`Failed to update profile: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      if (itemToDelete.type === 'track') {
        // Delete track with token refresh
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${itemToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to delete track')
        }
        
        setTracks(prevTracks => prevTracks.filter(track => track._id !== itemToDelete.id))
        setFilteredTracks(prevFilteredTracks => prevFilteredTracks.filter(track => track._id !== itemToDelete.id))
      } else if (itemToDelete.type === 'album') {
        // Delete album with token refresh
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/${itemToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to delete album')
        }
        
        setAlbums(prevAlbums => prevAlbums.filter(album => album.id !== itemToDelete.id))
        setFilteredAlbums(prevFilteredAlbums => prevFilteredAlbums.filter(album => album.id !== itemToDelete.id))
      }
      setShowDeleteModal(false)
      setItemToDelete(null) // Clear the item to delete
    } catch (error: any) {
      console.error(`Failed to delete ${itemToDelete.type}:`, error)
      setError(`Failed to delete ${itemToDelete.type}: ${error.message || 'Unknown error'}`)
      // Keep the modal open so user can see the error
    }
  }

  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Don't render the profile if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-6 sm:py-8 md:py-12 overflow-x-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B]">
                {user?.role === 'creator' ? 'Creator Dashboard' : 'Your Profile'}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/playlists')}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                  </svg>
                  <span>Playlists</span>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('user');
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                    }
                    router.push('/login');
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FF4D67] text-[#FF4D67] hover:bg-[#FF4D67]/10 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {user?.role === 'creator' 
                ? 'Manage your content, view analytics, and engage with your audience' 
                : 'Manage your account settings and preferences'}
            </p>
          </div>

          {/* Profile Card */}
          <div className="card-bg rounded-2xl p-5 sm:p-6 mb-6 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center relative overflow-hidden">
                <span className="text-2xl sm:text-3xl font-bold text-white z-10">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{user?.name || 'User'}</h2>
                <p className="text-gray-400 mb-2 text-sm">{user?.email || 'user@example.com'}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  {user?.role === 'creator' ? 'Creator Account' : 'Fan Account'}
                </div>
                {user?.role === 'creator' && user?.creatorType && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-xs">
                    {user.creatorType.charAt(0).toUpperCase() + user.creatorType.slice(1)}
                  </div>
                )}
                {user?.role === 'creator' && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button 
                      onClick={() => router.push('/upload')}
                      className="px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path>
                      </svg>
                      Upload Track
                    </button>
                    <button 
                      onClick={() => router.push('/create-album')}
                      className="px-4 py-2 bg-[#FFCB2B] text-gray-900 rounded-lg hover:bg-[#FFCB2B]/80 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
                      </svg>
                      Create Album
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio Section */}
            {user?.role === 'creator' && (
              <div className="mb-5">
                <h3 className="text-gray-400 text-xs mb-2">Bio</h3>
                <p className="text-white text-sm">{bio || 'No bio added yet. Tell your fans about yourself!'}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="card-bg rounded-xl p-4 border border-gray-700/30">
                  <h3 className="text-gray-400 text-xs mb-1">Member Since</h3>
                  <p className="text-white font-medium text-sm">January 2024</p>
                </div>
                <div className="card-bg rounded-xl p-4 border border-gray-700/30">
                  <h3 className="text-gray-400 text-xs mb-1">Favorite Genres</h3>
                  <p className="text-white font-medium text-sm">
                    {genres && genres.length > 0 ? genres.join(', ') : 'Not specified'}
                  </p>
                </div>
                <div 
                  className="card-bg rounded-xl p-4 border border-gray-700/30 cursor-pointer hover:border-[#FF4D67]/50 transition-colors"
                  onClick={() => router.push('/community')}
                >
                  <h3 className="text-gray-400 text-xs mb-1">Followers</h3>
                  <p className="text-white font-medium text-sm">
                    {user?.followersCount?.toLocaleString() || '0'}
                  </p>
                </div>
                <div 
                  className="card-bg rounded-xl p-4 border border-gray-700/30 cursor-pointer hover:border-[#FFCB2B]/50 transition-colors"
                  onClick={() => router.push('/community')}
                >
                  <h3 className="text-gray-400 text-xs mb-1">Following</h3>
                  <p className="text-white font-medium text-sm">
                    {user?.followingCount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
          </div>

          {/* Quick Navigation Buttons - Added for easier access to key pages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => router.push('/recently-played')}
              className="card-bg rounded-xl p-4 border border-gray-700/30 hover:border-[#FF4D67] transition-colors flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF4D67]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-white font-medium text-sm">Recently Played</h3>
              <p className="text-gray-400 text-xs mt-1">View your listening history</p>
            </button>
            
            <button
              onClick={() => router.push('/favorites')}
              className="card-bg rounded-xl p-4 border border-gray-700/30 hover:border-[#FFCB2B] transition-colors flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#FFCB2B]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#FFCB2B]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-white font-medium text-sm">Favorites</h3>
              <p className="text-gray-400 text-xs mt-1">Your liked tracks</p>
            </button>
            
            <button
              onClick={() => setActiveTab('profile')}
              className="card-bg rounded-xl p-4 border border-gray-700/30 hover:border-[#6C63FF] transition-colors flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#6C63FF]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#6C63FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="text-white font-medium text-sm">Profile</h3>
              <p className="text-gray-400 text-xs mt-1">Account settings</p>
            </button>
          </div>

          {/* Tabs - Mobile Responsive */}
          <div className="flex overflow-x-auto border-b border-gray-800 mb-6 scrollbar-hide">
            <button
              className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
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
              className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === 'favorites'
                  ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Favorites
            </Link>
            {user?.role === 'creator' && (
              <>
                <button
                  className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                    activeTab === 'analytics'
                      ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>
                <button
                  className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                    activeTab === 'tracks'
                      ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('tracks')}
                >
                  My Tracks
                </button>
                <button
                  className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                    activeTab === 'albums'
                      ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('albums')}
                >
                  My Albums
                </button>
              </>
            )}
          </div>

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-5">Account Settings</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    defaultValue={user?.name || ''}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm"
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
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm"
                  />
                </div>

                {user?.role === 'creator' && (
                  <>
                    {/* Bio Field */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell your fans about yourself..."
                        className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm min-h-[100px]"
                      />
                    </div>

                    {/* Genres Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Favorite Genres
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {genres.map((genre, index) => (
                          <div key={index} className="flex items-center bg-gray-700 rounded-full px-3 py-1 text-sm">
                            <span className="text-white">{genre}</span>
                            <button 
                              type="button"
                              onClick={() => setGenres(genres.filter((_, i) => i !== index))}
                              className="ml-2 text-gray-400 hover:text-white"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          value={newGenre}
                          onChange={(e) => setNewGenre(e.target.value)}
                          placeholder="Add a genre..."
                          className="flex-1 px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-l-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newGenre.trim() && !genres.includes(newGenre.trim())) {
                                setGenres([...genres, newGenre.trim()]);
                                setNewGenre('');
                              }
                            }
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            if (newGenre.trim() && !genres.includes(newGenre.trim())) {
                              setGenres([...genres, newGenre.trim()]);
                              setNewGenre('');
                            }
                          }}
                          className="px-4 bg-[#FF4D67] text-white rounded-r-lg hover:bg-[#FF4D67]/80 transition-colors text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    placeholder="Enter current password"
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm"
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
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm"
                  />
                </div>

                {user?.role !== 'creator' && (
                  <div className="card-bg rounded-xl p-4 border-l-4 border-[#FFCB2B]">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#FFCB2B]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 101 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                      </svg>
                      Want to become a creator?
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                      Upgrade your account to upload music and connect with fans.
                    </p>
                    <button 
                      onClick={() => router.push('/upload')}
                      className="px-3 py-1.5 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs font-medium transition-colors"
                      type="button"
                    >
                      Upgrade to Creator
                    </button>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="px-5 py-2.5 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Creator Analytics Tab */}
          {activeTab === 'analytics' && user?.role === 'creator' && (
            <div className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-5">Performance Analytics</h3>
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-5">
                  <div className="text-red-300 text-sm">{error}</div>
                  <button 
                    onClick={fetchAnalytics}
                    className="mt-2 px-3 py-1.5 bg-red-700 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {loadingAnalytics ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-white text-sm">Loading analytics...</div>
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="card-bg rounded-xl p-5 border border-gray-700/30 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#FF4D67] mb-2">{analytics.totalTracks}</div>
                    <div className="text-gray-400 text-sm">Total Tracks</div>
                  </div>
                  <div className="card-bg rounded-xl p-5 border border-gray-700/30 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#FFCB2B] mb-2">{analytics.totalPlays.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Total Plays</div>
                  </div>
                  <div className="card-bg rounded-xl p-5 border border-gray-700/30 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#6C63FF] mb-2">{analytics.totalLikes.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Total Likes</div>
                  </div>
                </div>
              ) : !error ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No analytics data available
                </div>
              ) : null}
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                <div className="card-bg rounded-xl p-5 border border-gray-700/30">
                  <div className="text-center py-6 text-gray-400 text-sm">
                    Recent activity data will appear here
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Creator Tracks Tab */}
          {activeTab === 'tracks' && user?.role === 'creator' && (
            <div className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-5">My Tracks</h3>
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-5">
                  <div className="text-red-300 text-sm">{error}</div>
                  <button 
                    onClick={() => fetchTracks(tracksPage)}
                    className="mt-2 px-3 py-1.5 bg-red-700 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {loadingTracks ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-white text-sm">Loading tracks...</div>
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  You haven't uploaded any tracks yet
                </div>
              ) : (
                <>
                  {/* Search bar for tracks */}
                  <div className="mb-5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search your tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm"
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {filteredTracks.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {filteredTracks.map((track) => (
                          <div key={track._id} className="card-bg rounded-xl overflow-hidden border border-gray-700/30 hover:border-[#FF4D67]/50 transition-colors">
                            <div className="relative">
                              <img 
                                src={track.coverURL || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'} 
                                alt={track.title} 
                                className="w-full h-40 object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                <h3 className="font-bold text-white truncate">{track.title}</h3>
                              </div>
                              <button 
                                onClick={() => {
                                  playTrack({
                                    id: track._id,
                                    title: track.title,
                                    artist: typeof track.creatorId === 'object' && track.creatorId !== null ? (track.creatorId as any).name : 'Unknown Artist',
                                    coverImage: track.coverURL || '',
                                    audioUrl: track.audioURL,
                                    creatorId: typeof track.creatorId === 'object' && track.creatorId !== null ? (track.creatorId as any)._id : track.creatorId
                                  });
                                  
                                  // Set the current playlist to all user tracks
                                  const playlistTracks = tracks.map(t => ({
                                    id: t._id,
                                    title: t.title,
                                    artist: typeof t.creatorId === 'object' && t.creatorId !== null ? (t.creatorId as any).name : 'Unknown Artist',
                                    coverImage: t.coverURL || '',
                                    audioUrl: t.audioURL,
                                    creatorId: typeof t.creatorId === 'object' && t.creatorId !== null ? (t.creatorId as any)._id : t.creatorId
                                  }));
                                  
                                  setCurrentPlaylist(playlistTracks);
                                }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-[#FF4D67] transition-colors"
                              >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                                </svg>
                              </button>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-white truncate text-base">{track.title}</h4>
                              <div className="flex justify-between text-sm text-gray-400 mt-2">
                                <span>{track.plays.toLocaleString()} plays</span>
                                <span>{track.likes.toLocaleString()} likes</span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                                <span>{track.genre}</span>
                              </div>
                              <div className="flex justify-end mt-3 space-x-2">
                                <button 
                                  onClick={() => router.push(`/edit-track/${track._id}`)}
                                  className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs font-medium transition-colors"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => {
                                    setItemToDelete({
                                      type: 'track',
                                      id: track._id,
                                      title: track.title
                                    });
                                    setShowDeleteModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-red-700 text-white rounded hover:bg-red-600 text-xs font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {tracksTotalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6">
                          <button
                            onClick={() => handlePageChange(tracksPage - 1, 'tracks')}
                            disabled={tracksPage === 1}
                            className={`px-4 py-2 rounded-md text-sm ${
                              tracksPage === 1 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                          >
                            Previous
                          </button>
                          
                          <span className="text-white mx-2 text-sm">
                            Page {tracksPage} of {tracksTotalPages}
                          </span>
                          
                          <button
                            onClick={() => handlePageChange(tracksPage + 1, 'tracks')}
                            disabled={tracksPage === tracksTotalPages}
                            className={`px-4 py-2 rounded-md text-sm ${
                              tracksPage === tracksTotalPages 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No tracks found matching your search
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Creator Albums Tab */}
          {activeTab === 'albums' && user?.role === 'creator' && (
            <div className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-5">My Albums</h3>
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-5">
                  <div className="text-red-300 text-sm">{error}</div>
                  <button 
                    onClick={fetchAlbums}
                    className="mt-2 px-3 py-1.5 bg-red-700 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {loadingAlbums ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-white text-sm">Loading albums...</div>
                </div>
              ) : filteredAlbums.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  You haven't created any albums yet
                </div>
              ) : (
                <>
                  {/* Search bar for albums */}
                  <div className="mb-5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search your albums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm"
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 4a4 4 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {filteredAlbums.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {filteredAlbums.map((album) => (
                        <div key={album.id} className="card-bg rounded-xl overflow-hidden border border-gray-700/30 hover:border-[#FF4D67]/50 transition-colors">
                          <div className="relative">
                            <img 
                              src={album.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'} 
                              alt={album.title} 
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                              <h3 className="font-bold text-white truncate">{album.title}</h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-white truncate text-base">{album.title}</h4>
                            <div className="flex justify-between text-sm text-gray-400 mt-2">
                              <span>{album.year}</span>
                              <span>{album.tracks} tracks</span>
                            </div>
                            <div className="flex justify-end mt-3 space-x-2">
                              <button 
                                onClick={() => router.push(`/album/${album.id}`)}
                                className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 text-xs font-medium transition-colors"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => {
                                  setItemToDelete({
                                    type: 'album',
                                    id: album.id,
                                    title: album.title
                                  });
                                  setShowDeleteModal(true);
                                }}
                                className="px-3 py-1.5 bg-red-700 text-white rounded hover:bg-red-600 text-xs font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No albums found matching your search
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-bg rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{itemToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}