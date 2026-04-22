'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { FaPlay, FaPause, FaHeart } from 'react-icons/fa'

interface Track {
  _id: string
  title: string
  creatorId: {
    name: string
    _id: string
  } | string
  coverURL?: string
  audioURL: string
  plays?: number
  likes?: number
  type?: 'song' | 'beat' | 'mix'
  duration?: string
}

export default function PopularMixes() {
  const [mixTracks, setMixTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist, favorites, favoritesLoading, addToFavorites, removeFromFavorites } = useAudioPlayer()

  // State for tracking which tracks are favorited
  const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({})

  // Update favorite status when favorites change or when favorites are loaded
  useEffect(() => {
    if (!favoritesLoading) {
      const status: Record<string, boolean> = {}
      favorites.forEach(track => {
        status[track.id] = true
      })
      setFavoriteStatus(status)
    }
  }, [favorites, favoritesLoading])

  // Fetch mix tracks from API
  useEffect(() => {
    const fetchMixes = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/type?type=mix&limit=20`)
        
        if (response.ok) {
          const data: Track[] = await response.json()
          
          // Filter out tracks without audio URLs
          const filteredData = data.filter((track: any) => 
            track.audioURL && track.audioURL.trim() !== ''
          );
          
          setMixTracks(filteredData)
        } else {
          throw new Error(`Failed to fetch mixes: ${response.status}`)
        }
      } catch (err: any) {
        console.error('Error fetching mixes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMixes()
  }, [])

  // Toggle favorite status for a track
  const toggleFavorite = (trackId: string, track: any) => {
    if (favoriteStatus[trackId]) {
      // Remove from favorites
      removeFromFavorites(trackId)
    } else {
      // Add to favorites
      addToFavorites({
        id: track._id,
        title: track.title,
        artist: typeof track.creatorId === 'object' && track.creatorId !== null 
          ? (track.creatorId as any).name 
          : 'Unknown Artist',
        coverImage: track.coverURL || '',
        audioUrl: track.audioURL || '',
        creatorId: typeof track.creatorId === 'object' && track.creatorId !== null 
          ? (track.creatorId as any)._id 
          : track.creatorId
      })
    }
  }

  // Play a track and set the playlist
  const handlePlayTrack = (track: Track) => {
    const trackToPlay = {
      id: track._id,
      title: track.title,
      artist: typeof track.creatorId === 'object' && track.creatorId !== null 
        ? (track.creatorId as any).name 
        : 'Unknown Artist',
      coverImage: track.coverURL || '',
      audioUrl: track.audioURL,
      creatorId: typeof track.creatorId === 'object' && track.creatorId !== null 
        ? (track.creatorId as any)._id 
        : track.creatorId
    }

    playTrack(trackToPlay)

    // Set the current playlist to all mix tracks
    const playlistTracks = mixTracks
      .filter((t) => t.audioURL) // Only tracks with audio
      .map((t) => ({
        id: t._id,
        title: t.title,
        artist: typeof t.creatorId === 'object' && t.creatorId !== null 
          ? (t.creatorId as any).name 
          : 'Unknown Artist',
        coverImage: t.coverURL || '',
        audioUrl: t.audioURL,
        creatorId: typeof t.creatorId === 'object' && t.creatorId !== null 
          ? (t.creatorId as any)._id 
          : t.creatorId
      }))
      
    setCurrentPlaylist(playlistTracks)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        {/* Hero Section - Hidden on mobile */}
        <div className="relative py-6 sm:py-10 lg:py-16 overflow-hidden hidden sm:block">
          {/* Background image with gradient overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60"></div>
          </div>
                
          {/* Decorative elements - smaller on mobile */}
          <div className="absolute -top-10 -left-10 sm:-top-20 sm:-left-20 w-32 h-32 sm:w-64 sm:h-64 bg-[#FF8C00]/10 rounded-full blur-2xl sm:blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -right-10 sm:-bottom-20 sm:-right-20 w-32 h-32 sm:w-64 sm:h-64 bg-[#FFB020]/10 rounded-full blur-2xl sm:blur-3xl -z-10"></div>
                
          <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C00] to-[#FFB020] mb-2 sm:mb-3 md:mb-4">
                Popular Mixes
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-2">
                Discover the best mixes from Rwandan DJs and music curators
              </p>
            </div>
          </div>
        </div>
        
        {/* Loading Grid */}
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 pt-16 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="group card-bg rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300">
                <div className="relative">
                  <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-700 animate-pulse"></div>
                </div>
                
                <div className="p-3 sm:p-4 md:p-5">
                  <div className="h-3 sm:h-4 bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-2 sm:h-3 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-2 sm:h-3 bg-gray-700 rounded w-1/2 animate-pulse mt-2"></div>
                  
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                    <div className="h-2 sm:h-3 bg-gray-700 rounded w-1/3 animate-pulse"></div>
                    <div className="h-2 sm:h-3 bg-gray-700 rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Mixes</h2>
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#FF8C00] text-white rounded-lg hover:bg-[#FFB020] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Hero Section - Hidden on mobile */}
      <div className="relative py-6 sm:py-10 lg:py-16 overflow-hidden hidden sm:block">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60"></div>
        </div>
        
        {/* Decorative elements - smaller on mobile */}
        <div className="absolute -top-10 -left-10 sm:-top-20 sm:-left-20 w-32 h-32 sm:w-64 sm:h-64 bg-[#FF8C00]/10 rounded-full blur-2xl sm:blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 -right-10 sm:-bottom-20 sm:-right-20 w-32 h-32 sm:w-64 sm:h-64 bg-[#FFB020]/10 rounded-full blur-2xl sm:blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C00] to-[#FFB020] mb-2 sm:mb-3 md:mb-4">
              Popular Mixes
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-2">
              Discover the best mixes from Rwandan DJs and music curators
            </p>
          </div>
        </div>
      </div>

      {/* Mixes Grid */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 pt-16 sm:pt-6">
        {mixTracks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No Mixes Found</h2>
            <p className="text-sm sm:text-base text-gray-400">Check back later for new mixes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {mixTracks.map((track) => {
              const artistName = typeof track.creatorId === 'object' && track.creatorId !== null 
                ? (track.creatorId as any).name 
                : 'Unknown Artist';
              
              return (
                <div 
                  key={track._id} 
                  className="group card-bg rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF8C00]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF8C00]/10 active:scale-[0.98]"
                >
                  <div className="relative">
                    {track.coverURL ? (
                      <img 
                        src={track.coverURL} 
                        alt={track.title} 
                        className="w-full h-40 sm:h-44 md:h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-44 md:h-48 bg-gradient-to-br from-[#FF8C00] to-[#FFB020] flex items-center justify-center">
                        <span className="text-xl sm:text-2xl font-bold text-white">
                          {track.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Play Button Overlay - Touch-friendly on mobile */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 sm:transform sm:translate-y-2 sm:group-hover:translate-y-0 sm:transition-all sm:duration-300 touch-manipulation"
                        disabled={!track.audioURL}
                        aria-label={`Play ${track.title}`}
                      >
                        {currentTrack?.id === track._id && isPlaying ? (
                          <FaPause className="w-5 h-5" />
                        ) : (
                          <FaPlay className="w-5 h-5 ml-1" />
                        )}
                      </button>
                    </div>
                    
                    {/* Favorite Button - Always visible on mobile */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track._id, track);
                        }}
                        className="p-2 sm:p-2 rounded-full bg-black/40 sm:bg-black/30 sm:backdrop-blur-sm text-white sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90 touch-manipulation"
                        aria-label={favoriteStatus[track._id] ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <FaHeart 
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${favoriteStatus[track._id] ? 'text-red-500 fill-current scale-110' : 'text-white'}`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-5">
                    <h3 className="font-bold text-white text-base sm:text-lg mb-1 truncate" title={track.title}>{track.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm md:text-base mb-2 truncate" title={artistName}>{artistName}</p>
                    
                    {/* Stats */}
                    <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                      <span>{(track.plays || 0).toLocaleString()} plays</span>
                      <div className="flex items-center gap-1">
                        <FaHeart className="w-3 h-3" />
                        <span>{track.likes || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
