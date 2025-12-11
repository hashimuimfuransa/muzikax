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
  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist } = useAudioPlayer()
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuth()

  // Check authentication on component mount
  useEffect(() => {
    // Don't redirect while loading
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch creator analytics when the analytics tab is selected
  useEffect(() => {
    if (activeTab === 'analytics' && user?.role === 'creator' && !analytics) {
      fetchAnalytics()
    }
  }, [activeTab, user, analytics])

  // Fetch creator tracks when the tracks tab is selected
  useEffect(() => {
    if (activeTab === 'tracks' && user?.role === 'creator') {
      fetchTracks(tracksPage)
    }
  }, [activeTab, user, tracksPage])

  // Fetch creator albums when the albums tab is selected
  useEffect(() => {
    if (activeTab === 'albums' && user?.role === 'creator') {
      fetchAlbums()
    }
  }, [activeTab, user])

  // Filter tracks and albums based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTracks(tracks)
      setFilteredAlbums(albums)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredTracks(tracks.filter(track => 
        track.title.toLowerCase().includes(query) || 
        track.genre.toLowerCase().includes(query)
      ))
      setFilteredAlbums(albums.filter(album => 
        album.title.toLowerCase().includes(query) || 
        album.artist.toLowerCase().includes(query)
      ))
    }
  }, [searchQuery, tracks, albums])

  const fetchAnalytics = async () => {
    if (loadingAnalytics) return
    setLoadingAnalytics(true)
    setError(null)
    try {
      const data = await fetchCreatorAnalytics()
      setAnalytics(data)
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error)
      setError(error.message || 'Failed to load analytics data')
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const fetchTracks = async (page: number) => {
    if (loadingTracks) return
    setLoadingTracks(true)
    setError(null)
    try {
      const data = await fetchCreatorTracks(page, 6)
      setTracks(data.tracks)
      setFilteredTracks(data.tracks)
      setTracksTotalPages(data.pages)
    } catch (error: any) {
      console.error('Failed to fetch tracks:', error)
      setError(error.message || 'Failed to load tracks data')
    } finally {
      setLoadingTracks(false)
    }
  }

  const fetchAlbums = async () => {
    if (loadingAlbums) return
    setLoadingAlbums(true)
    setError(null)
    try {
      const data: any[] = await getAlbumsByCreator(user?.id || '')
      // Transform the data to match our ProfileAlbum interface
      const transformedAlbums = data.map(album => ({
        id: album._id || album.id,
        title: album.title || 'Untitled Album',
        artist: (album.creatorId && typeof album.creatorId === 'object' ? album.creatorId.name : 'Unknown Artist'),
        coverImage: album.coverURL || '',
        year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : new Date().getFullYear(),
        tracks: Array.isArray(album.tracks) ? album.tracks.length : 0,
        createdAt: album.createdAt ? new Date(album.createdAt).toISOString() : new Date().toISOString()
      })).filter(album => album && typeof album === 'object')
      setAlbums(transformedAlbums)
      setFilteredAlbums(transformedAlbums)
    } catch (error: any) {
      console.error('Failed to fetch albums:', error)
      setError(error.message || 'Failed to load albums data')
    } finally {
      setLoadingAlbums(false)
    }
  }

  const handlePageChange = (newPage: number, type: 'tracks' | 'albums') => {
    if (type === 'tracks' && newPage >= 1 && newPage <= tracksTotalPages) {
      setTracksPage(newPage)
    }
  }

  const handlePlayTrack = (trackId: string) => {
    // Find the track to get its audio URL
    const track = tracks.find(t => t._id === trackId);
    if (track && track.audioURL) {
      playTrack({
        id: track._id,
        title: track.title,
        artist: user?.name || 'Unknown Artist',
        coverImage: track.coverURL || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        audioUrl: track.audioURL
      });
      
      // Set the current playlist to all creator tracks
      const playlistTracks = tracks
        .filter(t => t.audioURL) // Only tracks with audio
        .map(t => ({
          id: t._id,
          title: t.title,
          artist: user?.name || 'Unknown Artist',
          coverImage: t.coverURL || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
          audioUrl: t.audioURL
        }));
      setCurrentPlaylist(playlistTracks);
    }
  };

  const handleDelete = (type: 'track' | 'album', id: string, title: string) => {
    setShowDeleteModal(true)
    setItemToDelete({type, id, title})
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      if (itemToDelete.type === 'track') {
        await deleteTrack(itemToDelete.id)
        setTracks(prevTracks => prevTracks.filter(track => track._id !== itemToDelete.id))
      } else if (itemToDelete.type === 'album') {
        await deleteAlbum(itemToDelete.id)
        setAlbums(prevAlbums => prevAlbums.filter(album => album.id !== itemToDelete.id))
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4">
              {user?.role === 'creator' ? 'Creator Dashboard' : 'Your Profile'}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              {user?.role === 'creator' 
                ? 'Manage your content, view analytics, and engage with your audience' 
                : 'Manage your account settings and preferences'}
            </p>
          </div>

          {/* Profile Card */}
          <div className="card-bg rounded-2xl p-6 sm:p-8 mb-8 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center relative overflow-hidden">
                <span className="text-3xl font-bold text-white z-10">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{user?.name || 'User'}</h2>
                <p className="text-gray-400 mb-2">{user?.email || 'user@example.com'}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-xs sm:text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  {user?.role === 'creator' ? 'Creator Account' : 'Fan Account'}
                </div>
                {user?.role === 'creator' && user?.creatorType && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-xs sm:text-sm">
                    {user.creatorType.charAt(0).toUpperCase() + user.creatorType.slice(1)}
                  </div>
                )}
                {user?.role === 'creator' && (
                  <div className="mt-4 flex flex-wrap gap-2">
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
            {user?.role === 'creator' && (
              <>
                <button
                  className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${
                    activeTab === 'analytics'
                      ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>
                <button
                  className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${
                    activeTab === 'tracks'
                      ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('tracks')}
                >
                  My Tracks
                </button>
                <button
                  className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${
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

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card-bg rounded-2xl p-6 sm:p-8 border border-gray-700/50 max-w-md w-full">
                      <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
                      <p className="text-gray-300 mb-6">
                        Are you sure you want to delete <span className="font-semibold text-[#FF4D67]">{itemToDelete?.title}</span>? 
                        This action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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

          {/* Creator Analytics Tab */}
          {activeTab === 'analytics' && user?.role === 'creator' && (
            <div className="card-bg rounded-2xl p-6 sm:p-8 border border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6">Performance Analytics</h3>
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                  <div className="text-red-300">{error}</div>
                  <button 
                    onClick={fetchAnalytics}
                    className="mt-2 px-3 py-1 bg-red-700 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {loadingAnalytics ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-white">Loading analytics...</div>
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="card-bg rounded-xl p-6 border border-gray-700/30 text-center">
                    <div className="text-3xl font-bold text-[#FF4D67] mb-2">{analytics.totalTracks}</div>
                    <div className="text-gray-400">Total Tracks</div>
                  </div>
                  <div className="card-bg rounded-xl p-6 border border-gray-700/30 text-center">
                    <div className="text-3xl font-bold text-[#FFCB2B] mb-2">{analytics.totalPlays.toLocaleString()}</div>
                    <div className="text-gray-400">Total Plays</div>
                  </div>
                  <div className="card-bg rounded-xl p-6 border border-gray-700/330 text-center">
                    <div className="text-3xl font-bold text-[#6C63FF] mb-2">{analytics.totalLikes.toLocaleString()}</div>
                    <div className="text-gray-400">Total Likes</div>
                  </div>
                </div>
              ) : !error ? (
                <div className="text-center py-8 text-gray-400">
                  No analytics data available
                </div>
              ) : null}
              
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                <div className="card-bg rounded-xl p-6 border border-gray-700/30">
                  <div className="text-center py-8 text-gray-400">
                    Recent activity data will appear here
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Creator Tracks Tab */}
          {activeTab === 'tracks' && user?.role === 'creator' && (
            <div className="card-bg rounded-2xl p-6 sm:p-8 border border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6">My Tracks</h3>
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                  <div className="text-red-300">{error}</div>
                  <button 
                    onClick={() => fetchTracks(tracksPage)}
                    className="mt-2 px-3 py-1 bg-red-700 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {loadingTracks ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-white">Loading tracks...</div>
                </div>
              ) : tracks.length > 0 ? (
                <>
                  {/* Search bar for tracks */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search your tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all"
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {filteredTracks.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {filteredTracks.map((track) => (
                          <div key={track._id} className="card-bg rounded-xl overflow-hidden border border-gray-700/30 hover:border-[#FF4D67]/50 transition-colors relative group">
                            <div className="relative aspect-square bg-gray-800 flex items-center justify-center">
                              {track.coverURL ? (
                                <img 
                                  src={track.coverURL} 
                                  alt={track.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-600 text-sm">No cover image</div>
                              )}
                              {/* Action buttons overlay */}
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handlePlayTrack(track._id)}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-primary flex items-center justify-center text-white"
                                  title="Play Track"
                                >
                                  {currentTrack?.id === track._id && isPlaying ? (
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                                    </svg>
                                  )}
                                </button>
                                <button 
                                  onClick={() => router.push(`/edit-track/${track._id}`)}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                                  title="Edit Track"
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleDelete('track', track._id, track.title)}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                  title="Delete Track"
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="p-3 sm:p-4">
                              <h4 className="font-semibold text-white truncate text-sm sm:text-base">{track.title}</h4>
                              <div className="flex justify-between text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
                                <span>{track.plays.toLocaleString()} plays</span>
                                <span>{track.likes.toLocaleString()} likes</span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                                <span>{track.genre}</span>
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
                            className={`px-3 py-1 rounded-md ${
                              tracksPage === 1 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                          >
                            Previous
                          </button>
                          
                          <span className="text-white mx-2">
                            Page {tracksPage} of {tracksTotalPages}
                          </span>
                          
                          <button
                            onClick={() => handlePageChange(tracksPage + 1, 'tracks')}
                            disabled={tracksPage === tracksTotalPages}
                            className={`px-3 py-1 rounded-md ${
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
                    <div className="text-center py-8 text-gray-400">
                      No tracks found matching your search
                    </div>
                  )}
                </>
              ) : !error ? (
                <div className="text-center py-8 text-gray-400">
                  You haven't uploaded any tracks yet
                </div>
              ) : null}
              
              <div className="mt-6">
                <button 
                  onClick={() => router.push('/upload')}
                  className="px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors"
                >
                  Upload New Track
                </button>
              </div>
            </div>
          )}

          {/* Creator Albums Tab */}
          {activeTab === 'albums' && user?.role === 'creator' && (
            <div className="card-bg rounded-2xl p-6 sm:p-8 border border-gray-700/50">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6">My Albums</h3>
              
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                  <div className="text-red-300">{error}</div>
                  <button 
                    onClick={() => fetchAlbums()}
                    className="mt-2 px-3 py-1 bg-red-700 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {loadingAlbums ? (
                <div className="flex justify-center items-center h-40">
                  <div className="text-white">Loading albums...</div>
                </div>
              ) : !error ? (
                <>
                  {/* Search bar for albums */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search your albums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all"
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {filteredAlbums.length > 0 ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      {filteredAlbums.map((album) => (
                        <div key={album.id} className="card-bg rounded-xl overflow-hidden border border-gray-700/30 hover:border-[#FF4D67]/50 transition-colors relative group">
                          <div className="relative aspect-square bg-gray-800 flex items-center justify-center">
                            {album.coverImage ? (
                              <img 
                                src={album.coverImage} 
                                alt={album.title} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-gray-600 text-sm">No cover image</div>
                            )}
                            {/* Action buttons overlay */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => router.push(`/album/${album.id}`)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF4D67] flex items-center justify-center text-white hover:bg-[#FF4D67]/80 transition-colors"
                                title="View Album"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                                </svg>
                              </button>
                              <button 
                                onClick={() => router.push(`/edit-album/${album.id}`)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                                title="Edit Album"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDelete('album', album.id, album.title)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                title="Delete Album"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="p-3 sm:p-4">
                            <h4 className="font-semibold text-white truncate text-sm sm:text-base">{album.title}</h4>
                            <div className="flex justify-between text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
                              <span>{album.tracks} tracks</span>
                              <span>{album.year}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No albums found matching your search
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  You haven't created any albums yet
                </div>
              )}
              
              <div className="mt-6">
                <button 
                  onClick={() => router.push('/create-album')}
                  className="px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors"
                >
                  Create New Album
                </button>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteModal && itemToDelete && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="card-bg rounded-2xl p-6 sm:p-8 border border-gray-700/50 max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete the {itemToDelete.type} "<span className="text-white font-semibold">{itemToDelete.title}</span>"? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setItemToDelete(null);
                    }}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
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