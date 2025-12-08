'use client'

import { useState, useEffect } from 'react'

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

interface Creator {
  id: string
  name: string
  type: string
  followers: number
  avatar: string
  verified?: boolean
}

interface Album {
  id: string
  title: string
  artist: string
  coverImage: string
  year: number
  tracks: number
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'popular'>('trending')
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Hero slider images
  const heroSlides = [
    {
      id: 1,
      title: "Discover Rwandan Music",
      subtitle: "Explore the vibrant sounds of Rwanda",
      image: "/placeholder-track.jpg",
      cta: "Explore Music"
    },
    {
      id: 2,
      title: "Share Your Talent",
      subtitle: "Upload your music and connect with fans",
      image: "/placeholder-avatar.jpg",
      cta: "Upload Track"
    },
    {
      id: 3,
      title: "Join Our Community",
      subtitle: "Connect with creators and music lovers",
      image: "/placeholder-track.jpg",
      cta: "Join Now"
    }
  ]
  
  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Mock data for tracks
  const trendingTracks: Track[] = [
    {
      id: '1',
      title: 'Rwandan Vibes',
      artist: 'Kizito M',
      album: 'East African Dreams',
      plays: 12400,
      likes: 890,
      coverImage: '/placeholder-track.jpg',
      duration: '3:45'
    },
    {
      id: '2',
      title: 'Mountain Echoes',
      artist: 'Divine Ikirezi',
      album: 'Nature Sounds',
      plays: 9800,
      likes: 756,
      coverImage: '/placeholder-track.jpg',
      duration: '4:22'
    },
    {
      id: '3',
      title: 'City Lights',
      artist: 'Benji Flavours',
      album: 'Urban Nights',
      plays: 15600,
      likes: 1200,
      coverImage: '/placeholder-track.jpg',
      duration: '3:18'
    },
    {
      id: '4',
      title: 'Sunset Dreams',
      artist: 'Remy Kayitesi',
      album: 'Golden Hour',
      plays: 8700,
      likes: 620,
      coverImage: '/placeholder-track.jpg',
      duration: '5:01'
    },
    {
      id: '5',
      title: 'Lake Kivu Breeze',
      artist: 'Theophile J',
      album: 'Water Reflections',
      plays: 11200,
      likes: 950,
      coverImage: '/placeholder-track.jpg',
      duration: '4:33'
    }
  ]
  
  const newTracks: Track[] = [
    {
      id: '6',
      title: 'Kigali Nights',
      artist: 'Urban Sound',
      album: 'Capital Chronicles',
      plays: 2400,
      likes: 180,
      coverImage: '/placeholder-track.jpg',
      duration: '3:55'
    },
    {
      id: '7',
      title: 'Nyamata Stories',
      artist: 'Peace M',
      album: 'Village Tales',
      plays: 1900,
      likes: 150,
      coverImage: '/placeholder-track.jpg',
      duration: '4:12'
    },
    {
      id: '8',
      title: 'Volcano Dreams',
      artist: 'Jean Paul',
      album: 'Fire & Earth',
      plays: 3200,
      likes: 280,
      coverImage: '/placeholder-track.jpg',
      duration: '3:47'
    },
    {
      id: '9',
      title: 'Akagera Sunrise',
      artist: 'Nature Beats',
      album: 'Wildlife Symphony',
      plays: 1500,
      likes: 95,
      coverImage: '/placeholder-track.jpg',
      duration: '5:22'
    }
  ]
  
  const popularCreators: Creator[] = [
    {
      id: '1',
      name: 'Kizito M',
      type: 'Artist',
      followers: 12500,
      avatar: '/placeholder-avatar.jpg',
      verified: true
    },
    {
      id: '2',
      name: 'Divine Ikirezi',
      type: 'Producer',
      followers: 8900,
      avatar: '/placeholder-avatar.jpg',
      verified: true
    },
    {
      id: '3',
      name: 'Benji Flavours',
      type: 'DJ',
      followers: 15600,
      avatar: '/placeholder-avatar.jpg',
      verified: true
    },
    {
      id: '4',
      name: 'Remy Kayitesi',
      type: 'Artist',
      followers: 9800,
      avatar: '/placeholder-avatar.jpg',
      verified: false
    },
    {
      id: '5',
      name: 'Theophile J',
      type: 'Songwriter',
      followers: 7600,
      avatar: '/placeholder-avatar.jpg',
      verified: true
    },
    {
      id: '6',
      name: 'Urban Sound',
      type: 'Band',
      followers: 22400,
      avatar: '/placeholder-avatar.jpg',
      verified: true
    }
  ]
  
