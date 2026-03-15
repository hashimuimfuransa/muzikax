'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import Link from 'next/link'
import { fetchCreatorTracks } from '../../../services/creatorService'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface UserProfile {
  _id: string
  name: string
  avatar?: string
  bio?: string
  followers?: number
  followersCount?: number
  following?: number
  followingCount?: number
  creatorType?: string
  role?: string
  genres?: string[]
  whatsappContact?: string
  createdAt?: string
}

interface Track {
  _id: string
  id?: string
  title: string
  artist: string
  coverURL?: string
  plays?: number
  likes?: number
  creatorId: string
}

export default function UserProfile() {
  const params = useParams()
  const userId = params?.id as string
  const router = useRouter()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return

      try {
        setLoading(true)
        
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')

        const response = await fetch(`${API_BASE_URL}/api/public/user/${userId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in to view user profiles')
            return
          }
          setError('User not found')
          return
        }

        const data = await response.json()
        
        // If user is an artist/creator, redirect to artist profile
        if (data.role === 'creator' || data.creatorType) {
          router.replace(`/artists/${userId}`)
          return
        }
        
        setProfile(data)

        const tracksResponse = await fetch(
          `${API_BASE_URL}/api/tracks?creatorId=${userId}&limit=50`
        )
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json()
          setTracks(tracksData.tracks || [])
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D67]"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The user you are looking for does not exist.'}</p>
          <Link href="/" className="inline-block bg-[#FF4D67] hover:bg-[#FF4D67]/80 text-white py-2 px-6 rounded-lg transition-colors">
            Back Home
          </Link>
        </div>
      </div>
    )
  }

  const followerCount = profile.followersCount || profile.followers || 0
  const followingCount = profile.followingCount || profile.following || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black pb-12">
      {/* Profile Header Section */}
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <Link href="/community" className="text-gray-400 hover:text-[#FF4D67] text-xs font-bold uppercase tracking-widest mb-8 inline-flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Community
          </Link>

          {/* User Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 mb-10 shadow-2xl">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#FF4D67]/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#FFCB2B]/5 rounded-full blur-[100px] pointer-events-none opacity-10"></div>

            <div className="relative z-10 p-6 md:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                {/* Avatar with Ring */}
                <div className="flex-shrink-0 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] rounded-full blur opacity-25"></div>
                  <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-gray-900 overflow-hidden shadow-2xl bg-gray-800">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
                        <span className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Text Content */}
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="px-3 py-1 bg-gray-900/60 backdrop-blur-md text-[#FF4D67] text-[10px] uppercase font-bold tracking-widest rounded-full border border-gray-700/50">
                      Member
                    </span>
                    {profile.creatorType && (
                      <span className="px-3 py-1 bg-[#FF4D67]/10 text-[#FF4D67] text-[10px] uppercase font-bold tracking-widest rounded-full border border-[#FF4D67]/20">
                        {profile.creatorType}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-md">
                    {profile.name}
                  </h1>

                  {/* Horizontal Stats for clarity */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-8 text-sm text-gray-400">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-lg">{tracks.length}</span>
                      <span className="text-[10px] uppercase tracking-widest font-medium">Tracks</span>
                    </div>
                    <div className="w-px h-10 bg-gray-700 hidden md:block"></div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-lg">{followerCount.toLocaleString()}</span>
                      <span className="text-[10px] uppercase tracking-widest font-medium">Followers</span>
                    </div>
                    <div className="w-px h-10 bg-gray-700 hidden md:block"></div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-lg">{followingCount.toLocaleString()}</span>
                      <span className="text-[10px] uppercase tracking-widest font-medium">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Content */}
            <div className="lg:w-1/3 space-y-8">
              {/* About Section */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700/30">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  About
                </h2>
                
                {profile.bio ? (
                  <p className="text-gray-400 leading-relaxed mb-6 italic text-sm">"{profile.bio}"</p>
                ) : (
                  <p className="text-gray-500 italic text-sm mb-6">No bio added yet.</p>
                )}

                {profile.genres && profile.genres.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-gray-700/50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Favorite Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.genres.map((genre, idx) => (
                        <span key={idx} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-lg border border-gray-700/50">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp Action */}
                {profile.whatsappContact && (
                  <div className="mt-8">
                    <a
                      href={`https://wa.me/${profile.whatsappContact.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl shadow-green-900/20 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.524.909 3.284 1.389 5.083 1.391 5.646.003 10.243-4.591 10.246-10.238.002-2.737-1.065-5.307-3.001-7.245-1.936-1.938-4.505-3.007-7.244-3.008-5.647 0-10.243 4.595-10.246 10.242-.001 1.93.52 3.811 1.507 5.435l.165.271-1.084 3.957 4.074-1.065zm10.59-6.345c-.277-.139-1.638-.809-1.892-.901-.254-.093-.439-.139-.624.139-.185.277-.717.901-.878 1.086-.161.185-.323.208-.6.069-.277-.139-1.17-.431-2.228-1.374-.824-.735-1.38-1.644-1.542-1.921-.162-.277-.017-.427.121-.565.125-.124.277-.323.416-.485.139-.161.185-.277.277-.462.093-.185.046-.347-.023-.485-.069-.139-.624-1.503-.855-2.057-.225-.541-.45-.467-.624-.476-.161-.008-.347-.01-.532-.01-.185 0-.485.069-.739.347-.254.277-.971.948-.971 2.312 0 1.364.993 2.682 1.132 2.867.139.185 1.953 2.982 4.731 4.183.661.286 1.177.457 1.579.585.663.211 1.267.181 1.744.11.533-.08 1.638-.67 1.869-1.318.231-.647.231-1.202.162-1.318-.069-.116-.254-.185-.531-.324z" />
                      </svg>
                      Message on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content (Recent Tracks) */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">Recent Activity</h2>
                <div className="h-px flex-1 bg-gray-800 ml-6 hidden sm:block"></div>
              </div>

              {tracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tracks.map((track) => (
                    <Link
                      key={track._id || track.id}
                      href={`/tracks/${track._id || track.id}`}
                      className="group flex flex-col bg-gray-800/20 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:bg-gray-800/40 hover:border-[#FF4D67]/40 transition-all duration-300 shadow-lg hover:shadow-[#FF4D67]/5"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={track.coverURL || '/placeholder-cover.jpg'}
                          alt={track.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-cover.jpg'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-3 left-3 flex gap-1">
                           <span className="px-2 py-0.5 bg-[#FF4D67] text-[9px] font-black text-white uppercase rounded">Track</span>
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-bold text-white group-hover:text-[#FF4D67] transition-colors mb-1 truncate text-sm">
                          {track.title}
                        </h3>
                        <p className="text-gray-400 text-xs truncate mb-4">{track.artist}</p>
                        
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-3 border-t border-gray-700/50">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-[#FF4D67]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              {track.plays || 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              {track.likes || 0}
                            </span>
                          </div>
                          <span className="text-[#FF4D67]">Play Now →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-gray-800/10 rounded-3xl border border-dashed border-gray-700/50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center text-gray-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No active tracks</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">This user hasn't uploaded any music or activity is currently hidden.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
