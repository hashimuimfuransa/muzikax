'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { useAuth } from '@/contexts/AuthContext'
import { fetchTracksByCreatorPublic } from '@/services/trackService'
import { getAlbumsByCreator } from '@/services/albumService'

interface Creator {
  _id: string
  name: string
  creatorType: string
  followersCount: number
  avatar: string
  bio: string
  socials?: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    soundcloud?: string
  }
  createdAt: string
}

interface Track {
  _id: string
  title: string
  artist: string
  album?: string
  duration: number // in seconds
  plays: number
  coverArt?: string
  audioUrl: string
  createdAt: string
  albumId?: string // Added to identify if track belongs to an album
}

interface Album {
  id: string
  title: string
  artist: string
  coverImage: string
  year: number
  tracks: number
  createdAt: string
}

interface CreatorStats {
  totalPlays: number
  monthlyPlays: number
  totalTracks: number
}

// Function to generate avatar with first letter of name
const generateAvatar = (name: string) => {
  const firstLetter = name.charAt(0).toUpperCase()
  return (
    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
      <span className="text-4xl font-bold text-white">{firstLetter}</span>
    </div>
  )
}

// Format duration from seconds to MM:SS
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// Format large numbers (e.g., 1.2K, 3.4M)
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export default function ArtistProfilePage() {
  const [creator, setCreator] = useState<Creator | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([]) // Added for storing albums
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums'>('tracks') // Added for tab switching
  const [searchFilter, setSearchFilter] = useState('') // Added for search filtering
  const params = useParams()
  const router = useRouter()
  const { playTrack } = useAudioPlayer()
  const { user } = useAuth()
  
  const creatorId = params.id as string
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch creator data
        const creatorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/creators/${creatorId}`)
        
        if (!creatorResponse.ok) {
          throw new Error(`Failed to fetch creator: ${creatorResponse.status} ${creatorResponse.statusText}`)
        }
        
        const creatorData = await creatorResponse.json()
        setCreator(creatorData)
        
        // Fetch creator's tracks using the new public function
        try {
          const tracksData = await fetchTracksByCreatorPublic(creatorId)
          setTracks(tracksData)
        } catch (tracksError) {
          console.error('Failed to fetch tracks:', tracksError)
          setTracks([])
        }
        
        // Fetch creator's albums
        try {
          const albumsData = await getAlbumsByCreator(creatorId)
          // Transform albums to match our interface
          const transformedAlbums = albumsData.map((album: any) => ({
            id: album._id || album.id,
            title: album.title,
            artist: album.creatorId?.name || creatorData.name || 'Unknown Artist',
            coverImage: album.coverURL || '',
            year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : new Date().getFullYear(),
            tracks: Array.isArray(album.tracks) ? album.tracks.length : 0,
            createdAt: album.createdAt || new Date().toISOString()
          }))
          setAlbums(transformedAlbums)
        } catch (albumsError) {
          console.error('Failed to fetch albums:', albumsError)
          setAlbums([])
        }
        
        // Fetch creator stats
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/creators/${creatorId}/stats`)
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
        
        setError(null)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load artist profile. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    if (creatorId) {
      fetchData()
    }
  }, [creatorId])
  
  const handlePlayTrack = (track: Track) => {
    // Validate that we have a valid audio URL
    if (!track.audioUrl || track.audioUrl.trim() === '') {
      console.error('Invalid audio URL for track:', track);
      return;
    }
    
    // Convert track to the format expected by the audio player
    const playerTrack = {
      id: track._id,
      title: track.title,
      artist: track.artist,
      coverImage: track.coverArt || '', // This is handled in the audio player component
      audioUrl: track.audioUrl,
      duration: track.duration,
      creatorId: creatorId // The current artist's ID
    };
    
    playTrack(playerTrack);
  }

  // Filter tracks to separate singles from album tracks
  const getSingles = () => {
    return tracks.filter(track => !track.albumId || track.albumId.trim() === '');
  };

  // Filter tracks based on search filter
  const getFilteredTracks = () => {
    const singles = getSingles();
    if (!searchFilter) return singles;
    
    return singles.filter(track => 
      track.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchFilter.toLowerCase())
    );
  };

  // Filter albums based on search filter
  const getFilteredAlbums = () => {
    if (!searchFilter) return albums;
    
    return albums.filter(album => 
      album.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchFilter.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading artist profile...</div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">{error || 'Artist not found'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Artists
        </button>
        
        {/* Artist Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              {creator.avatar && creator.avatar.trim() !== '' ? (
                <img 
                  src={creator.avatar} 
                  alt={creator.name} 
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                generateAvatar(creator.name)
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{creator.name}</h1>
              <p className="text-[#FFCB2B] text-lg mb-4 capitalize">{creator.creatorType || 'Artist'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <p className="text-gray-400 text-sm">Followers</p>
                  <p className="text-white font-bold">{creator.followersCount?.toLocaleString() || 0}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <p className="text-gray-400 text-sm">Tracks</p>
                  <p className="text-white font-bold">{stats?.totalTracks || tracks.length}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <p className="text-gray-400 text-sm">Total Plays</p>
                  <p className="text-white font-bold">{formatNumber(stats?.totalPlays || 0)}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <p className="text-gray-400 text-sm">Monthly Plays</p>
                  <p className="text-white font-bold">{formatNumber(stats?.monthlyPlays || 0)}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <p className="text-gray-400 text-sm">Member Since</p>
                  <p className="text-white font-bold">
                    {new Date(creator.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                </div>
              </div>
              
              <button 
                className="px-6 py-3 bg-[#FF4D67] hover:bg-[#FF4D67]/90 text-white rounded-full font-medium transition-colors"
                onClick={() => {
                  // Handle follow action here
                  if (!user) {
                    router.push('/login');
                  } else {
                    console.log('Following', creator.name);
                    // In a real implementation, you would make an API call to follow the creator
                  }
                }}
              >
                Follow
              </button>            </div>
          </div>
        </div>
        
        {/* Artist Bio */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">About</h2>
          <p className="text-gray-300">
            {creator.bio || `${creator.name} is a talented ${creator.creatorType || 'artist'} on MuzikaX. Stay tuned for their upcoming releases!`}
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search tracks or albums..."
              className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'tracks' ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('tracks')}
          >
            Singles ({getSingles().length})
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'albums' ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('albums')}
          >
            Albums ({albums.length})
          </button>
        </div>
        
        {/* Content Section */}
        {activeTab === 'tracks' ? (
          /* Tracks Section */
          <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Singles</h2>
              <span className="text-gray-400">{getFilteredTracks().length} tracks</span>
            </div>
            
            {getFilteredTracks().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No singles available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredTracks().map((track) => (
                  <div 
                    key={track._id} 
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-700/50 transition-colors group"
                  >
                    <button 
                      onClick={() => handlePlayTrack(track)}
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF4D67] flex items-center justify-center hover:bg-[#FF4D67]/90 transition-colors"
                    >
                      <svg className="w-4 h-4 text-white ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                      {track.coverArt && track.coverArt.trim() !== '' ? (
                        <img 
                          src={track.coverArt} 
                          alt={track.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h3 className="text-white font-medium truncate">{track.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{track.artist}{track.album ? ` • ${track.album}` : ''}</p>
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      {formatNumber(track.plays)} plays
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Albums Section */
          <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Albums</h2>
              <span className="text-gray-400">{getFilteredAlbums().length} albums</span>
            </div>
            
            {getFilteredAlbums().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No albums available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {getFilteredAlbums().map((album) => (
                  <div 
                    key={album.id} 
                    className="group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10 cursor-pointer"
                    onClick={() => router.push(`/album/${album.id}`)}
                  >
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
                ))}
              </div>
            )}
          </div>
        )
      }

      {/* Social Links */}
      {creator.socials && Object.values(creator.socials).some(link => link) && (
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Connect</h2>
          <div className="flex flex-wrap gap-4">
            {creator.socials?.facebook && (
              <a 
                href={creator.socials.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z" />
                </svg>
                Facebook
              </a>
            )}
              
            {creator.socials?.twitter && (
              <a 
                href={creator.socials.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  Twitter
                </a>
              )}
              
              {creator.socials?.instagram && (
                <a 
                  href={creator.socials.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.948 0-3.259.014-3.668.072-4.948zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Instagram
                </a>
              )}
            </div>
          </div>
        )
      }
      </div>
    </div>
  )
}