  const popularAlbums: Album[] = [
    {
      id: '1',
      title: 'East African Dreams',
      artist: 'Kizito M',
      coverImage: '/placeholder-album.jpg',
      year: 2024,
      tracks: 12
    },
    {
      id: '2',
      title: 'Urban Nights',
      artist: 'Benji Flavours',
      coverImage: '/placeholder-album.jpg',
      year: 2023,
      tracks: 10
    },
    {
      id: '3',
      title: 'Nature Sounds',
      artist: 'Divine Ikirezi',
      coverImage: '/placeholder-album.jpg',
      year: 2024,
      tracks: 8
    },
    {
      id: '4',
      title: 'Capital Chronicles',
      artist: 'Urban Sound',
      coverImage: '/placeholder-album.jpg',
      year: 2023,
      tracks: 15
    },
    {
      id: '5',
      title: 'Golden Hour',
      artist: 'Remy Kayitesi',
      coverImage: '/placeholder-album.jpg',
      year: 2024,
      tracks: 11
    },
    {
      id: '6',
      title: 'Village Tales',
      artist: 'Peace M',
      coverImage: '/placeholder-album.jpg',
      year: 2023,
      tracks: 9
    }
  ]
  
  // For You section - personalized recommendations
  const forYouTracks: Track[] = [
    {
      id: '10',
      title: 'Morning Mist',
      artist: 'Kizito M',
      album: 'East African Dreams',
      plays: 8900,
      likes: 650,
      coverImage: '/placeholder-track.jpg',
      duration: '3:28'
    },
    {
      id: '11',
      title: 'Street Life',
      artist: 'Benji Flavours',
      album: 'Urban Nights',
      plays: 12300,
      likes: 980,
      coverImage: '/placeholder-track.jpg',
      duration: '4:05'
    },
    {
      id: '12',
      title: 'Mountain High',
      artist: 'Divine Ikirezi',
      album: 'Nature Sounds',
      plays: 7600,
      likes: 520,
      coverImage: '/placeholder-track.jpg',
      duration: '3:52'
    },
    {
      id: '13',
      title: 'City Pulse',
      artist: 'Urban Sound',
      album: 'Capital Chronicles',
      plays: 15600,
      likes: 1320,
      coverImage: '/placeholder-track.jpg',
      duration: '4:18'
    }
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black w-full relative overflow-hidden">
      {/* Background decorative elements - repositioned to avoid overflow */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10 hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10 hidden md:block"></div>

      {/* Mobile menu functionality is handled in the Navbar component */}

      {/* Main Content */}
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:block md:w-64 bg-gray-900/50 border-r border-gray-800 p-6 overflow-y-auto sticky top-0 h-screen flex-shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B]">
            MUZIKAX
          </h1>
        </div>
        
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#FF4D67]/10 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Home</span>
          </a>
          
          <a href="/explore" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span>Explore</span>
          </a>
          
          <a href="/upload" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <span>Upload</span>
          </a>
          
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Dashboard</span>
          </a>
        </nav>
        
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Categories</h2>
          <nav className="space-y-1">
            <a href="#" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">Afrobeat</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">Hip Hop</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">R&B</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">Afropop</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">Gospel</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">Traditional</a>
          </nav>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Library</h2>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span>Favorites</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Recently Played</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content Area - This takes remaining space */}
      <main className="flex-1 flex flex-col w-full">
        {/* Enhanced Hero Section with Image Slider */}
        <section className="relative py-12 md:py-20 lg:py-28 overflow-hidden w-full">
          <div className="absolute inset-0">
            {heroSlides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-gray-900/30"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-full px-4 md:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-4 sm:mb-6 animate-fade-in">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-8 animate-fade-in-delay">
                {heroSlides[currentSlide].subtitle}
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center animate-fade-in-delay-2">
                <button className="px-5 py-2.5 sm:px-6 sm:py-3 btn-primary font-medium rounded-lg transition-all hover:scale-105 text-sm sm:text-base">
                  {heroSlides[currentSlide].cta}
                </button>
                <button className="px-5 py-2.5 sm:px-6 sm:py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg transition-all hover:bg-white/10 text-sm sm:text-base">
                  Learn More
                </button>
              </div>
            </div>
          </div>
          
          {/* Slider Indicators */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-[#FF4D67] w-4 sm:w-6' 
                    : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation Arrows - Hidden on mobile */}
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="hidden sm:flex absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="hidden sm:flex absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </section>

        {/* For You Section */}
        <section className="w-full px-4 md:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">For You</h2>
            <a href="#" className="text-[#FF4D67] hover:text-[#FFCB2B] text-sm sm:text-base transition-colors">
              View All
            </a>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {forYouTracks.map((track) => (
              <div key={track.id} className="group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                <div className="relative">
                  <img 
                    src={track.coverImage} 
                    alt={track.title} 
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
                  <h3 className="font-bold text-white text-sm sm:text-base mb-1 truncate">{track.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Artists Section */}
        <section className="w-full px-4 md:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Artists</h2>
            <a href="#" className="text-[#FF4D67] hover:text-[#FFCB2B] text-sm sm:text-base transition-colors">
              View All
            </a>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularCreators.map((creator) => (
              <div key={creator.id} className="group card-bg rounded-xl p-4 transition-all duration-300 hover:border-[#FFCB2B]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FFCB2B]/10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <img 
                      src={creator.avatar} 
                      alt={creator.name} 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto"
                    />
                    {creator.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF4D67] border-2 border-gray-900 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm sm:text-base truncate w-full">{creator.name}</h3>
                  <p className="text-[#FFCB2B] text-xs sm:text-sm mb-2">{creator.type}</p>
                  <p className="text-gray-500 text-xs">
                    {creator.followers.toLocaleString()} followers
                  </p>
                  <button className="mt-2 w-full px-3 py-1.5 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs font-medium transition-colors">
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Albums Section */}
        <section className="w-full px-4 md:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Albums</h2>
            <a href="#" className="text-[#FF4D67] hover:text-[#FFCB2B] text-sm sm:text-base transition-colors">
              View All
            </a>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularAlbums.map((album) => (
              <div key={album.id} className="group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
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
        </section>

        {/* Music Lists */}
        <section className="w-full px-4 md:px-8 py-8 sm:py-10 pb-8">
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

          {/* Trending Tracks */}
          {activeTab === 'trending' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trendingTracks.map((track) => (
                <div key={track.id} className="group card-bg rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                  <div className="relative">
                    <img 
                      src={track.coverImage} 
                      alt={track.title} 
                      className="w-full h-40 sm:h-48 object-cover"
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
                    <p className="text-gray-400 text-sm sm:text-base mb-1 truncate">{track.artist}</p>
                    {track.album && <p className="text-gray-500 text-xs sm:text-sm mb-3 truncate">{track.album}</p>}
                    
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

          {/* New Releases */}
          {activeTab === 'new' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {newTracks.map((track) => (
                <div key={track.id} className="group card-bg rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
                  <div className="relative">
                    <img 
                      src={track.coverImage} 
                      alt={track.title} 
                      className="w-full h-40 sm:h-48 object-cover"
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
                    <p className="text-gray-400 text-sm sm:text-base mb-1 truncate">{track.artist}</p>
                    {track.album && <p className="text-gray-500 text-xs sm:text-sm mb-3 truncate">{track.album}</p>}
                    
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

          {/* Popular Creators */}
          {activeTab === 'popular' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {popularCreators.map((creator) => (
                <div key={creator.id} className="group card-bg rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[#FFCB2B]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FFCB2B]/10">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="relative">
                      <img 
                        src={creator.avatar} 
                        alt={creator.name} 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                      />
                      {creator.verified && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#FF4D67] border-2 border-gray-900"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base sm:text-lg">{creator.name}</h3>
                      <p className="text-[#FFCB2B] text-xs sm:text-sm">{creator.type}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-5">
                    Creating amazing music that resonates with the heart of Rwanda.
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
        </section>
      </main>
    </div>
  )
}