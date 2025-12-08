'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

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

export default function RecentlyPlayed() {
  const [tracks, setTracks] = useState<Track[]>([])
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Don't render the recently played if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-2">
                Recently Played
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Your recently played tracks
              </p>
            </div>
            <button 
              onClick={() => router.push('/explore')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FF4D67] text-[#FF4D67] hover:bg-[#FF4D67]/10 rounded-full text-xs sm:text-sm font-medium transition-colors"
            >
              Explore More
            </button>
          </div>

          {tracks.length === 0 ? (
            // Empty State
            <div className="card-bg rounded-2xl p-8 sm:p-12 text-center border border-gray-700/50">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">No recently played tracks</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start listening to music and your recently played tracks will appear here
              </p>
              <button 
                onClick={() => router.push('/explore')}
                className="px-5 py-2.5 sm:px-6 sm:py-3 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Explore Music
              </button>
            </div>
          ) : (
            // Recently Played List
            <div className="space-y-4">
              {tracks.map((track) => (
                <div key={track.id} className="card-bg rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50">
                  <div className="relative">
                    <img 
                      src={track.coverImage} 
                      alt={track.title} 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                    />
                    <button className="absolute inset-0 w-full h-full rounded-lg bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm sm:text-base truncate">{track.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{track.artist}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs sm:text-sm hidden sm:block">
                      {track.duration || '3:45'}
                    </span>
                    <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800/50 transition-colors">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4D67]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}