'use client';

import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import PlaylistSelectionModal from '../../components/PlaylistSelectionModal'; // Added import
import { fetchCreatorProfile, fetchTracksByCreatorPublic } from '../../services/trackService'; // Added import

// Define comment interface with replies
interface CommentWithReplies {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  parentId?: string; // Reference to parent comment
  replies: CommentWithReplies[]; // Nested replies
}

const FullPagePlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    closePlayer,
    minimizeAndGoBack, // Use the new function
    progress,
    duration,
    setProgress,
    playNextTrack,
    playPreviousTrack,
    addToFavorites,
    removeFromFavorites,
    favorites,
    comments,
    addComment,
    audioRef
  } = useAudioPlayer();
  
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const progressRef = useRef<HTMLDivElement>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [comment, setComment] = useState('');
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false); // Added state for modal
  
  // Added state for creator profile and tracks
  const [creator, setCreator] = useState<any>(null);
  const [creatorTracks, setCreatorTracks] = useState<any[]>([]);
  const [loadingCreator, setLoadingCreator] = useState(false);
  
  // Added state for comment replies
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const hasAutoPlayedRef = useRef(false);
  
  // Automatically play the track when the full player page loads
  useEffect(() => {
    console.log('Auto-play useEffect triggered');
    console.log('currentTrack:', currentTrack);
    console.log('audioRef.current:', audioRef.current);
    console.log('isPlaying:', isPlaying);
    console.log('hasAutoPlayedRef.current:', hasAutoPlayedRef.current);
    
    // Reset the auto-play flag when the track changes
    if (currentTrack && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true;
      
      if (currentTrack && audioRef.current) {
        // Ensure the audio is playing when the full player page loads
        // Only auto-play if not already playing
        if (!isPlaying) {
          // Small delay to ensure the audio element is ready
          const timer = setTimeout(() => {
            console.log('Triggering togglePlayPause for auto-play');
            togglePlayPause();
          }, 100);
          return () => clearTimeout(timer);
        }
      }
    }
    
    // Reset the flag when there's no current track
    if (!currentTrack) {
      hasAutoPlayedRef.current = false;
    }
  }, [currentTrack, audioRef, isPlaying]);

  // Process comments to create a threaded structure
  const processComments = (): CommentWithReplies[] => {
    // Convert existing comments to CommentWithReplies format
    const commentsWithReplies: CommentWithReplies[] = comments.map(comment => ({
      ...comment,
      replies: []
    }));
    
    // Separate top-level comments and replies
    const topLevelComments: CommentWithReplies[] = [];
    const replies: CommentWithReplies[] = [];
    
    commentsWithReplies.forEach(comment => {
      // Check if this is a reply (by looking for @mentions)
      const isReply = comment.text.startsWith('@');
      if (isReply) {
        replies.push(comment);
      } else {
        topLevelComments.push(comment);
      }
    });
    
    // Attach replies to their parent comments
    replies.forEach(reply => {
      // Extract the username being replied to (everything between @ and space)
      const match = reply.text.match(/^@(\w+)/);
      if (match) {
        const repliedToUsername = match[1];
        // Find the parent comment by username
        const parentComment = topLevelComments.find(comment => 
          comment.username === repliedToUsername
        );
        if (parentComment) {
          // Add parentId to reply
          reply.parentId = parentComment.id;
          // Add reply to parent's replies array
          parentComment.replies.push(reply);
        } else {
          // If parent not found, treat as top-level comment
          topLevelComments.push(reply);
        }
      } else {
        // If no match, treat as top-level comment
        topLevelComments.push(reply);
      }
    });
    
    return topLevelComments;
  };
  
  // Process comments whenever the comments array changes
  const [threadedComments, setThreadedComments] = useState<CommentWithReplies[]>([]);

  // Check if current track is in favorites
  useEffect(() => {
    if (currentTrack) {
      setIsFavorite(favorites.some(track => track.id === currentTrack.id));
    }
  }, [currentTrack, favorites]);

  // Process comments to create threaded structure
  useEffect(() => {
    setThreadedComments(processComments());
  }, [comments]);

  // Toast notification effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch creator profile and tracks when currentTrack changes
  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!currentTrack || !currentTrack.creatorId) return;
      
      setLoadingCreator(true);
      try {
        // Fetch creator profile
        const creatorData = await fetchCreatorProfile(currentTrack.creatorId);
        setCreator(creatorData);
        
        // Fetch creator's tracks
        const tracksData = await fetchTracksByCreatorPublic(currentTrack.creatorId);
        // Filter out the current track and limit to 3 tracks
        const filteredTracks = tracksData
          .filter((track: any) => track._id !== currentTrack.id)
          .slice(0, 3);
        setCreatorTracks(filteredTracks);
      } catch (error) {
        console.error('Error fetching creator data:', error);
      } finally {
        setLoadingCreator(false);
      }
    };
    
    fetchCreatorData();
  }, [currentTrack]);

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !currentTrack || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newProgress = percent * duration;
    
    // Update progress in context
    setProgress(newProgress);
    
    // Seek in audio element by accessing it through the context
    if (audioRef && audioRef.current) {
      audioRef.current.currentTime = newProgress;
    }
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!currentTrack) return;
    
    if (isFavorite) {
      // Remove from favorites
      removeFromFavorites(currentTrack.id);
      setToast({message: 'Removed from favorites!', type: 'success'});
    } else {
      // Add to favorites
      addToFavorites(currentTrack);
      setToast({message: 'Added to favorites!', type: 'success'});
    }
    setIsFavorite(!isFavorite);
  };

  // Handle adding comment
  const handleAddComment = () => {
    if (!comment.trim() || !currentTrack) return;
    
    if (!isAuthenticated) {
      setToast({message: 'Please log in to comment', type: 'error'});
      return;
    }
    
    addComment({
      userId: user?.id || 'anonymous',
      username: user?.name || 'Anonymous',
      text: comment
    });
    
    setComment('');
    setToast({message: 'Comment added!', type: 'success'});
  };

  // Handle adding reply
  const handleAddReply = (parentId: string, parentUsername: string) => {
    if (!replyText.trim() || !currentTrack) return;
    
    if (!isAuthenticated) {
      setToast({message: 'Please log in to reply', type: 'error'});
      return;
    }
    
    // Add the reply as a new comment with a mention
    addComment({
      userId: user?.id || 'anonymous',
      username: user?.name || 'Anonymous',
      text: `@${parentUsername} ${replyText}`
    });
    
    setReplyText('');
    setReplyingTo(null);
    setToast({message: 'Reply added!', type: 'success'});
  };

  // Handle adding to playlist
  const handleAddToPlaylist = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsPlaylistModalOpen(true);
  };

  // Handle track added to playlist
  const handleTrackAdded = () => {
    setToast({message: 'Added to playlist!', type: 'success'});
  };

  // Redirect to home page if there's no current track and player was explicitly closed
  // Don't redirect during normal playlist progression
  useEffect(() => {
    if (!currentTrack) {
      // Check if we're in a playlist context - if so, don't redirect
      // This prevents redirecting during normal playlist progression
      const contextRef = (window as any).audioPlayerContext;
      if (contextRef) {
        const contextValue = contextRef.current;
        if (contextValue && (contextValue.type === 'playlist' || contextValue.type === 'album')) {
          // We're in a playlist context, so don't redirect
          console.log('In playlist context, not redirecting to home page');
          return;
        }
      }
      
      // If we reach here, redirect to home page
      console.log('Redirecting to home page');
      router.push('/');
    }
  }, [currentTrack, router]);

  // Don't render if there's no current track
  if (!currentTrack) {
    return null;
  }

  // Function to generate avatar with first letter of name
  const generateAvatar = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
        <span className="text-lg font-bold text-white">{firstLetter}</span>
      </div>
    );
  };

  // Recursive component to render comments and their replies
  const CommentItem = ({ comment, isReply = false }: { comment: CommentWithReplies; isReply?: boolean }) => (
    <div className={isReply ? "ml-6 mt-3 pl-4 border-l-2 border-gray-600" : ""}>
      <div className="bg-gray-700/50 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{comment.username}</h4>
            <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(comment.timestamp).toLocaleDateString()}
          </span>
        </div>
        
        {/* Reply Button */}
        <div className="mt-2">
          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-xs text-[#FF4D67] hover:text-[#ff3350]"
          >
            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
          </button>
        </div>
        
        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-3 pl-4 border-l-2 border-gray-600">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.username}...`}
              className="w-full bg-gray-700 text-white rounded-lg p-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
              rows={2}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleAddReply(comment.id, comment.username)}
                disabled={!replyText.trim() || !isAuthenticated}
                className="bg-[#FF4D67] hover:bg-[#ff3350] text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                Post Reply
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.message}
        </div>
      )}
      
      {/* Playlist Selection Modal */}
      <PlaylistSelectionModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onTrackAdded={handleTrackAdded}
      />
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <button 
          onClick={minimizeAndGoBack} // Use the new function
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </button>
        
        <h1 className="text-xl font-bold">Now Playing</h1>
        
        <div className="flex space-x-4">
          <button 
            onClick={closePlayer}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close player"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player Section */}
          <div className="lg:col-span-2">
            <div className="flex flex-col items-center">
              {/* Album Art */}
              <div className="relative mb-8">
                <img 
                  src={currentTrack.coverImage} 
                  alt={currentTrack.title} 
                  className="w-64 h-64 md:w-80 md:h-80 rounded-2xl object-cover shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              </div>
              
              {/* Track Info */}
              <div className="text-center mb-8 w-full">
                <h2 className="text-3xl font-bold text-white truncate">{currentTrack.title}</h2>
                <Link 
                  href={`/artists/${(typeof currentTrack.creatorId === 'object' && currentTrack.creatorId !== null) 
                    ? (currentTrack.creatorId as any)._id 
                    : currentTrack.creatorId}`}
                  className="text-[#FF4D67] hover:text-[#ff3350] mt-2 inline-block"
                >
                  {currentTrack.artist}
                </Link>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full max-w-2xl mb-6">
                <div 
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer group"
                >
                  <div 
                    className="h-full bg-[#FF4D67] rounded-full relative"
                    style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#FF4D67] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex justify-center items-center space-x-8 mb-8">
                <button 
                  onClick={playPreviousTrack}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path>
                  </svg>
                </button>
                
                <button 
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-[#FF4D67] flex items-center justify-center text-white hover:bg-[#ff3350] transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </button>
                
                <button 
                  onClick={() => playNextTrack()}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"></path>
                  </svg>
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center items-center space-x-6 mb-8">
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push('/login');
                      return;
                    }
                    
                    toggleFavorite();
                    // Show visual feedback
                    const isNowFavorite = !isFavorite;
                    const message = isNowFavorite ? 'Added to favorites!' : 'Removed from favorites!';
                    setToast({message, type: 'success'});
                  }}
                  className={`flex flex-col items-center text-gray-400 hover:text-white transition-colors ${isFavorite ? 'text-red-500' : ''}`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span className="text-xs mt-1">Like</span>
                </button>
                
                <button 
                  onClick={handleAddToPlaylist} // Changed to use the new function
                  className="flex flex-col items-center text-gray-400 hover:text-white transition-colors"
                  title="Add to playlist"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-xs mt-1">Playlist</span>
                </button>
                
                {currentTrack.creatorId && (
                  <Link 
                    href={`/artists/${(typeof currentTrack.creatorId === 'object' && currentTrack.creatorId !== null) 
                      ? (currentTrack.creatorId as any)._id 
                      : currentTrack.creatorId}`}
                    className="flex flex-col items-center text-gray-400 hover:text-white transition-colors"
                    title="View Artist Profile"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span className="text-xs mt-1">Artist</span>
                  </Link>
                )}
              </div>
              
              {/* Navigation Buttons to Favorites and Playlists */}
              <div className="flex justify-center space-x-4 mt-4">
                <button 
                  onClick={() => router.push('/favorites')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  View Favorites
                </button>
                <button 
                  onClick={() => router.push('/playlists')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  View Playlists
                </button>
              </div>
            </div>
          </div>
          
          {/* Comments and Creator Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Uploaded By Section */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Uploaded By</h3>
              
              {loadingCreator ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]"></div>
                </div>
              ) : creator ? (
                <div className="space-y-4">
                  {/* Creator Info */}
                  <div className="flex items-center space-x-4">
                    {creator.avatar ? (
                      <img 
                        src={creator.avatar} 
                        alt={creator.name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      generateAvatar(creator.name)
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">{creator.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {creator.followersCount || 0} followers
                      </p>
                    </div>
                  </div>
                  
                  {/* Other Tracks by Creator */}
                  {creatorTracks.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">More from {creator.name}</h5>
                      <div className="space-y-2">
                        {creatorTracks.map((track: any) => (
                          <div 
                            key={track._id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
                            onClick={() => {
                              // Play the track
                              const trackData = {
                                id: track._id,
                                title: track.title,
                                artist: track.artist || creator.name,
                                coverImage: track.coverArt || track.coverURL || currentTrack.coverImage,
                                audioUrl: track.audioUrl || track.audioURL,
                                duration: track.duration,
                                creatorId: (typeof currentTrack.creatorId === 'object' && currentTrack.creatorId !== null) 
                                  ? (currentTrack.creatorId as any)._id 
                                  : currentTrack.creatorId
                              };
                              // Assuming there's a playTrack function available in context
                              // For now, we'll just navigate to the artist page
                              const artistId = (typeof currentTrack.creatorId === 'object' && currentTrack.creatorId !== null) 
                                ? (currentTrack.creatorId as any)._id 
                                : currentTrack.creatorId;
                              router.push(`/artists/${artistId}`);
                            }}
                          >
                            <img 
                              src={track.coverArt || track.coverURL || currentTrack.coverImage} 
                              alt={track.title} 
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{track.title}</p>
                              <p className="text-xs text-gray-400 truncate">{track.artist || creator.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* View Full Profile Button */}
                  <button
                    onClick={() => router.push(`/artists/${creator._id}`)}
                    className="w-full mt-4 py-2 bg-[#FF4D67] hover:bg-[#ff3350] rounded-lg text-white font-medium transition-colors"
                  >
                    View Full Profile
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Creator information not available</p>
              )}
            </div>
            
            {/* Comments Section */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Comments</h3>
              
              {/* Add Comment Form */}
              <div className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-700 text-white rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || !isAuthenticated}
                  className="bg-[#FF4D67] hover:bg-[#ff3350] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Post Comment
                </button>
              </div>
              
              {/* Comments List */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {threadedComments.length > 0 ? (
                  threadedComments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPagePlayer;