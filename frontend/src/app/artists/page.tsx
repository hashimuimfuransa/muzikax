'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { fetchPopularCreators } from '@/services/trackService'

interface Creator {
  _id: string
  name: string
  creatorType: string
  followersCount: number
  avatar: string
}

// Function to generate avatar with first letter of name
const generateAvatar = (name: string) => {
  const firstLetter = name.charAt(0).toUpperCase()
  return (
    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center mx-auto">
      <span className="text-3xl font-bold text-white">{firstLetter}</span>
    </div>
  )
}

export default function ArtistsPage() {
  const [sortBy, setSortBy] = useState<'popular' | 'alphabetical'>('popular')
  const [searchTerm, setSearchTerm] = useState('')
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    const loadCreators = async () => {
      try {
        setLoading(true)
        const fetchedCreators = await fetchPopularCreators(100) // Fetch more creators
        setCreators(fetchedCreators)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch creators:', err)
        setError('Failed to load artists. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    loadCreators()
  }, [])
  
  // Filter and sort creators
  const filteredAndSortedCreators = useMemo(() => {
    // Filter creators based on search term
    const filtered = creators.filter(creator => 
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creator.creatorType && creator.creatorType.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    // Sort creators based on selected option
    return [...filtered].sort((a, b) => {
      if (sortBy === 'popular') {
        return b.followersCount - a.followersCount
      } else {
        return a.name.localeCompare(b.name)
      }
    })
  }, [creators, searchTerm, sortBy])
  
  const handleArtistClick = (creatorId: string) => {
    router.push(`/artists/${creatorId}`)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading artists...</div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Popular Artists</h1>
            <p className="text-gray-400">Discover the most popular artists and creators</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
              />
              <svg 
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm hidden sm:block">Sort by:</span>
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
        </div>
        
        {filteredAndSortedCreators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No artists found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedCreators.map((creator) => (
              <div 
                key={creator._id} 
                className="group card-bg rounded-xl p-5 transition-all duration-300 hover:border-[#FFCB2B]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FFCB2B]/10 cursor-pointer"
                onClick={() => handleArtistClick(creator._id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    {creator.avatar && creator.avatar.trim() !== '' ? (
                      <img 
                        src={creator.avatar} 
                        alt={creator.name} 
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      generateAvatar(creator.name)
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base truncate w-full">{creator.name}</h3>
                  <p className="text-[#FFCB2B] text-sm mb-3 capitalize">
                    {creator.creatorType || 'Artist'}
                  </p>
                  <p className="text-gray-500 text-xs mb-4">
                    {creator.followersCount?.toLocaleString() || 0} followers
                  </p>
                  <button 
                    className="w-full px-4 py-2 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-sm font-medium transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle follow action here
                    }}
                  >
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