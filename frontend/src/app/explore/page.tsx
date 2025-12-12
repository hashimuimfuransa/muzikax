'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTrendingTracks, usePopularCreators } from '@/hooks/useTracks'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { Suspense } from 'react'

interface Track {  
  _id?: string
  id: string
  title: string
  artist: string
  plays: number
  likes: number
  coverImage?: string
  coverURL?: string
  category: string
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

const categories = [
  { id: 'afrobeat', name: 'Afrobeat' },
  { id: 'hiphop', name: 'Hip Hop' },
  { id: 'rnb', name: 'R&B' },
  { id: 'afropop', name: 'Afropop' },
  { id: 'gospel', name: 'Gospel' },
  { id: 'traditional', name: 'Traditional' },
  { id: 'beats', name: 'Beats' },
  { id: 'mixes', name: 'Mixes' }
]

// Separate component for the main content that uses useSearchParams
function ExploreContent() {
  const [activeTab, setActiveTab] = useState<'tracks' | 'creators'>('tracks')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { tracks: trendingTracksData, loading: trendingLoading } = useTrendingTracks(20)
  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist } = useAudioPlayer()
  
  // Get category from URL params
  const categoryParam = searchParams.get('category')
  
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam])
  
  // Transform real tracks data to match existing interface
  const allTracks: Track[] = trendingTracksData.map(track => ({
    _id: track._id,
    id: track._id || 'unknown',
    title: track.title,
    artist: typeof track.creatorId === 'object' && track.creatorId !== null ? (track.creatorId as any).name : 'Unknown Artist',
    plays: track.plays,
    likes: track.likes,
    coverImage: track.coverURL || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    coverURL: track.coverURL,
    category: track.genre || 'afrobeat',
    duration: ''
  }));

  const allCreators: Creator[] = [
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
    },
    {
      id: '4',
      name: 'Remy Kayitesi',
      type: 'Artist',
      followers: 7200,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: '5',
      name: 'Gloria Muhire',
      type: 'Artist',
      followers: 9800,
      avatar: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    }
  ]

  // Filter tracks based on selected category
  const filteredTracks = selectedCategory 
    ? allTracks.filter(track => track.category === selectedCategory)
    : allTracks

  // Filter creators based on selected category (for demo, we'll show all creators regardless of category)
  const filteredCreators = allCreators

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // If clicking the same category, clear the filter
      setSelectedCategory(null)
      router.push('/explore')
    } else {
      // Set the new category filter
      setSelectedCategory(categoryId)
      router.push(`/explore?category=${categoryId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative py-8 sm:py-12 lg:py-16 overflow-hidden">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4">
              Explore Rwandan Music
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8">
              Discover trending tracks and talented creators from Rwanda's vibrant music scene
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search tracks, artists, albums..."
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 pl-10 sm:pl-12 bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base shadow-lg"
              />
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="container mx-auto px-4 sm:px-8 py-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-[#FF4D67] text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
            onClick={() => handleCategoryClick('')}
          >
            All Categories
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#FF4D67] text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 sm:px-8 py-8 sm:py-12 md:py-16 pb-32 flex-1">
        <div className="flex border-b border-gray-800 mb-8 sm:mb-10">
          <button
            className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${
              activeTab === 'tracks'
                ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('tracks')}
          >
            Trending Tracks
          </button>
          <button
            className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${
              activeTab === 'creators'
                ? 'text-[#FFCB2B] border-b-2 border-[#FFCB2B]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('creators')}
          >
            Top Creators
          </button>
        </div>

        {/* Tracks Grid */}
        {activeTab === 'tracks' && (
          <>
            {trendingLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-white">Loading tracks...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {filteredTracks.map((track) => (
                  <div key={track.id} className="group card-bg rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                    <div className="relative">
                      <img 
                        src={track.coverImage || track.coverURL || '/placeholder-track.png'} 
                        alt={track.title} 
                        className="w-full h-40 sm:h-48 md:h-56 object-cover"
                        onError={(e) => {
                          // Handle broken images gracefully
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-track.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => {
                            // Find the full track object to get the audioURL
                            const fullTrack = trendingTracksData.find(t => t._id === track._id);
                            if (fullTrack && fullTrack.audioURL) {
                              playTrack({
                                id: track.id,
                                title: track.title,
                                artist: track.artist,
                                coverImage: track.coverImage || track.coverURL || '/placeholder-track.png',
                                audioUrl: fullTrack.audioURL,
                                creatorId: typeof fullTrack.creatorId === 'object' && fullTrack.creatorId !== null ? (fullTrack.creatorId as any)._id : fullTrack.creatorId
                              });
                              
                              // Set the current playlist to all trending tracks
                              const playlistTracks = trendingTracksData
                                .filter(t => t.audioURL) // Only tracks with audio
                                .map(t => ({
                                  id: t._id || 'unknown',
                                  title: t.title,
                                  artist: typeof t.creatorId === 'object' && t.creatorId !== null ? (t.creatorId as any).name : 'Unknown Artist',
                                  coverImage: t.coverURL || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
                                  audioUrl: t.audioURL,
                                  creatorId: typeof t.creatorId === 'object' && t.creatorId !== null ? (t.creatorId as any)._id : t.creatorId
                                }));
                              setCurrentPlaylist(playlistTracks);
                            }
                          }}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          {currentTrack?.id === track.id && isPlaying ? (
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M4.318 6.318a4 4 0 000 6.364L12 20.364l7.682-7.682a4 4 0 00-6.364-6.364L12 7.636l-1.318-1.318a4 4 0 000-5.656z" clipRule="evenodd"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <button className="p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4 4 0 000 6.364L12 20.364l7.682-7.682a4 4 0 00-6.364-6.364L12 7.636l-1.318-1.318a4 4 0 000-5.656z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-5">
                      <h3 className="font-bold text-white text-lg mb-1 truncate">{track.title}</h3>
                      <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">{track.artist}</p>
                      
                      <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                        <span>{track.plays.toLocaleString()} plays</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                          </svg>
                          <span>{track.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Creators Grid */}
        {activeTab === 'creators' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCreators.map((creator) => (
              <div key={creator.id} className="group card-bg rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[#FFCB2B]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FFCB2B]/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img 
                      src={creator.avatar} 
                      alt={creator.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {creator.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF4D67] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{creator.name}</h3>
                    <p className="text-gray-400 text-sm">{creator.type}</p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{creator.followers.toLocaleString()} followers</span>
                </div>
                
                <button className="w-full py-2.5 sm:py-3 gradient-secondary rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base">
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Explore() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExploreContent />
    </Suspense>
  )
}