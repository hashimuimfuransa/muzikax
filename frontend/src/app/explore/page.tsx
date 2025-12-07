'use client'

import { useState } from 'react'

interface Track {
  id: string
  title: string
  artist: string
  plays: number
  likes: number
  coverImage: string
}

interface Creator {
  id: string
  name: string
  type: string
  followers: number
  avatar: string
}

export default function Explore() {
  const [activeTab, setActiveTab] = useState<'tracks' | 'creators'>('tracks')
  
  // Mock data
  const tracks: Track[] = [
    {
      id: '1',
      title: 'Rwandan Vibes',
      artist: 'Kizito M',
      plays: 12400,
      likes: 890,
      coverImage: '/placeholder-track.jpg'
    },
    {
      id: '2',
      title: 'Mountain Echoes',
      artist: 'Divine Ikirezi',
      plays: 9800,
      likes: 756,
      coverImage: '/placeholder-track.jpg'
    },
    {
      id: '3',
      title: 'City Lights',
      artist: 'Benji Flavours',
      plays: 15600,
      likes: 1200,
      coverImage: '/placeholder-track.jpg'
    }
  ]
  
  const creators: Creator[] = [
    {
      id: '1',
      name: 'Kizito M',
      type: 'Artist',
      followers: 12500,
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: '2',
      name: 'Divine Ikirezi',
      type: 'Producer',
      followers: 8900,
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: '3',
      name: 'Benji Flavours',
      type: 'DJ',
      followers: 15600,
      avatar: '/placeholder-avatar.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative py-12 sm:py-20 lg:py-28 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-4 sm:mb-6">
              Explore Rwandan Music
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-10">
              Discover trending tracks and talented creators from Rwanda's vibrant music scene
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search tracks, artists, albums..."
                className="w-full py-3 sm:py-4 px-4 sm:px-6 pl-10 sm:pl-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
              />
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 sm:px-8 py-12 sm:py-16 md:py-20 pb-32 flex-1">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {tracks.map((track) => (
              <div key={track.id} className="group card-bg rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                <div className="relative">
                  <img 
                    src={track.coverImage} 
                    alt={track.title} 
                    className="w-full h-40 sm:h-48 md:h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <button className="p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
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

        {/* Creators Grid */}
        {activeTab === 'creators' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {creators.map((creator) => (
              <div key={creator.id} className="group card-bg rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[#FFCB2B]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FFCB2B]/10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="relative">
                    <img 
                      src={creator.avatar} 
                      alt={creator.name} 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#FF4D67] border-2 border-gray-900"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">{creator.name}</h3>
                    <p className="text-[#FFCB2B] text-xs sm:text-sm">{creator.type}</p>
                  </div>
                </div>
                
                <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-5">
                  Creating amazing music that resonates with the heart of Rwanda. 
                  Join thousands of fans enjoying their work.
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {creator.followers.toLocaleString()} followers
                  </span>
                  <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs sm:text-sm font-medium transition-colors">
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
