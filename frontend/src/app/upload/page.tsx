'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
// Import UploadCare components
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

export default function Upload() {
  const [dragActive, setDragActive] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('afrobeat')
  const [visibility, setVisibility] = useState('public')
  const [file, setFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null) // State for cover image
  const [audioUrl, setAudioUrl] = useState<string | null>(null) // State for uploaded audio URL
  const [coverUrl, setCoverUrl] = useState<string | null>(null) // State for uploaded cover URL
  const router = useRouter()
  const { isAuthenticated, userRole, upgradeToCreator, isLoading, user } = useAuth() // Add user to get avatar

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [selectedCreatorType, setSelectedCreatorType] = useState<'artist' | 'dj' | 'producer'>('artist')
  const [isUpgrading, setIsUpgrading] = useState(false) // State for upload process
  const [isUploading, setIsUploading] = useState(false)

  // Check authentication and role on component mount
  useEffect(() => {
    console.log('Upload page - isAuthenticated:', isAuthenticated);
    console.log('Upload page - userRole:', userRole);
    
    // Don't redirect while loading
    if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to login
      console.log('Not authenticated, redirecting to login');
      router.push('/login')
    } else if (!isLoading && isAuthenticated && userRole !== 'creator') {
      // If authenticated but not a creator, show upgrade prompt
      console.log('Authenticated but not creator, showing upgrade prompt');
      setShowUpgradePrompt(true)
    }
  }, [isAuthenticated, userRole, router, isLoading]) // Add isLoading to dependency array

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Handle successful audio upload
  const handleAudioUploadSuccess = (info: any) => {
    console.log('Audio uploaded successfully:', info);
    if (info.cdnUrl) {
      setAudioUrl(info.cdnUrl);
    }
  };

  // Handle successful cover image upload
  const handleCoverUploadSuccess = (info: any) => {
    console.log('Cover image uploaded successfully:', info);
    if (info.cdnUrl) {
      setCoverUrl(info.cdnUrl);
    }
  };

  // Function to refresh token
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token found');
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        console.error('Failed to refresh token');
        return null;
      }

      const data = await response.json();
      // Save new tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    
    try {
      // If no cover image is provided, use user's avatar
      let finalCoverUrl = coverUrl;
      if (!finalCoverUrl && user?.avatar) {
        finalCoverUrl = user.avatar;
      }
      
      // If we don't have an audio URL from UploadCare, we can't proceed
      if (!audioUrl) {
        alert('Please upload an audio file first');
        setIsUploading(false);
        return;
      }
      
      console.log('Uploading:', { title, description, genre, visibility, audioUrl, coverUrl: finalCoverUrl })
      
      // Get access token from localStorage
      let accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        alert('Authentication error. Please log in again.');
        router.push('/login');
        return;
      }
      
      // Try to make the request with current token
      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title,
          description,
          genre,
          type: 'song', // Default type
          audioURL: audioUrl,
          coverURL: finalCoverUrl || ''
        })
      });
      
      // If token is expired, try to refresh it
      if (response.status === 401) {
        console.log('Token might be expired, attempting to refresh...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the request with new token
          response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/track`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify({
              title,
              description,
              genre,
              type: 'song', // Default type
              audioURL: audioUrl,
              coverURL: finalCoverUrl || ''
            })
          });
        } else {
          // Refresh failed, force logout
          alert('Session expired. Please log in again.');
          router.push('/login');
          return;
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload track');
      }
      
      const result = await response.json();
      console.log('Track uploaded successfully:', result);
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setAudioUrl(null);
      setCoverUrl(null);
      
      alert('Track uploaded successfully!');
      router.push('/profile'); // Redirect to profile page
    } catch (error: any) {
      console.error('Error uploading track:', error);
      alert(`Error uploading track: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  }

  const handleUpgradeToCreator = async () => {
    setIsUpgrading(true)
    try {
      const success = await upgradeToCreator(selectedCreatorType)
      if (success) {
        // Successfully upgraded, hide the prompt and show the upload form
        setShowUpgradePrompt(false)
      } else {
        // Handle error case
        console.error('Failed to upgrade to creator')
      }
    } catch (error) {
      console.error('Error upgrading to creator:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-bg rounded-2xl p-5 sm:p-8 max-w-md w-full border border-gray-700/50 shadow-2xl my-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FF4D67]/10 flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">Become a Creator</h2>
              <p className="text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6">
                You need to upgrade your account to upload music. Please select your creator type below.
              </p>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
                {(['artist', 'dj', 'producer'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`py-2 sm:py-3 px-1 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      selectedCreatorType === type
                        ? 'bg-[#FF4D67] text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedCreatorType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleUpgradeToCreator}
                  disabled={isUpgrading}
                  className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-white font-medium transition-opacity ${
                    isUpgrading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'gradient-primary hover:opacity-90'
                  }`}
                >
                  {isUpgrading ? 'Upgrading...' : 'Upgrade Account'}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-2.5 sm:py-3 px-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-medium hover:bg-gray-700/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isAuthenticated && userRole === 'creator' && (
        <div className="container mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4">
                Upload Your Music
              </h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
                Share your creations with the world. Upload your tracks and connect with fans across Rwanda and beyond.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Audio Upload Section */}
              <div className="card-bg rounded-2xl p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-medium text-white mb-4">Audio File</h2>
                
                {!audioUrl ? (
                  <FileUploaderRegular
                    pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE"}
                    onFileUploadSuccess={handleAudioUploadSuccess}
                    multiple={false}
                    className="my-config"
                  />
                ) : (
                  <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                    <p className="text-green-400">Audio uploaded successfully!</p>
                    <p className="text-sm text-gray-400 mt-1">File: {audioUrl.split('/').pop()}</p>
                  </div>
                )}
              </div>

              {/* Cover Image Upload Section */}
              <div className="card-bg rounded-2xl p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-medium text-white mb-4">Cover Image</h2>
                
                {!coverUrl ? (
                  <FileUploaderRegular
                    pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE"}
                    onFileUploadSuccess={handleCoverUploadSuccess}
                    multiple={false}
                    className="my-config"
                  />
                ) : (
                  <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                    <p className="text-green-400">Cover image uploaded successfully!</p>
                    <img src={coverUrl} alt="Cover" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
                
                {/* Info about using avatar as cover */}
                {!coverUrl && user?.avatar && (
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      If you don't upload a cover image, your profile avatar will be used as the track cover.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-5 sm:space-y-6 card-bg rounded-2xl p-5 sm:p-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Track Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Enter track title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Tell us about your track..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">
                      Genre
                    </label>
                    <select
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                    >
                      <option value="afrobeat">Afrobeat</option>
                      <option value="hiphop">Hip Hop</option>
                      <option value="rnb">R&B</option>
                      <option value="afropop">Afropop</option>
                      <option value="gospel">Gospel</option>
                      <option value="traditional">Traditional</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-300 mb-2">
                      Visibility
                    </label>
                    <select
                      id="visibility"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base"
                    >
                      <option value="public">Public</option>
                      <option value="fans">Fans Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="card-bg rounded-2xl p-5 sm:p-6 border-l-4 border-[#FFCB2B]">
                <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCB2B]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  Upload Tips
                </h3>
                <ul className="text-xs sm:text-sm text-gray-400 space-y-1">
                  <li>• High quality audio files (320kbps MP3 or lossless) sound best</li>
                  <li>• Add detailed descriptions to help fans discover your music</li>
                  <li>• Use relevant hashtags to increase visibility</li>
                  <li>• Consider uploading artwork for a professional look</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!audioUrl || isUploading}
                  className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-all ${
                    audioUrl && !isUploading
                      ? 'gradient-primary text-white hover:opacity-90'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  } text-sm sm:text-base`}
                >
                  {isUploading ? 'Uploading...' : 'Upload Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}