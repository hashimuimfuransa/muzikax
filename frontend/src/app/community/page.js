'use client';

import React, { useState, useEffect } from 'react';
import { useCommunity } from '../../contexts/CommunityContext';
import { useAuth } from '../../contexts/AuthContext';
import CommunityTabBar from '../../components/CommunityTabBar';
import CommunityPostCard from '../../components/CommunityPostCard';
import CircleCard from '../../components/CircleCard';
import ChallengeCard from '../../components/ChallengeCard';
import LiveRoomCard from '../../components/LiveRoomCard';
import CreatePostModal from '../../components/CreatePostModal';
import { FaPlus } from 'react-icons/fa';

const CommunityPage = () => {
  const { user } = useAuth();
  const { 
    currentTab, 
    setCurrentTab, 
    trendingPosts, 
    circles, 
    challenges, 
    trendingChallenges, 
    liveRooms, 
    fetchCircles, 
    fetchChallenges, 
    fetchLiveRooms 
  } = useCommunity();
  
  // State for artist messaging
  const [showArtistMessaging, setShowArtistMessaging] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [artistsList, setArtistsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [showChatWindow, setShowChatWindow] = useState(false);
  
  // Helper function to make API requests with token refresh
  const makeApiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    
    // Add authorization header if not already present
    const requestConfig = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    };
    
    let response = await fetch(url, requestConfig);
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      // Attempt to refresh the token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            
            // Retry the original request with the new token
            requestConfig.headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
            response = await fetch(url, requestConfig);
          } else {
            // If refresh fails, redirect to login
            window.location.href = '/login';
            return null;
          }
        } else {
          // No refresh token available, redirect to login
          window.location.href = '/login';
          return null;
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return null;
      }
    }
    
    return response;
  };
  
  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [user]);
  
  // Prevent rendering if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">Please log in to access the community page</p>
          <a href="/login" className="inline-block bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white py-2 px-6 rounded-lg font-medium hover:from-[#FF6B8B] hover:to-[#FF8FA3] transition-all">
            Log In
          </a>
        </div>
      </div>
    );
  }
  
  // Fetch artists for messaging
  useEffect(() => {
    if (!user) return; // Don't fetch if user is not authenticated
    
    const fetchArtists = async () => {
      try {
        // Assuming there's an endpoint to get creators/artists
        const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/public/creators`);
        if (response && response.ok) {
          const data = await response.json();
          setArtistsList(data.users || data.creators || []);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };
    
    if (showArtistMessaging) {
      fetchArtists();
    }
  }, [showArtistMessaging, user]);
  
  // Fetch chats when component mounts
  useEffect(() => {
    if (!user) return; // Don't fetch if user is not authenticated
    fetchChats();
  }, [user]);
  
  // Fetch users for general chat
  useEffect(() => {
    if (!user) return; // Don't fetch if user is not authenticated
    
    const fetchUsers = async (page = 1, reset = true) => {
      if (loadingUsers) return; // Prevent duplicate requests
      
      setLoadingUsers(true);
      
      try {
        const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/public/users-for-chat?page=${page}&limit=20`);
        
        if (response.ok) {
          const data = await response.json();
          // Filter out the current user from the list
          const filteredUsers = data.users?.filter(u => u._id !== user?._id) || [];
          
          if (reset) {
            setUsersList(filteredUsers);
          } else {
            setUsersList(prev => [...prev, ...filteredUsers]);
          }
          
          setHasMoreUsers(data.pagination?.hasNextPage || false);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers(1, true);
  }, [user]);
  
  // Fetch user chats
  const fetchChats = async () => {
    try {
      const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/chats`);
      
      if (response && response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };
  
  // Fetch chat messages
  const fetchChatMessages = async (chatId) => {
    try {
      const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/chats/${chatId}/messages`);
      
      if (response && response.ok) {
        const data = await response.json();
        setChatMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };
  
  // Send a chat message
  const sendChatMessage = async (chatId, message) => {
    try {
      const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      
      if (response && response.ok) {
        const data = await response.json();
        // Add the new message to the chat
        setChatMessages(prev => [...prev, data.data.message]);
        setMessageText('');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return false;
    }
  };
  
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activeSection, setActiveSection] = useState('posts'); // For sidebar navigation

  // Fetch initial data when component mounts
  useEffect(() => {
    if (!user) return; // Don't fetch if user is not authenticated
    fetchCircles();
    fetchChallenges();
    fetchLiveRooms();
  }, [user]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'trending':
        return (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Trending Discussions</h2>
            {trendingPosts.length > 0 ? (
              trendingPosts.map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No trending posts yet. Be the first to start a discussion!</p>
              </div>
            )}
          </div>
        );
      
      case 'spotlight':
        return (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Artist Spotlights</h2>
            {circles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {circles.filter(circle => circle.type === 'artist').map((circle) => (
                  <CircleCard key={circle.id} circle={circle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No artist circles yet. Check back later!</p>
              </div>
            )}
          </div>
        );
      
      case 'polls':
        return (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Community Polls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {challenges.filter(challenge => challenge.type === 'poll').length > 0 ? (
                challenges.filter(challenge => challenge.type === 'poll').map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No active polls at the moment. Check back later!</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'whatsnew':
        return (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">What's New</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {liveRooms.length > 0 ? (
                liveRooms.map((room) => (
                  <LiveRoomCard key={room.id} liveRoom={room} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No live rooms currently available. Check back later!</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Recent Posts</h3>
              {trendingPosts.slice(0, 5).map((post) => (
                <CommunityPostCard key={post.id} post={post} showFullContent={false} />
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Trending Discussions</h2>
            {trendingPosts.length > 0 ? (
              trendingPosts.map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No trending posts yet. Be the first to start a discussion!</p>
              </div>
            )}
          </div>
        );
    }
  };

  // Render sidebar navigation
  const renderSidebar = () => {
    const sections = [
      { id: 'posts', label: 'All Posts', icon: '📝' },
      { id: 'circles', label: 'Fan Circles', icon: '👥' },
      { id: 'challenges', label: 'Challenges', icon: '🏆' },
      { id: 'liverooms', label: 'Live Rooms', icon: '🎤' },
      { id: 'chat', label: 'Chat', icon: '💬' }
    ];

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Navigation</h3>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => {
                  if (section.id === 'chat') {
                    // Open chat interface
                    setShowChatWindow(true);
                    setActiveSection(section.id);
                  } else {
                    setActiveSection(section.id);
                  }
                }}
                className={`w-full text-left px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base ${
                  activeSection === section.id && section.id !== 'messages' && section.id !== 'chat'
                    ? 'bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <span className="text-sm sm:text-base">{section.icon}</span>
                <span>{section.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">MuzikaX Community</h1>
          <p className="text-gray-400 text-sm sm:text-base">Connect with fellow music lovers and discover amazing African talent</p>
        </div>

        {/* Create Post Button */}
        {user && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white py-2 px-4 sm:py-3 sm:px-6 rounded-full font-medium flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base hover:from-[#FF6B8B] hover:to-[#FF8FA3] transition-all shadow-lg"
            >
              <FaPlus className="text-xs sm:text-sm" />
              <span className="hidden xs:inline sm:inline">Create Post</span>
              <span className="xs:hidden sm:hidden">+</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            {renderSidebar()}
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {/* Tab Navigation */}
            <CommunityTabBar activeTab={currentTab} onTabChange={handleTabChange} />

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onSuccess={() => {}}
        />
      )}
      

      
      {/* Chat Window */}
      {showChatWindow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full h-[600px] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {activeChat ? `Chat with ${activeChat.name || 'User'}` : 'Select a Chat'}
              </h3>
              <button 
                onClick={() => {
                  setShowChatWindow(false);
                  setActiveChat(null);
                  setChatMessages([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {!activeChat ? (
              <div className="flex-1 p-4 space-y-4">
                <h4 className="text-lg font-semibold text-white mb-2">Available Chats:</h4>
                {chats.length > 0 ? (
                  chats.map(chat => (
                    <div 
                      key={chat._id} 
                      className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={async () => {
                        setActiveChat(chat);
                        await fetchChatMessages(chat._id);
                      }}
                    >
                      <img 
                        src={chat.participants?.find(p => p.userId._id !== user?._id)?.userId?.avatar || '/placeholder-avatar.jpg'} 
                        alt={chat.participants?.find(p => p.userId._id !== user?._id)?.userId?.name} 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-white">
                          {chat.participants?.find(p => p.userId._id !== user?._id)?.userId?.name || chat.chatName}
                        </h5>
                        <p className="text-xs text-gray-400 truncate">
                          {chat.lastMessage?.message || 'No recent messages'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No chats yet</p>
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={() => {
                          // Show user selection for new chat
                          setActiveChat({isNew: true, chatType: 'direct'});
                        }}
                        className="bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white py-2 px-4 rounded-lg hover:from-[#FF6B8B] hover:to-[#FF8FA3] transition-all"
                      >
                        Chat with Users
                      </button>
                      <button
                        onClick={() => {
                          // Show artist selection for new chat
                          setActiveChat({isNew: true, chatType: 'artist'});
                        }}
                        className="bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-purple-800 transition-all"
                      >
                        Chat with Artists
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : activeChat.isNew ? (
              <div className="flex-1 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {activeChat.chatType === 'artist' ? 'Select an Artist' : 'Select a User'}
                  </h4>
                  <button
                    onClick={() => setActiveChat(null)}
                    className="text-gray-400 hover:text-white text-lg"
                  >
                    ← Back
                  </button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto" onScroll={async (e) => {
                  const { scrollTop, clientHeight, scrollHeight } = e.target;
                  if (scrollHeight - scrollTop <= clientHeight + 5 && !loadingUsers && hasMoreUsers && activeChat.chatType !== 'artist') {
                    // User has scrolled near the bottom, load more users
                    await fetchUsers(currentPage + 1, false);
                  }
                }}>
                  {(activeChat.chatType === 'artist' ? artistsList : usersList).length > 0 ? (
                    (activeChat.chatType === 'artist' ? artistsList : usersList).map(person => (
                      <div 
                        key={person._id || person.id} 
                        className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                        onClick={async () => {
                          // Create a new chat with the selected person
                          try {
                            const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/chats`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                recipientId: person._id || person.id,
                                chatType: activeChat.chatType === 'artist' ? 'artist_fan' : 'direct'
                              })
                            });
                            
                            if (response.ok) {
                              const data = await response.json();
                              // Fetch updated chats list
                              await fetchChats();
                              // Set the newly created chat as active
                              setActiveChat({...person, chatId: data.chat._id});
                              // Clear message text
                              setMessageText('');
                            }
                          } catch (error) {
                            console.error('Error creating chat:', error);
                          }
                        }}
                      >
                        <img 
                          src={person.avatar || '/placeholder-avatar.jpg'} 
                          alt={person.name} 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <span className="text-white">{person.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No {activeChat.chatType === 'artist' ? 'artists' : 'users'} available</p>
                  )}
                  {loadingUsers && activeChat.chatType !== 'artist' && (
                    <div className="text-center py-4">
                      <p className="text-gray-400">Loading more users...</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                      <div 
                        key={msg._id} 
                        className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.senderId === user?._id 
                              ? 'bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white' 
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No messages yet</p>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && messageText.trim()) {
                          sendChatMessage(activeChat.chatId, messageText);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (messageText.trim()) {
                          sendChatMessage(activeChat.chatId, messageText);
                        }
                      }}
                      disabled={!messageText.trim()}
                      className="bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white py-2 px-4 rounded-lg hover:from-[#FF6B8B] hover:to-[#FF8FA3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;