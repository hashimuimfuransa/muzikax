'use client'

import { useState } from 'react'

interface Creator {
  id: string
  name: string
  type: string
  followers: number
  avatar: string
  verified?: boolean
}

export default function ArtistsPage() {
  const [sortBy, setSortBy] = useState<'popular' | 'alphabetical'>('popular')
  
  // Mock data for creators with real image URLs
  const creators: Creator[] = [
    {
      id: '1',
      name: 'The Weeknd',
      type: 'Artist',
      followers: 12500,
      avatar: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
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
    },
    {
      id: '7',
      name: 'Billie Eilish',
      type: 'Artist',
      followers: 5400,
      avatar: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: false
    },
    {
      id: '8',
      name: 'Harry Styles',
      type: 'Artist',
      followers: 6700,
      avatar: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    },
    {
      id: '9',
      name: 'Taylor Swift',
      type: 'Artist',
      followers: 3200,
      avatar: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: false
    },
    {
      id: '10',
      name: 'Ed Sheeran',
      type: 'Artist',
      followers: 8900,
      avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    },
    {
      id: '11',
      name: 'Ariana Grande',
      type: 'Artist',
      followers: 4500,
      avatar: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: false
    },
    {
      id: '12',
      name: 'Bruno Mars',
      type: 'Artist',
      followers: 6200,
      avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      verified: true
    }
  ]

  // Sort creators based on selected option
  const sortedCreators = [...creators].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.followers - a.followers
    } else {
      return a.name.localeCompare(b.name)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Popular Artists</h1>
            <p className="text-gray-400">Discover the most popular artists and creators</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
            >
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedCreators.map((creator) => (
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
      </div>
    </div>
  )
}