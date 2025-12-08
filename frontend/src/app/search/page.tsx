'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  plays: number
  likes: number
  coverImage: string
  duration?: string
}

interface Creator {
  id: string
  name: string
  type: string
  followers: number
  avatar: string
  verified?: boolean
}

interface Album {
  id: string
  title: string
  artist: string
  coverImage: string
  year: number
  tracks: number
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists' | 'albums'>('tracks')
  
  // Mock data for search results
  const mockTracks: Track[] = [
    {
      id: '1',
      title: 'Rwandan Vibes',
      artist: 'Kizito M',
      album: 'East African Dreams',
      plays: 12400,
      likes: 890,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:45'
    },
    {
      id: '2',
      title: 'Mountain Echoes',
      artist: 'Divine Ikirezi',
      album: 'Nature Sounds',
      plays: 9800,
      likes: 756,
      coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '4:22'
    },
    {
      id: '3',
      title: 'City Lights',
      artist: 'Benji Flavours',
      album: 'Urban Nights',
      plays: 15600,
      likes: 1200,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:18'
    },
    {
      id: '4',
      title: 'Sunset Dreams',
      artist: 'Remy Kayitesi',
      album: 'Golden Hour',
      plays: 8700,
      likes: 620,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '5:01'
    }
  ]

  const mockArtists: Creator[] = [
    {
      id: '1',
      name: 'Kizito M',
      type: 'Artist',
      followers: 12500,
      avatar: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    },
    {
      id: '2',
      name: 'Divine Ikirezi',
      type: 'Producer',
      followers: 8900,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    },
    {
      id: '3',
      name: 'Benji Flavours',
      type: 'DJ',
      followers: 15600,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    }
  ]

  const mockAlbums: Album[] = [
    {
      id: '1',
      title: 'East African Dreams',
      artist: 'Kizito M',
      coverImage: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2024,
      tracks: 12
    },
    {
      id: '2',
      title: 'Urban Nights',
      artist: 'Benji Flavours',
      coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2023,
      tracks: 10
    },
    {
      id: '3',
      title: 'Nature Sounds',
      artist: 'Divine Ikirezi',
      coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2024,
      tracks: 8
    }
  ]

  // Filter results based on search query
  const filteredTracks = mockTracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredArtists = mockArtists.filter(artist => 
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAlbums = mockAlbums.filter(album => 
    album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    album.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would trigger a new search
    console.log('Searching for:', searchQuery)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-4">
              Search Results
            </h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search music, artists, albums..."
                  className="w-full px-4 py-3 sm:py-4 pl-12 pr-20 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent text-sm sm:text-base transition-all"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 sm:py-2 bg-[#FF4D67] hover:bg-[#FF4D67]/80 text-white rounded-full text-sm font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
          
          {/* Results Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-gray-400">
              Found {filteredTracks.length + filteredArtists.length + filteredAlbums.length} results for "{query}"
            </p>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                className={`py-2 px-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === 'tracks'
                    ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('tracks')}
              >
                Tracks ({filteredTracks.length})
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === 'artists'
                    ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('artists')}
              >
                Artists ({filteredArtists.length})
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === 'albums'
                    ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('albums')}
              >
                Albums ({filteredAlbums.length})
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          {searchQuery ? (
            <>
              {/* Tracks Tab */}
              {activeTab === 'tracks' && (
                <div className="space-y-4">
                  {filteredTracks.length > 0 ? (
                    filteredTracks.map((track) => (
                      <div key={track.id} className="flex items-center gap-4 p-4 card-bg rounded-xl hover:bg-gray-800/50 transition-colors group">
                        <div className="relative">
                          <img 
                            src={track.coverImage} 
                            alt={track.title} 
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">{track.title}</h3>
                          <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                          {track.album && <p className="text-gray-500 text-xs truncate">{track.album}</p>}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-gray-500 text-xs sm:text-sm">{track.plays.toLocaleString()} plays</p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                            </svg>
                            <span className="text-gray-500 text-xs sm:text-sm">{track.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-white">No tracks found</h3>
                      <p className="mt-2 text-gray-400">Try adjusting your search to find what you're looking for.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Artists Tab */}
              {activeTab === 'artists' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredArtists.length > 0 ? (
                    filteredArtists.map((artist) => (
                      <div key={artist.id} className="group card-bg rounded-xl p-4 transition-all duration-300 hover:border-[#FFCB2B]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FFCB2B]/10">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            <img 
                              src={artist.avatar} 
                              alt={artist.name} 
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto"
                            />
                            {artist.verified && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF4D67] border-2 border-gray-900 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-white text-sm sm:text-base truncate w-full">{artist.name}</h3>
                          <p className="text-[#FFCB2B] text-xs sm:text-sm mb-2">{artist.type}</p>
                          <p className="text-gray-500 text-xs">
                            {artist.followers.toLocaleString()} followers
                          </p>
                          <button className="mt-2 w-full px-3 py-1.5 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs font-medium transition-colors">
                            Follow
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-white">No artists found</h3>
                      <p className="mt-2 text-gray-400">Try adjusting your search to find what you're looking for.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Albums Tab */}
              {activeTab === 'albums' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredAlbums.length > 0 ? (
                    filteredAlbums.map((album) => (
                      <div key={album.id} className="group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                        <div className="relative">
                          <img 
                            src={album.coverImage} 
                            alt={album.title} 
                            className="w-full aspect-square object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-bold text-white text-sm sm:text-base mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">{album.artist}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-500 text-xs">{album.year}</span>
                            <span className="text-gray-500 text-xs">{album.tracks} tracks</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-white">No albums found</h3>
                      <p className="mt-2 text-gray-400">Try adjusting your search to find what you're looking for.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-white">Start searching</h3>
              <p className="mt-2 text-gray-400">Enter a search term to find music, artists, and albums.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}