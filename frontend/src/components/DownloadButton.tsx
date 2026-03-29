'use client';

import { useState } from 'react';
import { useOffline } from '../contexts/OfflineContext';

interface DownloadButtonProps {
  track: any;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
}

export default function DownloadButton({ 
  track, 
  size = 'md',
  variant = 'primary' 
}: DownloadButtonProps) {
  const { 
    isDownloading, 
    downloadProgress, 
    downloadTrackForOffline,
    removeOfflineTrack,
    isTrackDownloaded 
  } = useOffline();
  
  const [isRemoving, setIsRemoving] = useState(false);

  const downloaded = isTrackDownloaded(track.id);
  const isProcessing = isDownloading && !downloaded;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadTrackForOffline(track);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    try {
      await removeOfflineTrack(track.id);
    } catch (error) {
      console.error('Remove failed:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2 w-10 h-10',
    lg: 'p-3 w-12 h-12'
  };

  const variantClasses = {
    primary: downloaded 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-pink-600 hover:bg-pink-700 text-white',
    outline: downloaded
      ? 'border-2 border-green-600 text-green-600 hover:bg-green-50'
      : 'border-2 border-pink-600 text-pink-600 hover:bg-pink-50',
    ghost: downloaded
      ? 'text-green-600 hover:bg-green-100'
      : 'text-pink-600 hover:bg-pink-100'
  };

  if (downloaded) {
    return (
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-200 flex items-center justify-center group relative`}
        title="Remove from offline"
      >
        {isRemoving ? (
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Remove Offline
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isProcessing}
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-200 flex items-center justify-center group relative disabled:opacity-50 disabled:cursor-not-allowed`}
      title="Download for offline"
    >
      {isProcessing ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {downloadProgress > 0 && (
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded">
              {downloadProgress}%
            </span>
          )}
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Download Offline
          </span>
        </>
      )}
    </button>
  );
}
