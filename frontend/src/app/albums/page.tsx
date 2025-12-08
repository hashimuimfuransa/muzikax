'use client'

import { useState } from 'react'

interface Album {
  id: string
  title: string
  artist: string
  coverImage: string
  year: number
  tracks: number
  duration: string
}

export default function AlbumsPage() {
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>('popular')
  
  // Mock data for albums with real image URLs
  const albums: Album[] = [
    {
      id: '1',
      title: 'After Hours',
      artist: 'The Weeknd',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2020,
      tracks: 14,
      duration: '56:32'
    },
    {
      id: '2',
      title: 'Future Nostalgia',
      artist: 'Dua Lipa',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2020,
      tracks: 11,
      duration: '38:45'
    },
    {
      id: '3',
      title: 'Fine Line',
      artist: 'Harry Styles',
      coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2019,
      tracks: 12,
      duration: '39:18'
    },
    {
      id: '4',
      title: 'SOUR',
      artist: 'Olivia Rodrigo',
      coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2021,
      tracks: 11,
      duration: '34:23'
    },
    {
      id: '5',
      title: 'Justice',
      artist: 'Justin Bieber',
      coverImage: 'https://images.unsplash.com/photo-1514320291841-38b60f8f72d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2021,
      tracks: 16,
      duration: '47:12'
    },
    {
      id: '6',
      title: 'Planet Her',
      artist: 'Doja Cat',
      coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2021,
      tracks: 14,
      duration: '41:22'
    },
    {
      id: '7',
      title: 'Happier Than Ever',
      artist: 'Billie Eilish',
      coverImage: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2021,
      tracks: 16,
      duration: '53:45'
    },
    {
      id: '8',
      title: 'Map of the Soul: 7',
      artist: 'BTS',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2020,
      tracks: 13,
      duration: '48:33'
    },
    {
      id: '9',
      title: 'Positions',
      artist: 'Ariana Grande',
      coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2020,
      tracks: 14,
      duration: '31:25'
    },
    {
      id: '10',
      title: 'Evermore',
      artist: 'Taylor Swift',
      coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2020,
      tracks: 15,
      duration: '53:10'
    },
    {
      id: '11',
      title: 'Chromatica',
      artist: 'Lady Gaga',
      coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2020,
      tracks: 16,
      duration: '49:33'
    },
    {
      id: '12',
      title: 'Dawn FM',
      artist: 'The Weeknd',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      year: 2022,
      tracks: 16,
      duration: '52:11'
    }
  ]

  // Sort albums based on selected option
  const sortedAlbums = [...albums].sort((a, b) => {
    if (sortBy === 'popular') {
      return parseInt(b.id) - parseInt(a.id) // Simulate popularity by ID
    } else if (sortBy === 'recent') {
      return b.year - a.year || parseInt(b.id) - parseInt(a.id)
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Popular Albums</h1>
            <p className="text-gray-400">Discover the most popular albums from artists</p>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedAlbums.map((album) => (
            <div key={album.id} className="group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
              <div className="relative">
                <img 
                  src={album.coverImage} 
                  alt={album.title} 
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
                <h3 className="font-bold text-white text-base mb-1 truncate">{album.title}</h3>
                <p className="text-gray-400 text-sm truncate">{album.artist}</p>
                
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <span>{album.year}</span>
                  <div className="flex items-center gap-2">
                    <span>{album.tracks} tracks</span>
                    <span>•</span>
                    <span>{album.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}