'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'

interface Album {
  id: string
  title: string
  artist: string
  coverImage: string
  year: number
  tracks: number
  duration?: string
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>('popular')
  const { isAuthenticated } = useAuth()
  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist } = useAudioPlayer()
  const router = useRouter()

  // Fetch albums from API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums?page=1&limit=24`)
        if (response.ok) {
          const data = await response.json()
          const albumsData: Album[] = data.albums.map((album: any) => ({
            id: album._id,
            title: album.title,
            artist: typeof album.creatorId === "object" && album.creatorId !== null 
              ? album.creatorId.name 
              : "Unknown Artist",
            coverImage: album.coverURL || "",
            year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : new Date().getFullYear(),
            tracks: album.tracks?.length || 0,
            duration: "00:00" // Placeholder, would need to calculate from tracks
          }))
          setAlbums(albumsData)
        }
      } catch (error) {
        console.error('Error fetching albums:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  // Sort albums based on selected option
  const sortedAlbums = [...albums].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.tracks - a.tracks // Sort by track count as a proxy for popularity
    } else if (sortBy === 'recent') {
      return b.year - a.year
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12 px-4 overflow-x-hidden relative">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 left-0 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-0 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4">
            Albums
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Discover the latest albums from talented creators across Rwanda and beyond.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Albums Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="group card-bg rounded-xl overflow-hidden transition-all duration-300">
                <div className="relative">
                  <div className="w-full aspect-square bg-gray-700 animate-pulse"></div>
                </div>
                
                <div className="p-3">
                  <div className="h-4 bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedAlbums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedAlbums.map((album) => (
              <div 
                key={album.id} 
                className="group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10 cursor-pointer"
                onClick={() => router.push(`/album/${album.id}`)}
              >
                <div className="relative">
                  {album.coverImage && album.coverImage.trim() !== '' ? (
                    <img 
                      src={album.coverImage} 
                      alt={album.title} 
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <svg 
                        className="w-4 h-4" 
                        fill="currentColor" 
                        viewBox="0 0 20 20" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-bold text-white text-sm mb-1 truncate">{album.title}</h3>
                  <p className="text-gray-400 text-xs truncate">{album.artist}</p>
                  
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{album.year}</span>
                    <div className="flex items-center gap-1">
                      <span>{album.tracks} tracks</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No albums found</h3>
            <p className="mt-2 text-gray-400">Check back later for new releases.</p>
          </div>
        )}
      </div>
    </div>
  )
}