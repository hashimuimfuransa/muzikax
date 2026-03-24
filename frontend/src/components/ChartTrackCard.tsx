import React, { useState } from 'react';
import { trackShare } from '../services/chartService';
import { shareContent } from '../utils/webShare';

interface RankChange {
  icon: string;
  color: string;
  label: string;
}

interface ChartTrack {
  _id: string;
  title: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  coverURL: string;
  genre: string;
  plays: number;
  likes: number;
  shares: number;
}

interface ChartTrackCardProps {
  track: ChartTrack;
  rank: number;
  rankChange: RankChange;
  onPlay: () => void;
  isPlaying: boolean;
  onShare?: (platform: string) => void;
}

export default function ChartTrackCard({
  track,
  rank,
  rankChange,
  onPlay,
  isPlaying,
  onShare,
}: ChartTrackCardProps) {
  const [shareCount, setShareCount] = useState(track.shares || 0);
  const [isSharing, setIsSharing] = useState(false);

  const artistName =
    typeof track.creatorId === 'object' && track.creatorId !== null
      ? (track.creatorId as any).name
      : 'Unknown Artist';

  const handleShare = async (platform: string) => {
    setIsSharing(true);
    try {
      // Construct track URL
      const trackUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://muzikax.rw'}/tracks/${track._id}`;
      
      // Use modern Web Share API with fallback
      const shareResult = await shareContent(platform, track.title, trackUrl, track.coverURL);
      
      if (shareResult.success) {
        // Track the share in backend only if actually shared (not cancelled)
        await trackShare(track._id, platform);
        
        // Update local count
        setShareCount(prev => prev + 1);
        
        // Notify parent component if callback provided
        if (onShare) {
          onShare(platform);
        }
        
        // Show success feedback based on share method
        if (shareResult.method === 'native') {
          showToast(`Shared via native share! 🎵`);
        } else if (shareResult.method === 'copy') {
          showToast(`Link copied to clipboard! 🔗`);
        } else {
          showToast(`Shared to ${platform}! 🎵`);
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      showToast('Share failed. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#FF4D67] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="group bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-4 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-12 text-center flex-shrink-0">
          <div className="text-2xl font-bold text-white">{rank}</div>
          <div className={`text-sm ${rankChange.color}`}>{rankChange.icon}</div>
        </div>

        {/* Cover Image */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={track.coverURL || '/placeholder-playlist.png'}
            alt={track.title}
            className="w-full h-full object-cover"
          />
          {/* Play Button Overlay */}
          <button
            onClick={onPlay}
            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {isPlaying ? (
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white truncate">
            {track.title}
          </h3>
          <p className="text-sm text-gray-400 truncate">{artistName}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{track.genre}</span>
            <span>•</span>
            <span>{(track.plays / 1000).toFixed(1)}K plays</span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-gray-400">
              <svg
                className="w-5 h-5 mx-auto mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="text-white">{(track.likes / 1000).toFixed(1)}K</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">
              <svg
                className="w-5 h-5 mx-auto mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <div className="text-white">{(shareCount / 1000).toFixed(1)}K</div>
          </div>
          {/* Share Button */}
          <div className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const shareMenu = e.currentTarget.nextElementSibling as HTMLElement;
                if (shareMenu) {
                  shareMenu.classList.toggle('hidden');
                }
              }}
              disabled={isSharing}
              className="p-2 rounded-full bg-gray-700/50 hover:bg-[#FF4D67] transition-colors disabled:opacity-50"
              title="Share track"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            {/* Share Menu Dropdown */}
            <div className="absolute right-0 bottom-full mb-2 hidden bg-gray-800 rounded-lg shadow-xl border border-gray-700 min-w-[160px]">
              <div className="py-2">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  <span className="text-green-500">📱</span>
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  <span className="text-blue-400">🐦</span>
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  <span className="text-blue-600">📘</span>
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('instagram')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  <span className="text-pink-500">📸</span>
                  Instagram
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 border-t border-gray-700 mt-1 pt-2"
                >
                  <span className="text-gray-400">🔗</span>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="sm:hidden text-xs text-gray-500 flex gap-3">
          <div>❤️ {(track.likes / 1000).toFixed(1)}K</div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const shareMenu = e.currentTarget.nextElementSibling as HTMLElement;
                if (shareMenu) {
                  shareMenu.classList.toggle('hidden');
                }
              }}
              className="inline-flex items-center gap-1"
            >
              📤 {(shareCount / 1000).toFixed(1)}K
            </button>
            {/* Mobile Share Menu */}
            <div className="absolute right-0 bottom-full mb-2 hidden bg-gray-800 rounded-lg shadow-xl border border-gray-700 min-w-[140px]">
              <div className="py-2">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-700"
                >
                  📱 WhatsApp
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-700"
                >
                  🐦 Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-700"
                >
                  📘 Facebook
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-700 border-t border-gray-700 mt-1 pt-2"
                >
                  🔗 Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
