'use client'

import { useState, useEffect } from 'react'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import { useRouter } from 'next/navigation'

interface PlaylistTrack {
  _id: string
  title: string
  creatorId: {
    name: string
  }
  plays: number
  coverURL?: string
  audioURL?: string  // Add audioURL field
}

interface Playlist {
  _id: string
  name: string
  description: string
  userId: {
    name: string
  }
  tracks: PlaylistTrack[]
  isPublic: boolean
  createdAt: string
}

interface RecommendedPlaylistsProps {
  className?: string
}

export default function RecommendedPlaylists({ className = '' }: RecommendedPlaylistsProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { playTrack, setCurrentPlaylist } = useAudioPlayer()
  const router = useRouter()

  useEffect(() => {
    fetchRecommendedPlaylists()
  }, [])

  const fetchRecommendedPlaylists = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/playlists/recommended`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommended playlists')
      }
      
      const data = await response.json()
      
      // Combine all playlist types and take top 10
      const allPlaylists = [
        ...(data.popular || []),
        ...(data.recent || [])
      ]
      
      // Remove duplicates and limit to 10
      const uniquePlaylists = allPlaylists
        .filter((playlist: Playlist, index: number, self: Playlist[]) => 
          index === self.findIndex(p => p._id === playlist._id)
        )
        .slice(0, 10)
      
      setPlaylists(uniquePlaylists)
    } catch (err: any) {
      console.error('Error fetching recommended playlists:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      // Convert tracks to the format expected by the audio player
      const playerTracks: any[] = playlist.tracks
        .filter(track => track && track.audioURL) // Ensure track exists and has audio URL
        .map(track => ({
          id: track._id,
          title: track.title,
          artist: playlist.userId?.name === 'admin' || playlist.userId?.name?.toLowerCase().includes('muzikax') ? 'MuzikaX' : track.creatorId?.name || 'MuzikaX', // Use 'MuzikaX' for admin playlists
          coverImage: track.coverURL || '',
          audioUrl: track.audioURL || '', // Use the correct field
          creatorId: (track.creatorId as any)?._id || '',
          type: 'song' as const
        }))
      
      if (playerTracks.length > 0) {
        // Set the current playlist
        setCurrentPlaylist(playerTracks)
        
        // Play the first track
        playTrack(playerTracks[0], playerTracks)
      }
    }
  }

  const handleViewAll = () => {
    router.push('/playlists')
  }

  if (loading) {
    return (
      <section className={`px-4 md:px-8 py-8 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Recommended Playlists</h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-48 animate-pulse">
              <div className="bg-gray-800 rounded-xl h-48 mb-3"></div>
              <div className="bg-gray-800 rounded h-4 mb-2"></div>
              <div className="bg-gray-800 rounded h-3 w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error || playlists.length === 0) {
    return null // Don't show anything if there's an error or no playlists
  }

  return (
    <section className={`px-4 md:px-8 py-8 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Recommended Playlists</h2>
        <button 
          onClick={handleViewAll}
          className="text-[#FF4D67] hover:text-[#FF4D67]/80 text-sm font-medium transition-colors"
        >
          View All
        </button>
      </div>
      
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {playlists.map((playlist) => (
            <div 
              key={playlist._id} 
              className="flex-shrink-0 w-48 group cursor-pointer"
              onClick={() => handlePlayPlaylist(playlist)}
            >
              {/* Playlist Cover */}
              <div className="relative mb-3 rounded-xl overflow-hidden bg-gray-800 aspect-square">
                {playlist.tracks.length > 0 && playlist.tracks[0]?.coverURL ? (
                  <img 
                    src={playlist.tracks[0].coverURL}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg>
                  </div>
                )}
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Track Count Badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {playlist.tracks.length} tracks
                </div>
              </div>
              
              {/* Playlist Info */}
              <h3 className="font-semibold text-white truncate mb-1 group-hover:text-[#FF4D67] transition-colors">
                {playlist.name}
              </h3>
              <p className="text-gray-400 text-sm truncate">
                {playlist.userId?.name || 'Unknown Creator'}
              </p>
              {playlist.description && (
                <p className="text-gray-500 text-xs mt-1 truncate">
                  {playlist.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}