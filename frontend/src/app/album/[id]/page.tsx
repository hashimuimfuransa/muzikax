'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'
import { useAudioPlayer } from '../../../contexts/AudioPlayerContext'
import { getAlbumById } from '../../../services/albumService'

interface Creator {
  _id: string;
  name: string;
  avatar?: string;
}

interface AlbumTrack {
  _id: string;
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  coverURL?: string;
  duration?: string;
  audioUrl: string;
  audioURL: string;
  plays: number;
  likes: number;
  creatorId: string | Creator;
  type?: 'song' | 'beat' | 'mix'; // Add track type for WhatsApp functionality
  creatorWhatsapp?: string; // Add creator's WhatsApp contact
}

interface Album {
  _id: string;
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  coverURL?: string;
  year: number;
  tracks: AlbumTrack[];
  description?: string;
  genre?: string;
  creatorId: string | Creator;
  releaseDate?: string;
  createdAt: string;
}

export default function AlbumDetailPage() {
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist } = useAudioPlayer()
  const router = useRouter()

  // Fetch album details
  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const albumData: any = await getAlbumById(id as string)
        console.log('Raw album data:', JSON.stringify(albumData, null, 2))
        
        // Transform the album data to match our interface
        const transformedAlbum: Album = {
          _id: albumData._id || '',
          id: albumData._id || albumData.id || (id as string),
          title: albumData.title,
          artist: (albumData.creatorId && typeof albumData.creatorId === "object" && albumData.creatorId !== null) 
            ? albumData.creatorId.name 
            : "Unknown Artist",
          coverImage: (albumData.coverURL || albumData.coverImage) || "",
          coverURL: albumData.coverURL,
          year: (albumData.releaseDate || albumData.createdAt) ? new Date(albumData.releaseDate || albumData.createdAt).getFullYear() : new Date().getFullYear(),
          tracks: (Array.isArray(albumData.tracks) ? albumData.tracks : []).map((track: any) => {
            console.log('Raw track data:', JSON.stringify(track, null, 2));
            const artist = (track.creatorId && typeof track.creatorId === "object" && track.creatorId !== null) 
              ? (track.creatorId.name || "Unknown Artist")
              : (typeof track.creatorId === "string") 
              ? track.creatorId 
              : "Unknown Artist";
            console.log('Processed artist:', artist);
            return {
              _id: track._id || '',
              id: track._id || track.id || '',
              title: track.title,
              artist: artist,
              coverImage: (track.coverURL || track.coverImage) || "",
              coverURL: track.coverURL,
              duration: "3:45", // Placeholder
              audioUrl: track.audioURL,
              audioURL: track.audioURL,
              plays: track.plays || 0,
              likes: track.likes || 0,
              creatorId: track.creatorId || '',
              type: track.type || 'song', // Include track type for WhatsApp functionality
              creatorWhatsapp: (track.creatorId && typeof track.creatorId === 'object' && track.creatorId !== null) 
                ? track.creatorId.whatsappContact 
                : undefined // Include creator's WhatsApp contact
            };
          }),
          description: albumData.description,
          genre: albumData.genre,
          creatorId: albumData.creatorId || '',
          releaseDate: albumData.releaseDate,
          createdAt: albumData.createdAt
        }
        
        setAlbum(transformedAlbum)
        // Convert tracks to the format expected by the audio player
        const playerTracks = transformedAlbum.tracks.map(track => ({
          id: track._id || track.id,
          title: track.title,
          artist: track.artist,
          coverImage: track.coverImage,
          audioUrl: track.audioUrl,
          creatorId: typeof track.creatorId === 'object' ? track.creatorId._id : track.creatorId,
          type: track.type, // Include track type for WhatsApp functionality
          creatorWhatsapp: track.creatorWhatsapp // Include creator's WhatsApp contact
        }))
        setCurrentPlaylist(playerTracks)
      } catch (err: any) {
        console.error('Error fetching album:', err)
        setError(err.message || 'Failed to load album')
      } finally {
        setLoading(false)
      }
    }

    fetchAlbum()
  }, [id])

  const handlePlayAlbum = () => {
    if (album && album.tracks.length > 0) {
      const firstTrack = album.tracks[0]
      playTrack({
        id: firstTrack._id || firstTrack.id,
        title: firstTrack.title,
        artist: firstTrack.artist,
        coverImage: firstTrack.coverImage,
        audioUrl: firstTrack.audioUrl,
        plays: firstTrack.plays || 0,
        likes: firstTrack.likes || 0,
        creatorId: typeof firstTrack.creatorId === 'object' ? firstTrack.creatorId._id : firstTrack.creatorId,
        type: firstTrack.type, // Include track type for WhatsApp functionality
        creatorWhatsapp: firstTrack.creatorWhatsapp // Include creator's WhatsApp contact
      })
    }
  }

  const handlePlayTrack = (track: AlbumTrack) => {
    playTrack({
      id: track._id || track.id,
      title: track.title,
      artist: track.artist,
      coverImage: track.coverImage,
      audioUrl: track.audioUrl,
      plays: track.plays || 0,
      likes: track.likes || 0,
      creatorId: typeof track.creatorId === 'object' ? track.creatorId._id : track.creatorId,
      type: track.type, // Include track type for WhatsApp functionality
      creatorWhatsapp: track.creatorWhatsapp // Include creator's WhatsApp contact
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading album...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl mb-4">Error loading album</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl mb-4">Album not found</h2>
          <button 
            onClick={() => router.push('/albums')}
            className="px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors"
          >
            Browse Albums
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>

          {/* Album Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="md:w-1/3">
              <div className="relative">
                {(album.coverURL || album.coverImage) && (album.coverURL || album.coverImage).trim() !== '' ? (
                  <img 
                    src={album.coverURL || album.coverImage} 
                    alt={album.title} 
                    className="w-full rounded-2xl shadow-2xl"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] rounded-2xl flex items-center justify-center">
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="flex flex-col justify-end h-full">
                <p className="text-[#FFCB2B] text-sm uppercase tracking-wider mb-2">Album</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{album.title}</h1>
                <p className="text-xl text-gray-300 mb-6">
                  <Link href={`/artist/${album.artist}`} className="hover:text-white transition-colors">
                    {album.artist}
                  </Link>
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-8">
                  <span>{album.year}</span>
                  <span>•</span>
                  <span>{album.tracks.length} songs</span>
                  <span>•</span>
                  <span>{album.genre}</span>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handlePlayAlbum}
                    className="px-8 py-3 gradient-primary rounded-full text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                    Play Album
                  </button>
                </div>
                
                {album.description && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                    <p className="text-gray-400">{album.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Track List */}
          <div className="card-bg rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Tracks</h2>
            
            <div className="space-y-2">
              {album.tracks.map((track, index) => (
                <div 
                  key={track._id || track.id}
                  className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    currentTrack?.id === (track._id || track.id) ? 'bg-gray-800/50' : ''
                  }`}
                  onClick={() => handlePlayTrack(track)}
                >
                  {/* Track Cover Image */}
                  <div className="w-12 h-12 flex-shrink-0">
                    {(track.coverURL || track.coverImage) && (track.coverURL || track.coverImage).trim() !== '' ? (
                      <img 
                        src={track.coverURL || track.coverImage} 
                        alt={track.title} 
                        className="w-full h-full rounded object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-8 text-center text-gray-500">
                    {currentTrack?.id === (track._id || track.id) && isPlaying ? (
                      <div className="flex justify-center">
                        <div className="w-1 h-3 bg-[#FF4D67] mx-0.5 animate-pulse"></div>
                        <div className="w-1 h-3 bg-[#FF4D67] mx-0.5 animate-pulse delay-75"></div>
                        <div className="w-1 h-3 bg-[#FF4D67] mx-0.5 animate-pulse delay-150"></div>
                      </div>
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{track.title}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {typeof track.creatorId === 'object' && track.creatorId !== null 
                        ? track.creatorId.name 
                        : typeof track.creatorId === 'string' 
                        ? track.creatorId 
                        : 'Unknown Artist'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-xs">{track.plays}</span>
                    </div>
                    
                    <button className="text-gray-500 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}