'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'

interface Post {
  id: string
  user: {
    name: string
    avatar: string
    role: string
  }
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  liked: boolean
}

interface Member {
  id: string
  name: string
  avatar: string
  role: string
  followers: number
  isFollowing: boolean
}

interface Event {
  id: string
  title: string
  date: string
  location: string
  attendees: number
  image: string
}

export default function Community() {
  const { isAuthenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'events'>('feed')
  const [newPost, setNewPost] = useState('')

  // Mock data for community posts
  const posts: Post[] = [
    {
      id: '1',
      user: {
        name: 'Kizito M',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        role: 'Artist'
      },
      content: 'Just dropped my new single "Rwandan Vibes"! Would love to hear what you think about it. Available on all platforms now.',
      timestamp: '2 hours ago',
      likes: 124,
      comments: 28,
      shares: 12,
      liked: false
    },
    {
      id: '2',
      user: {
        name: 'Benji Flavours',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        role: 'DJ'
      },
      content: 'Excited to announce my upcoming live session at Kigali Jazz Festival next month! Who\'s coming?',
      timestamp: '5 hours ago',
      likes: 89,
      comments: 15,
      shares: 7,
      liked: true
    },
    {
      id: '3',
      user: {
        name: 'Remy Kayitesi',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        role: 'Producer'
      },
      content: 'Working on some fresh beats today. Anyone interested in collaborating on a new project? Hit me up!',
      timestamp: '1 day ago',
      likes: 210,
      comments: 42,
      shares: 23,
      liked: false
    }
  ]

  // Mock data for community members
  const members: Member[] = [
    {
      id: '1',
      name: 'Kizito M',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      role: 'Artist',
      followers: 12400,
      isFollowing: true
    },
    {
      id: '2',
      name: 'Benji Flavours',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      role: 'DJ',
      followers: 8900,
      isFollowing: false
    },
    {
      id: '3',
      name: 'Remy Kayitesi',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      role: 'Producer',
      followers: 15600,
      isFollowing: true
    },
    {
      id: '4',
      name: 'Gloria Muhire',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      role: 'Artist',
      followers: 7200,
      isFollowing: false
    },
    {
      id: '5',
      name: 'Theophile J',
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      role: 'Songwriter',
      followers: 9800,
      isFollowing: false
    }
  ]

  // Mock data for events
  const events: Event[] = [
    {
      id: '1',
      title: 'Kigali Jazz Festival',
      date: 'June 15, 2023',
      location: 'Kigali Convention Center',
      attendees: 2400,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: '2',
      title: 'Afro Beats Workshop',
      date: 'July 22, 2023',
      location: 'Nyabihu Cultural Center',
      attendees: 120,
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: '3',
      title: 'Producer Meetup',
      date: 'August 5, 2023',
      location: 'Kigali Innovation City',
      attendees: 85,
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    }
  ]

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPost.trim() === '') return
    
    // In a real app, this would submit to an API
    alert(`Posted: ${newPost}`)
    setNewPost('')
  }

  const toggleLike = (postId: string) => {
    // In a real app, this would update the like status via API
    console.log(`Toggled like for post ${postId}`)
  }

  const toggleFollow = (memberId: string) => {
    // In a real app, this would update the follow status via API
    console.log(`Toggled follow for member ${memberId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4">
              Community Hub
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
              Connect with fellow creators and music lovers. Share your journey, discover new talent, and stay updated with events.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-[#FF4D67]/20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Community Members</p>
                  <p className="text-2xl font-bold text-white">12,402</p>
                </div>
              </div>
            </div>
            
            <div className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-[#FFCB2B]/20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#FFCB2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Posts This Week</p>
                  <p className="text-2xl font-bold text-white">1,248</p>
                </div>
              </div>
            </div>
            
            <div className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-[#4DFF9E]/20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#4DFF9E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Upcoming Events</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Create Post */}
              {isAuthenticated && (
                <div className="card-bg rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 border border-gray-700/50">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <form onSubmit={handlePostSubmit} className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Share your thoughts with the community..."
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] resize-none"
                        rows={3}
                      />
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-3 text-gray-400">
                          <button type="button" className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </button>
                          <button type="button" className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={!newPost.trim()}
                          className={`px-4 py-2 rounded-full font-medium text-sm ${
                            newPost.trim()
                              ? 'bg-[#FF4D67] text-white hover:bg-[#FF4D67]/90'
                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          } transition-colors`}
                        >
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-gray-800 mb-6 sm:mb-8">
                <button
                  className={`pb-3 px-4 text-sm font-medium ${
                    activeTab === 'feed'
                      ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('feed')}
                >
                  Feed
                </button>
                <button
                  className={`pb-3 px-4 text-sm font-medium ${
                    activeTab === 'members'
                      ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('members')}
                >
                  Members
                </button>
                <button
                  className={`pb-3 px-4 text-sm font-medium ${
                    activeTab === 'events'
                      ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('events')}
                >
                  Events
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'feed' && (
                <div className="space-y-5 sm:space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <img
                          src={post.user.avatar}
                          alt={post.user.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-bold text-white">{post.user.name}</h3>
                              <p className="text-gray-400 text-xs sm:text-sm">{post.user.role} • {post.timestamp}</p>
                            </div>
                            <button className="text-gray-500 hover:text-white">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                              </svg>
                            </button>
                          </div>
                          
                          <p className="text-gray-200 mt-3 mb-4">
                            {post.content}
                          </p>
                          
                          <div className="flex gap-5 sm:gap-6 pt-2 border-t border-gray-800/50">
                            <button 
                              onClick={() => toggleLike(post.id)}
                              className={`flex items-center gap-1.5 text-sm ${
                                post.liked ? 'text-[#FF4D67]' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              <svg className="w-5 h-5" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                              </svg>
                              <span>{post.likes}</span>
                            </button>
                            
                            <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                              </svg>
                              <span>{post.comments}</span>
                            </button>
                            
                            <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                              </svg>
                              <span>{post.shares}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'members' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {members.map((member) => (
                    <div key={member.id} className="card-bg rounded-2xl p-5 border border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{member.name}</h3>
                          <p className="text-[#FFCB2B] text-sm">{member.role}</p>
                          <p className="text-gray-500 text-xs mt-1">{member.followers.toLocaleString()} followers</p>
                        </div>
                        <button
                          onClick={() => toggleFollow(member.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            member.isFollowing
                              ? 'bg-gray-700 text-white hover:bg-gray-600'
                              : 'bg-[#FF4D67] text-white hover:bg-[#FF4D67]/90'
                          } transition-colors`}
                        >
                          {member.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="grid grid-cols-1 gap-5 sm:gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="card-bg rounded-2xl overflow-hidden border border-gray-700/50">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-40 sm:h-full object-cover"
                          />
                        </div>
                        <div className="p-5 sm:p-6 sm:w-2/3">
                          <h3 className="font-bold text-white text-lg mb-2">{event.title}</h3>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center text-gray-400 text-sm">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              {event.date}
                            </div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {event.location}
                            </div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                              </svg>
                              {event.attendees.toLocaleString()} attending
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-[#FF4D67] text-white rounded-full text-sm font-medium hover:bg-[#FF4D67]/90 transition-colors">
                            Interested
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Trending Topics */}
              <div className="card-bg rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 border border-gray-700/50">
                <h2 className="font-bold text-white text-lg mb-4">Trending Topics</h2>
                <div className="space-y-3">
                  {[
                    { tag: '#RwandanMusic', posts: 854 },
                    { tag: '#AfroBeats', posts: 670 },
                    { tag: '#KigaliEvents', posts: 421 },
                    { tag: '#MusicCollaboration', posts: 315 },
                    { tag: '#LocalArtists', posts: 589 }
                  ].map(({ tag, posts }, index) => (
                    <Link 
                      key={index} 
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="block py-2 px-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-[#FF4D67]">{tag}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {posts.toLocaleString()} posts
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Creators */}
              <div className="card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-white text-lg">Top Creators</h2>
                  <Link href="/explore" className="text-[#FFCB2B] text-sm hover:underline">
                    See all
                  </Link>
                </div>
                <div className="space-y-4">
                  {members.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-sm">{member.name}</h3>
                        <p className="text-gray-500 text-xs">{member.role}</p>
                      </div>
                      <button
                        onClick={() => toggleFollow(member.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          member.isFollowing
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-[#FF4D67] text-white hover:bg-[#FF4D67]/90'
                        } transition-colors`}
                      >
                        {member.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}