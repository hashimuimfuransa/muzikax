'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTrendingTracks } from '../../hooks/useTracks'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'
import { ITrack } from '@/types'

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  plays: number
  likes: number
  coverImage: string
  duration?: string
  category?: string
  type?: 'song' | 'beat' | 'mix'
  paymentType?: 'free' | 'paid'
  creatorWhatsapp?: string
}

export default function BeatsPage() {
  const { tracks: trendingTracksData, loading: trendingLoading, refresh: refreshTrendingTracks } = useTrendingTracks(50)
  const { favorites, favoritesLoading, addToFavorites, removeFromFavorites, playTrack, setCurrentPlaylist } = useAudioPlayer()

  // State for tracking which tracks are favorited
  const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({})
  
  // Filter only beat tracks
  const beatTracks = trendingTracksData.filter((track: ITrack) => track.type === 'beat');

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

  // Listen for favorites loaded event to update favorite status
  useEffect(() => {
    const handleFavoritesLoaded = () => {
      const status: Record<string, boolean> = {}
      favorites.forEach(track => {
        status[track.id] = true
      })
      setFavoriteStatus(status)
    }

    // Add event listener
    window.addEventListener('favoritesLoaded', handleFavoritesLoaded)

    // Clean up event listener
    return () => {
      window.removeEventListener('favoritesLoaded', handleFavoritesLoaded)
    }
  }, [favorites])

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
          : track.creatorId,
        type: track.type,
        paymentType: track.paymentType,
        creatorWhatsapp: (typeof track.creatorId === 'object' && track.creatorId !== null 
          ? (track.creatorId as any).whatsappContact 
          : undefined)
      })
    }
  }

  // Listen for track updates (when favorites are added/removed)
  useEffect(() => {
    const handleTrackUpdate = (event: CustomEvent) => {
      const detail = event.detail;
      if (detail && detail.trackId) {
        // Update favorite status if provided
        if (detail.isFavorite !== undefined) {
          setFavoriteStatus(prev => ({
            ...prev,
            [detail.trackId]: detail.isFavorite
          }));
        }
        
        // Refresh trending tracks to update like counts
        refreshTrendingTracks()
      }
    }
    
    // Add event listener
    window.addEventListener('trackUpdated', handleTrackUpdate as EventListener)
    
    // Clean up event listener
    return () => {
      window.removeEventListener('trackUpdated', handleTrackUpdate as EventListener)
    }
  }, [refreshTrendingTracks])

  // Loading state
  if (trendingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading beats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4">
              Premium Beats
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8">
              Discover the hottest beats from Rwandan producers and beat makers. Download free beats or contact creators for premium ones.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="px-4 py-2 rounded-full bg-[#FF4D67] text-white text-sm font-medium">
            All Beats
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium">
            Free
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium">
            Paid
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium">
            Afrobeat
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium">
            Hip Hop
          </button>
        </div>
      </div>

      {/* Beats Grid */}
      <div className="container mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {beatTracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No beats available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {beatTracks.map((track: ITrack) => (
              <div key={track._id} className="group card-bg rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                <div className="relative">
                  {/* Beat indicator badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                      BEAT
                    </span>
                  </div>
                  <img 
                    src={track.coverURL || '/placeholder-cover.jpg'} 
                    alt={track.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Since this is mock data, we'll create a mock track object
                        const mockTrack = {
                          _id: track._id,
                          title: track.title,
                          creatorId: { name: typeof track.creatorId === 'object' && track.creatorId !== null ? (track.creatorId as any).name : 'Unknown Artist' },
                          coverURL: track.coverURL,
                          audioURL: track.audioURL,
                          type: track.type,
                          paymentType: track.paymentType,
                          creatorWhatsapp: (typeof track.creatorId === 'object' && track.creatorId !== null ? (track.creatorId as any).whatsappContact : undefined)
                        };
                        toggleFavorite(track._id, mockTrack);
                      }}
                      className="p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <svg 
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${favoriteStatus[track._id] ? 'text-red-500 fill-current scale-110' : 'stroke-current'}`}
                        fill={favoriteStatus[track._id] ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-white text-lg mb-1 truncate">{track.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base mb-1 truncate">
                    {typeof track.creatorId === 'object' && track.creatorId !== null 
                      ? (track.creatorId as any).name 
                      : 'Unknown Artist'}
                  </p>
                  
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-3">
                    <span>{track.plays?.toLocaleString() || '0'} plays</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                      </svg>
                      <span>{track.likes}</span>
                    </div>
                  </div>

                  {/* Beat-specific buttons */}
                  <div className="flex gap-2">
                    {track.paymentType === 'paid' ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open WhatsApp with pre-filled message
                          const message = `Hi, I'm interested in your beat "${track.title}" that I found on MuzikaX.`;
                          window.open(`https://wa.me/${(typeof track.creatorId === 'object' && track.creatorId !== null ? (track.creatorId as any).whatsappContact : '')}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="flex-1 py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                        </svg>
                        WhatsApp
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show download button for free beats
                          alert('This beat is free to download. The download will start shortly.');
                          // In a real implementation, you would trigger the download here
                        }}
                        className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Play the track
                        if (track.audioURL) {
                          playTrack({
                            id: track._id,
                            title: track.title,
                            artist: typeof track.creatorId === 'object' && track.creatorId !== null 
                              ? (track.creatorId as any).name 
                              : 'Unknown Artist',
                            coverImage: track.coverURL || '',
                            audioUrl: track.audioURL,
                            creatorId: typeof track.creatorId === 'object' && track.creatorId !== null 
                              ? (track.creatorId as any)._id 
                              : track.creatorId,
                            type: track.type,
                            paymentType: track.paymentType,
                            creatorWhatsapp: (typeof track.creatorId === 'object' && track.creatorId !== null 
                              ? (track.creatorId as any).whatsappContact 
                              : undefined)
                          });
                          
                          // Set the current playlist to beat tracks
                          const playlistTracks = trendingTracksData
                            .filter((t: ITrack) => t.type === 'beat' && t.audioURL)
                            .map((t: ITrack) => ({
                              id: t._id,
                              title: t.title,
                              artist: typeof t.creatorId === 'object' && t.creatorId !== null 
                                ? (t.creatorId as any).name 
                                : 'Unknown Artist',
                              coverImage: t.coverURL || '',
                              audioUrl: t.audioURL,
                              creatorId: typeof t.creatorId === 'object' && t.creatorId !== null 
                                ? (t.creatorId as any)._id 
                                : t.creatorId,
                              type: t.type,
                              paymentType: t.paymentType,
                              creatorWhatsapp: (typeof t.creatorId === 'object' && t.creatorId !== null 
                                ? (t.creatorId as any).whatsappContact 
                                : undefined)
                            }));
                          setCurrentPlaylist(playlistTracks);
                        }
                      }}
                      className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}