'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaMusic, FaUserFriends, FaFire } from 'react-icons/fa';
// Import UploadCare components
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

const CommunityPage = () => {
  const { user } = useAuth();
  const [vibes, setVibes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVibe, setNewVibe] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [expandedComments, setExpandedComments] = useState({}); // Track expanded comments for each post
  const [newComment, setNewComment] = useState({}); // Store new comment text for each post

  // Helper function to make API requests with automatic token refresh
  const makeApiRequest = async (url, options = {}) => {
    let token = localStorage.getItem('accessToken');
    
    const requestConfig = {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      }
    };
    
    // If using FormData (for file uploads), don't set Content-Type header
    if (!(options.body instanceof FormData)) {
      requestConfig.headers['Content-Type'] = 'application/json';
    }
    
    let response = await fetch(url, requestConfig);
    
    // If the response is 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Attempt to refresh the token
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken })
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          // Update tokens in localStorage
          localStorage.setItem('accessToken', refreshData.accessToken);
          localStorage.setItem('refreshToken', refreshData.refreshToken);
          
          // Update the token variable and retry the original request
          token = refreshData.accessToken;
          requestConfig.headers['Authorization'] = `Bearer ${token}`;
          
          // Reattempt the original request with the new token
          response = await fetch(url, requestConfig);
        } else {
          // If refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return response; // Return the original failed response
        }
      } else {
        // No refresh token available, redirect to login
        window.location.href = '/login';
        return response; // Return the original failed response
      }
    }
    
    return response;
  };

  const fetchVibes = async () => {
    try {
      const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/posts`);
      if (response.ok) {
        const data = await response.json();
        // Initialize likes and comments fields if not present
        const processedVibes = data.posts.map(post => ({
          ...post,
          likes: post.likes || 0,
          comments: post.comments || [],
          liked: post.liked || false  // Initialize liked status
        }));
        setVibes(processedVibes);
      } else {
        console.error('Failed to fetch vibes:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching vibes:', error);
    }
  };

  // Fetch vibes when component mounts
  useEffect(() => {
    fetchVibes();
  }, [user]); // Add user as dependency to refetch when user loads

  // Handle media upload success from Uploadcare
  const handleMediaUploadSuccess = (info) => {
    console.log('Media uploaded successfully:', info);
    if (info.cdnUrl) {
      // Determine the media type based on the mime type
      const isImage = info.fileInfo && info.fileInfo.mime && info.fileInfo.mime.startsWith('image/');
      const updatedInfo = {
        ...info,
        isImage: isImage
      };
      setMediaFile(updatedInfo);
      setPreviewUrl(info.cdnUrl);
    }
  };

  // Remove selected media
  const removeMedia = () => {
    setMediaFile(null);
    setPreviewUrl('');
  };

  const createVibe = async () => {
    if (!newVibe.trim() && !mediaFile) return;
    
    try {
      setIsUploading(true);
      
      // Prepare post data
      const postData = {
        content: newVibe,
        // Determine post type based on media
        postType: mediaFile ? (mediaFile.isImage !== undefined ? (mediaFile.isImage ? 'image' : 'video') : 
                (mediaFile.fileInfo && mediaFile.fileInfo.mime && mediaFile.fileInfo.mime.startsWith('image/') ? 'image' : 'video')) : 'text',
        // Set category
        category: selectedCategory === 'all' ? 'general' : selectedCategory
      };

      // Add media URL if available
      if (mediaFile && mediaFile.cdnUrl) {
        postData.mediaUrl = mediaFile.cdnUrl;
      }
      
      // Use the makeApiRequest helper which handles token refresh
      const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });
      
      if (response.ok) {
        setNewVibe('');
        setMediaFile(null);
        setPreviewUrl('');
        setShowCreateModal(false);
        fetchVibes(); // Refresh vibes
      } else {
        const errorData = await response.json();
        console.error('Error creating vibe:', errorData);
      }
    } catch (error) {
      console.error('Error creating vibe:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVibe = async (vibeId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/posts/${vibeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove the deleted post from the local state
        setVibes(prevVibes => prevVibes.filter(vibe => vibe.id !== vibeId));
      } else {
        console.error('Failed to delete post:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/posts/${postId}/like`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setVibes(prevVibes => 
          prevVibes.map(vibe => 
            vibe.id === postId 
              ? { ...vibe, likes: data.likes, liked: data.liked } 
              : vibe
          )
        );
      } else {
        console.error('Failed to toggle like:', await response.text());
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const submitComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    try {
      const response = await makeApiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/community/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          text: commentText  // Changed from 'content' to 'text' to match backend expectation
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the post with the new comment
        setVibes(prevVibes => 
          prevVibes.map(vibe => 
            vibe.id === postId 
              ? { ...vibe, comments: [...(vibe.comments || []), data.comment] } 
              : vibe
          )
        );
        
        // Clear the comment input
        setNewComment(prev => ({ ...prev, [postId]: '' }));
      } else {
        console.error('Failed to submit comment:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">Please log in to access the community vibes</p>
          <a href="/login" className="inline-block bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white py-2 px-6 rounded-lg font-medium hover:from-[#FF6B8B] hover:to-[#FF8FA3] transition-all">
            Log In
          </a>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 60)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const filteredVibes = vibes.filter(vibe => 
    selectedCategory === 'all' || vibe.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF4D67] to-[#FF8FA3] bg-clip-text text-transparent mb-2">Vibes</h1>
          <p className="text-gray-400">Where artists and fans share the feels ✨</p>
        </div>

        {/* Create Vibe Button */}
        {user && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white py-3 px-6 rounded-full font-medium flex items-center space-x-2 hover:from-[#FF6B8B] hover:to-[#FF8FA3] transition-all shadow-lg"
            >
              <FaPlus className="text-sm" />
              <span>Share a Vibe</span>
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="flex bg-gray-800/50 backdrop-blur-sm rounded-2xl p-1 gap-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center px-4 py-2 rounded-xl text-sm transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaUserFriends className="mr-1 text-xs" /> All Vibes
              </button>
              <button
                onClick={() => setSelectedCategory('artist')}
                className={`flex items-center px-4 py-2 rounded-xl text-sm transition-colors ${
                  selectedCategory === 'artist' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaMusic className="mr-1 text-xs" /> For Artists
              </button>
              <button
                onClick={() => setSelectedCategory('trending')}
                className={`flex items-center px-4 py-2 rounded-xl text-sm transition-colors ${
                  selectedCategory === 'trending' 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-medium shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaFire className="mr-1 text-xs" /> On the Flip!
              </button>
            </div>
          </div>
        </div>

        {/* Vibes Feed */}
        <div className="space-y-4">
          {filteredVibes.length > 0 ? (
            filteredVibes.map((vibe, index) => (
              <div key={vibe.id || vibe._id || index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-gray-700/50 hover:border-gray-600/50 transition-all">
                <div className="flex items-start space-x-3">
                  {vibe.author?.avatar ? (
                    <img 
                      src={vibe.author.avatar}
                      alt={vibe.author.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {vibe.author?.name ? vibe.author.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white truncate">{vibe.author?.name}</h3>
                        <p className="text-xs text-gray-400">{formatTimeAgo(vibe.createdAt)}</p>
                      </div>
                      {vibe.category === 'trending' && (
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <FaFire className="mr-1 text-xs" /> Flip!
                        </span>
                      )}
                      {/* Show delete button only for user's own posts */}
                      {(() => {
                        // Ensure both user and vibe exist before comparison
                        if (!user || !vibe) {
                          return null;
                        }
                        
                        // Extract user ID in all possible formats
                        // The backend returns userId as a populated user object, so we check vibe.userId._id
                        // But also support the original vibe.author._id if available
                        const currentUserId = String(user._id || user.id || user.userId || '');
                        const postAuthorId = String(
                          (vibe.userId && (vibe.userId._id || vibe.userId.id)) || 
                          (vibe.author && (vibe.author._id || vibe.author.id)) || 
                          vibe.userId || 
                          ''
                        );
                        
                        // Compare the IDs after ensuring they're both strings
                        const isOwner = currentUserId === postAuthorId;
                        
                        return isOwner ? (
                          <button 
                            onClick={() => deleteVibe(vibe.id)}
                            className="text-red-500 hover:text-red-400 ml-2"
                            title="Delete post"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : null;
                      })()}
                    </div>
                    <p className="text-gray-200 mt-2 whitespace-pre-wrap">{vibe.content}</p>
                    
                    {/* Display media if available */}
                    {(vibe.mediaUrl || vibe.mediaThumbnail) && (
                      <div className="mt-3">
                        {vibe.mediaUrl && ((vibe.mediaUrl.toLowerCase().includes('.mp4') || vibe.mediaUrl.toLowerCase().includes('.webm')) && vibe.postType !== 'image') || vibe.postType === 'video' ? (
                          <div className="overflow-hidden rounded-lg border border-gray-700">
                            <video 
                              src={vibe.mediaUrl} 
                              controls 
                              className="w-full h-auto max-h-80 object-contain bg-black"
                              preload="metadata"
                            />
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-lg border border-gray-700">
                            <img 
                              src={vibe.mediaUrl || vibe.mediaThumbnail} 
                              alt="Posted media" 
                              className="w-full h-auto max-h-80 object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-image.jpg'; // fallback image
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Post Actions - Likes and Comments */}
                    <div className="mt-4 flex items-center justify-between text-gray-400">
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => toggleLike(vibe.id)}
                          className={`flex items-center space-x-1 ${vibe.liked ? 'text-red-500' : 'hover:text-red-400'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span>{vibe.likes || 0}</span>
                        </button>
                        
                        <button 
                          onClick={() => toggleComments(vibe.id)}
                          className="flex items-center space-x-1 hover:text-blue-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9 8s9 3.582 9 8z" />
                          </svg>
                          <span>{vibe.comments?.length || 0}</span>
                        </button>
                      </div>
                      
                      <div className="text-xs">
                        {vibe.shares || 0} shares
                      </div>
                    </div>
                    
                    {/* Comments Section */}
                    {expandedComments[vibe.id] && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="space-y-3">
                          {(vibe.comments || []).map((comment, index) => (
                            <div key={comment._id || index} className="flex space-x-2">
                              {comment.author?.avatar ? (
                                <img 
                                  src={comment.author.avatar}
                                  alt={comment.author.name}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-medium">
                                    {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : '?'}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 bg-gray-700/50 rounded-lg p-2">
                                <div className="flex items-center">
                                  <span className="font-medium text-white text-sm">{comment.author?.name}</span>
                                  <span className="text-xs text-gray-400 ml-2">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-gray-200 text-sm mt-1">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          
                          {/* Comment Input */}
                          <div className="flex space-x-2 mt-3">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-medium">
                                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 flex">
                              <input
                                type="text"
                                value={newComment[vibe.id] || ''}
                                onChange={(e) => setNewComment(prev => ({ ...prev, [vibe.id]: e.target.value }))}
                                placeholder="Write a comment..."
                                className="flex-1 bg-gray-700 text-white rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
                              />
                              <button
                                onClick={() => submitComment(vibe.id)}
                                className="bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white px-4 rounded-r-lg text-sm font-medium hover:from-[#FF6B8B] hover:to-[#FF8FA3] transition-all"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))  // End of map function
          ) : (  // Else part of the ternary operator
            <div className="text-center py-12 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
              <p className="text-gray-400 mb-2">No vibes here yet. Share yours and get things flowing! 🎧</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Vibe Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Share Your Vibe</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
              >
                <option value="general">General</option>
                <option value="artist">For Artists</option>
                <option value="trending">On the Flip!</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Vibe</label>
              <textarea
                value={newVibe}
                onChange={(e) => setNewVibe(e.target.value)}
                placeholder="What's your vibe today? 🎵"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] h-32 resize-none"
              />
            </div>
            
            {/* Media Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Add Photo or Video (optional)</label>
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-[#FF4D67] transition-colors relative">
                {previewUrl ? (
                  <div className="relative group">
                    {mediaFile && mediaFile.isImage !== undefined ? (
                      mediaFile.isImage ? (
                        <div className="overflow-hidden rounded-lg border border-gray-700 max-w-full">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-h-48 w-auto max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-700 max-w-full">
                          <video 
                            src={previewUrl} 
                            controls 
                            className="max-h-48 w-auto max-w-full object-contain bg-black"
                          />
                        </div>
                      )
                    ) : (
                      // Fallback for older logic
                      mediaFile && mediaFile.fileInfo && mediaFile.fileInfo.mime && mediaFile.fileInfo.mime.startsWith('image/') ? (
                        <div className="overflow-hidden rounded-lg border border-gray-700 max-w-full">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-h-48 w-auto max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-700 max-w-full">
                          <video 
                            src={previewUrl} 
                            controls 
                            className="max-h-48 w-auto max-w-full object-contain bg-black"
                          />
                        </div>
                      )
                    )}
                    <button 
                      type="button" 
                      onClick={removeMedia}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileUploaderRegular
                      pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE"}
                      onFileUploadStart={() => console.log('Starting upload...')}
                      onFileUploadSuccess={handleMediaUploadSuccess}
                      onFileUploadProgress={(info) => console.log('Upload progress:', info)}
                      onFileUploadError={(error) => console.error('Upload error:', error)}
                      multiple={false}
                      clearable={true}
                      crop="disabled"
                      imagesOnly={false}
                      validators={{
                        maxSize: 5 * 1024 * 1024, // 5MB limit
                        accept: ['image/*', 'video/*']
                      }}
                      localeTranslations={{
                        dialog: {
                          tabs: {
                            file: {
                              title: 'Upload Media'
                            }
                          },
                          footer: {
                            text: 'Supports JPG, PNG, GIF, MP4, WEBM up to 5MB'
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={createVibe}
                disabled={!newVibe.trim() && !mediaFile || isUploading}
                className="bg-gradient-to-r from-[#FF4D67] to-[#FF6B8B] text-white py-2 px-4 rounded-lg hover:from-[#FF6B8B] hover:to-[#FF8FA3] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;