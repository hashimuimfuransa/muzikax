'use client'

import { useState, useEffect } from 'react'


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
    },
    {
      id: '4',
      title: 'Sunset Dreams',
      artist: 'Remy Kayitesi',
      plays: 8700,
      likes: 620,
      coverImage: '/placeholder-track.jpg'
    },
    {
      id: '5',
      title: 'Lake Kivu Breeze',
      artist: 'Theophile J',
      plays: 11200,
      likes: 950,
      coverImage: '/placeholder-track.jpg'
    }
  ]
  
  const newTracks: Track[] = [
    {
      id: '6',
      title: 'Kigali Nights',
      artist: 'Urban Sound',
      plays: 2400,
      likes: 180,
      coverImage: '/placeholder-track.jpg'
    },
    {
      id: '7',
      title: 'Nyamata Stories',
      artist: 'Peace M',
      plays: 1900,
      likes: 150,
      coverImage: '/placeholder-track.jpg'
    },
    {
      id: '8',
      title: 'Volcano Dreams',
      artist: 'Jean Paul',
      plays: 3200,
      likes: 280,
      coverImage: '/placeholder-track.jpg'
    }
  ]
  
  const popularCreators: Creator[] = [
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
    },
    {
      id: '4',
      name: 'Remy Kayitesi',
      type: 'Artist',
      followers: 9800,
      avatar: '/placeholder-avatar.jpg'
    }
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>

      {/* Mobile menu functionality is handled in the Navbar component */}



      {/* Main Content */}
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:block w-64 bg-gray-900/50 border-r border-gray-800 p-6 overflow-y-auto sticky top-0 h-screen">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:pt-0">
        {/* Enhanced Hero Section with Image Slider */}
        <section className="relative py-12 md:py-20 lg:py-28 overflow-hidden">
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
          
          <div className="container mx-auto px-4 md:px-8 relative z-10">
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

        {/* Music Lists */}
        <section className="container mx-auto px-4 md:px-8 py-12 sm:py-16 md:py-20 pb-32 flex-1">
          {/* Tabs */}
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="flex border-b border-gray-800 mb-6 min-w-max">
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
                      <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#FF4D67] border-2 border-gray-900"></div>
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