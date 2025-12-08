'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

export default function Upload() {
  const [dragActive, setDragActive] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('afrobeat')
  const [visibility, setVisibility] = useState('public')
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const { isAuthenticated, userRole, upgradeToCreator } = useAuth()

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [selectedCreatorType, setSelectedCreatorType] = useState<'artist' | 'dj' | 'producer'>('artist')
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Check authentication and role on component mount
  useEffect(() => {
    console.log('Upload page - isAuthenticated:', isAuthenticated);
    console.log('Upload page - userRole:', userRole);
    
    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      console.log('Not authenticated, redirecting to login');
      router.push('/login')
    } else if (userRole !== 'creator') {
      // If authenticated but not a creator, show upgrade prompt
      console.log('Authenticated but not creator, showing upgrade prompt');
      setShowUpgradePrompt(true)
    }
  }, [isAuthenticated, userRole, router])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Uploading:', { title, description, genre, visibility, file })
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-bg rounded-2xl p-6 sm:p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#FF4D67]/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Become a Creator</h2>
              <p className="text-gray-400 mb-6">
                You need to upgrade your account to upload music. Please select your creator type below.
              </p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(['artist', 'dj', 'producer'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
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
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpgradeToCreator}
                  disabled={isUpgrading}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-white font-medium transition-opacity ${
                    isUpgrading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'gradient-primary hover:opacity-90'
                  }`}
                >
                  {isUpgrading ? 'Upgrading...' : 'Upgrade Account'}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-2.5 px-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-medium hover:bg-gray-700/50 transition-colors"
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
              {/* File Upload Area */}
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-[#FF4D67] bg-[#FF4D67]/5' 
                    : 'border-gray-700 hover:border-gray-600 card-bg'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleChange}
                  accept="audio/*"
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FF4D67]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF4D67]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl font-medium text-white mb-2">
                      {file ? file.name : 'Drag & drop your track here'}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {file 
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
                        : 'MP3, WAV, FLAC up to 100MB'}
                    </p>
                  </div>
                  
                  <button 
                    type="button"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
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
                  disabled={!file}
                  className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-all ${
                    file
                      ? 'gradient-primary text-white hover:opacity-90'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  } text-sm sm:text-base`}
                >
                  Upload Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}