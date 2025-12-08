'use client'

import { useState } from 'react'

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

export default function TracksPage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'popular'>('trending')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>('popular')
  
  // Mock data for tracks with real image URLs
  const trendingTracks: Track[] = [
    {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      plays: 12400,
      likes: 890,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:45'
    },
    {
      id: '2',
      title: 'Save Your Tears',
      artist: 'The Weeknd',
      album: 'After Hours',
      plays: 9800,
      likes: 756,
      coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '4:22'
    },
    {
      id: '3',
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      plays: 15600,
      likes: 1200,
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:18'
    },
    {
      id: '4',
      title: 'Stay',
      artist: 'The Kid LAROI, Justin Bieber',
      album: 'F*CK LOVE 3',
      plays: 8700,
      likes: 620,
      coverImage: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '5:01'
    },
    {
      id: '5',
      title: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      album: 'SOUR',
      plays: 11200,
      likes: 950,
      coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '4:33'
    },
    {
      id: '6',
      title: 'Montero',
      artist: 'Lil Nas X',
      album: 'Montero',
      plays: 2400,
      likes: 180,
      coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:55'
    },
    {
      id: '7',
      title: 'Peaches',
      artist: 'Justin Bieber',
      album: 'Justice',
      plays: 1900,
      likes: 150,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '4:12'
    },
    {
      id: '8',
      title: 'Kiss Me More',
      artist: 'Doja Cat ft. SZA',
      album: 'Planet Her',
      plays: 3200,
      likes: 280,
      coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:47'
    },
    {
      id: '9',
      title: 'Butter',
      artist: 'BTS',
      album: 'Butter',
      plays: 1500,
      likes: 95,
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '5:22'
    },
    {
      id: '10',
      title: 'Heat Waves',
      artist: 'Glass Animals',
      album: 'Dreamland',
      plays: 8900,
      likes: 650,
      coverImage: 'https://images.unsplash.com/photo-1514320291841-38b60f8f72d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:28'
    },
    {
      id: '11',
      title: 'Industry Baby',
      artist: 'Lil Nas X, Jack Harlow',
      album: 'Montero',
      plays: 12300,
      likes: 980,
      coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '4:05'
    },
    {
      id: '12',
      title: 'Deja Vu',
      artist: 'Olivia Rodrigo',
      album: 'SOUR',
      plays: 7600,
      likes: 520,
      coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:52'
    }
  ]

  const newTracks: Track[] = [
    {
      id: '13',
      title: 'Easy On Me',
      artist: 'Adele',
      album: '30',
      plays: 15600,
      likes: 1320,
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '4:18'
    },
    {
      id: '14',
      title: 'Cold Heart',
      artist: 'Elton John, Dua Lipa',
      album: 'The Lockdown Sessions',
      plays: 2400,
      likes: 180,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:55'
    },
    {
      id: '15',
      title: 'Woman',
      artist: 'Doja Cat',
      album: 'Planet Her',
      plays: 1900,
      likes: 150,
      coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '4:12'
    },
    {
      id: '16',
      title: 'Shivers',
      artist: 'Ed Sheeran',
      album: '=',
      plays: 3200,
      likes: 280,
      coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:47'
    },
    {
      id: '17',
      title: 'Bad Habits',
      artist: 'Ed Sheeran',
      album: '=',
      plays: 1500,
      likes: 95,
      coverImage: 'https://images.unsplash.com/photo-1514320291841-38b60f8f72d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '5:22'
    },
    {
      id: '18',
      title: 'Ghost',
      artist: 'Justin Bieber',
      album: 'Justice',
      plays: 8900,
      likes: 650,
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '3:28'
    }
  ]

  const popularCreators = [
    {
      id: '1',
      name: 'The Weeknd',
      type: 'Artist',
      followers: 12500,
      avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    },
    {
      id: '2',
      name: 'Dua Lipa',
      type: 'Artist',
      followers: 8900,
      avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    },
    {
      id: '3',
      name: 'Justin Bieber',
      type: 'Artist',
      followers: 15600,
      avatar: 'https://images.unsplash.com/photo-1514320291841-38b60f8f72d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    },
    {
      id: '4',
      name: 'Olivia Rodrigo',
      type: 'Artist',
      followers: 9800,
      avatar: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: false
    },
    {
      id: '5',
      name: 'Doja Cat',
      type: 'Artist',
      followers: 7600,
      avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    },
    {
      id: '6',
      name: 'BTS',
      type: 'Band',
      followers: 22400,
      avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    }
  ]

  // Get current tracks based on active tab
  const currentTracks = activeTab === 'trending' ? trendingTracks : 
                      activeTab === 'new' ? newTracks : 
                      trendingTracks // For popular creators tab, we'll show trending tracks

  // Sort tracks based on selected option
  const sortedTracks = [...currentTracks].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.plays - a.plays
    } else if (sortBy === 'recent') {
      return parseInt(b.id) - parseInt(a.id)
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">All Tracks</h1>
            <p className="text-gray-400">Browse all tracks across different categories</p>
          </div>
          
          <div className="flex items-center gap-2">
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
        
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mb-6">
          <div className="flex border-b border-gray-800 min-w-max">
            <button
              className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === 'trending'
                  ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('trending')}
            >
              Trending Now
            </button>
            <button
              className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === 'new'
                  ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('new')}
            >
              New Releases
            </button>
            <button
              className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
                activeTab === 'popular'
                  ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('popular')}
            >
              Popular Creators
            </button>
          </div>
        </div>
        
        {activeTab !== 'popular' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedTracks.map((track) => (
              <div key={track.id} className="group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                <div className="relative">
                  <img 
                    src={track.coverImage} 
                    alt={track.title} 
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-white text-base mb-1 truncate">{track.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  {track.album && <p className="text-gray-500 text-xs mt-1 truncate">{track.album}</p>}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-gray-500 text-xs">{track.plays.toLocaleString()} plays</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-gray-500 text-xs">{track.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {popularCreators.map((creator) => (
              <div key={creator.id} className="group card-bg rounded-xl p-5 transition-all duration-300 hover:border-[#FFCB2B]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FFCB2B]/10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img 
                      src={creator.avatar} 
                      alt={creator.name} 
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto"
                    />
                    {creator.verified && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FF4D67] border-2 border-gray-900 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base truncate w-full">{creator.name}</h3>
                  <p className="text-[#FFCB2B] text-sm mb-3">{creator.type}</p>
                  <p className="text-gray-500 text-xs mb-4">
                    {creator.followers.toLocaleString()} followers
                  </p>
                  <button className="w-full px-4 py-2 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-sm font-medium transition-colors">
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}