'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import PlaylistSelectionModal from './PlaylistSelectionModal';
const ModernAudioPlayer = () => {
    const { currentTrack, isPlaying, isMinimized, togglePlayPause, toggleMinimize, closePlayer, progress, duration, setProgress, playNextTrack, playPreviousTrack, addToFavorites, removeFromFavorites, favorites, audioRef, volume, setVolume, playbackRate, setPlaybackRate, shareTrack, downloadTrack, shufflePlaylist, toggleLoop, isLooping } = useAudioPlayer();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const progressRef = useRef(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [toast, setToast] = useState(null);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    // Check if device is mobile
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
        };
        
        // Check on mount
        checkIsMobile();
        
        // Add resize listener
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', checkIsMobile);
            return () => window.removeEventListener('resize', checkIsMobile);
        }
    }, []);
    // Check if current track is in favorites
    useEffect(() => {
        if (currentTrack) {
            setIsFavorite(favorites.some(track => track.id === currentTrack.id));
        }
    }, [currentTrack, favorites]);
    // Toast notification effect
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);
    // Format time in MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    // Handle progress bar click
    const handleProgressClick = (e) => {
        if (!progressRef.current || !currentTrack || !duration)
            return;
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
        if (!currentTrack)
            return;
        if (isFavorite) {
            // Remove from favorites
            removeFromFavorites(currentTrack.id);
            setToast({ message: 'Removed from favorites!', type: 'success' });
        }
        else {
            // Add to favorites
            addToFavorites(currentTrack);
            setToast({ message: 'Added to favorites!', type: 'success' });
        }
        setIsFavorite(!isFavorite);
    };
    // Navigate to full player page
    const goToFullPlayer = () => {
        router.push('/player');
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
        setToast({ message: 'Added to playlist!', type: 'success' });
    };
    // No longer redirect to full player page automatically
    // The player will stay minimized and visible on all pages
    // Users can click the expand button to go to the full player page
    // Check if current track is a beat
    const isBeat = (currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.type) === 'beat' ||
        ((currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.title) && currentTrack.title.toLowerCase().includes('beat'));
    // Don't render if there's no current track
    if (!currentTrack)
        return null;
    
    // Don't render minimized player on mobile devices (handled by MobileNavbar)
    if (isMinimized && isMobile) {
        return null;
    }
    // Handle volume change
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };
    return (_jsxs(_Fragment, { children: [toast && (_jsx("div", { className: `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`, children: toast.message })), _jsx(PlaylistSelectionModal, { isOpen: isPlaylistModalOpen, onClose: () => setIsPlaylistModalOpen(false), onTrackAdded: handleTrackAdded }), isShareModalOpen && (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-xl font-bold", children: "Share Track" }), _jsx("button", { onClick: () => setIsShareModalOpen(false), className: "text-gray-400 hover:text-white", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "flex items-center mb-6 p-4 bg-gray-700 rounded-lg", children: [_jsx("img", { src: currentTrack.coverImage, alt: currentTrack.title, className: "w-16 h-16 rounded-lg object-cover" }), _jsxs("div", { className: "ml-4", children: [_jsx("h4", { className: "font-bold truncate", children: currentTrack.title }), _jsx("p", { className: "text-gray-400 text-sm", children: currentTrack.artist })] })] }), _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("button", { onClick: () => {
                                        shareTrack('facebook');
                                        setIsShareModalOpen(false);
                                    }, className: "flex flex-col items-center p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z" }) }), _jsx("span", { className: "text-xs mt-2", children: "Facebook" })] }), _jsxs("button", { onClick: () => {
                                        shareTrack('twitter');
                                        setIsShareModalOpen(false);
                                    }, className: "flex flex-col items-center p-3 bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors", children: [_jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" }) }), _jsx("span", { className: "text-xs mt-2", children: "Twitter" })] }), _jsxs("button", { onClick: () => {
                                        shareTrack('whatsapp');
                                        setIsShareModalOpen(false);
                                    }, className: "flex flex-col items-center p-3 bg-green-500 rounded-lg hover:bg-green-600 transition-colors", children: [_jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" }) }), _jsx("span", { className: "text-xs mt-2", children: "WhatsApp" })] }), _jsxs("button", { onClick: () => {
                                        shareTrack('linkedin');
                                        setIsShareModalOpen(false);
                                    }, className: "flex flex-col items-center p-3 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors", children: [_jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" }) }), _jsx("span", { className: "text-xs mt-2", children: "LinkedIn" })] })] }), _jsxs("button", { onClick: () => {
                                shareTrack('copy');
                                setToast({ message: 'Link copied to clipboard!', type: 'success' });
                                setIsShareModalOpen(false);
                            }, className: "w-full mt-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) }), "Copy Link"] })] }) })), isMinimized && (_jsxs("div", { className: `
          fixed bottom-20 sm:bottom-6 right-2 sm:right-6 
          left-2 sm:left-auto
          w-[calc(100vw-1rem)] sm:w-[${isBeat ? '380px' : '340px'}] 
          max-w-[380px]
          rounded-2xl 
          ${isBeat ? 'bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl border border-[#FF4D67]/30 shadow-2xl shadow-[#FF4D67]/20' : 'bg-black/70 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]'} 
          z-40 animate-[fadeInUp_0.3s_ease-out]
          sm:z-50
        `, children: [isBeat && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[#FF4D67]/20 via-[#FFCB2B]/20 to-[#8B5CF6]/20 rounded-2xl" })), _jsxs("div", { className: "relative z-10 flex items-center p-2 sm:p-3", children: [_jsxs("div", { className: "relative shrink-0", children: [_jsx("img", { src: currentTrack.coverImage, alt: currentTrack.title, className: `w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover transition-transform duration-300 ${isPlaying ? 'scale-105' : ''} ${isBeat ? 'rounded-lg' : ''}` }), isBeat && (_jsx("div", { className: "absolute -inset-1 bg-[#FF4D67] rounded-lg blur opacity-30 animate-pulse" })), !isBeat && (_jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 blur opacity-30 rounded-xl" }))] }), _jsxs("div", { className: "ml-2 sm:ml-3 flex-1 min-w-0 overflow-hidden", children: [isBeat ? (_jsxs(_Fragment, { children: [_jsx("h4", { className: "text-white font-bold text-sm truncate", children: currentTrack.title }), _jsx("p", { className: "text-[#FFCB2B] text-xs truncate", children: currentTrack.artist }), _jsxs("div", { className: "flex items-center gap-1 mt-1 flex-wrap", children: [_jsx("span", { className: "text-[#FF4D67] text-xs font-medium", children: "BEAT" }), currentTrack.paymentType === "paid" ? (_jsx("span", { className: "text-green-400 text-xs", children: "\u2022 PAID" })) : (_jsx("span", { className: "text-blue-400 text-xs", children: "\u2022 FREE" }))] })] })) : (_jsxs(_Fragment, { children: [_jsx("h4", { className: "text-white font-medium text-sm truncate", children: currentTrack.title }), _jsx("p", { className: "text-gray-400 text-xs truncate", children: currentTrack.artist })] })), _jsx("div", { ref: progressRef, onClick: handleProgressClick, className: "mt-1 h-1.5 sm:h-1 w-full bg-white/10 rounded-full cursor-pointer touch-manipulation", children: _jsx("div", { className: "h-full bg-gradient-to-r from-[#FF4D67] to-[#8B5CF6] rounded-full transition-all", style: { width: `${(progress / duration) * 100 || 0}%` } }) })] }), _jsxs("div", { className: "flex items-center gap-0", children: [_jsx("button", { onClick: togglePlayPause, className: "\r\n                  w-8 h-8 sm:w-10 sm:h-10 rounded-full \r\n                  bg-white/10 hover:bg-white/20 \r\n                  flex items-center justify-center\r\n                  transition-all\r\n                  min-w-[44px] min-h-[44px]\r\n                  touch-manipulation\r\n                  -ml-1\r\n                ", children: isPlaying ? (
                                        /* Pause Icon */
                                        _jsxs("svg", { className: "w-4 h-4 sm:w-5 sm:h-5 text-white", viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("rect", { x: "6", y: "5", width: "4", height: "14", rx: "1" }), _jsx("rect", { x: "14", y: "5", width: "4", height: "14", rx: "1" })] })) : (
                                        /* Play Icon */
                                        _jsx("svg", { className: "w-4 h-4 sm:w-5 sm:h-5 text-white ml-[1px]", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M8 5v14l11-7z" }) })) }), _jsx("button", { onClick: shufflePlaylist, className: "\r\n                  w-7 h-7 rounded-full\r\n                  bg-white/5 hover:bg-white/15\r\n                  flex items-center justify-center\r\n                  transition\r\n                  min-w-[44px] min-h-[44px]\r\n                  touch-manipulation\r\n                  -ml-0.5\r\n                ", title: "Shuffle playlist", children: _jsx("svg", { className: "w-3 h-3 text-gray-300", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" }) }) }), _jsx("button", { onClick: goToFullPlayer, className: "\r\n                  w-8 h-8 sm:w-9 sm:h-9 rounded-full\r\n                  bg-white/5 hover:bg-white/15\r\n                  flex items-center justify-center\r\n                  transition\r\n                  min-w-[44px] min-h-[44px]\r\n                  touch-manipulation\r\n                  -ml-0.5\r\n                ", title: "Open full player", children: _jsxs("svg", { className: "w-4 h-4 sm:w-5 sm:h-5 text-gray-300", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 5v14" }), _jsx("path", { d: "M5 12l7-7 7 7" })] }) }), _jsx("div", { className: "flex items-center", children: _jsxs("select", { value: playbackRate, onChange: (e) => setPlaybackRate(parseFloat(e.target.value)), className: "bg-black/70 text-white text-xs rounded px-1 py-1 sm:px-2 sm:py-1 focus:outline-none focus:ring-1 focus:ring-[#FF4D67] min-w-[50px] appearance-none touch-manipulation", children: [_jsx("option", { value: "0.5", children: "0.5x" }), _jsx("option", { value: "0.75", children: "0.75x" }), _jsx("option", { value: "1", children: "1x" }), _jsx("option", { value: "1.25", children: "1.25x" }), _jsx("option", { value: "1.5", children: "1.5x" }), _jsx("option", { value: "2", children: "2x" })] }) }), _jsx("button", { onClick: toggleLoop, className: `
                  w-7 h-7 rounded-full
                  flex items-center justify-center
                  ${isLooping ? 'text-[#FF4D67]' : 'text-gray-400'} hover:text-white
                  hover:bg-white/10
                  transition
                  min-w-[44px] min-h-[44px]
                  touch-manipulation
                  -ml-0.5
                `, title: "Loop track/playlist", children: _jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }) }), _jsxs("div", { className: "group relative", children: [_jsx("button", { className: "\r\n                    w-7 h-7 rounded-full\r\n                    flex items-center justify-center\r\n                    text-gray-400 hover:text-white\r\n                    hover:bg-white/10\r\n                    transition\r\n                    min-w-[44px] min-h-[44px]\r\n                    touch-manipulation\r\n                    -ml-0.5\r\n                  ", title: "Adjust volume", children: _jsx("svg", { className: "w-3.5 h-3.5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z", clipRule: "evenodd" }) }) }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.01", value: volume, onChange: handleVolumeChange, className: "\r\n                    absolute -top-12 sm:-top-12 right-0\r\n                    w-20 sm:w-28 px-2 py-1\r\n                    bg-black/70 rounded-lg\r\n                    hidden group-hover:block\r\n                    accent-[#FF4D67]\r\n                    touch-manipulation\r\n                  " })] }), _jsx("button", { onClick: toggleFavorite, className: `
                  w-7 h-7 rounded-full
                  flex items-center justify-center
                  transition-colors ${isFavorite
                                            ? 'text-red-400 bg-red-500/20 border border-red-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}
                  min-w-[44px] min-h-[44px]
                  touch-manipulation
                  -ml-0.5
                `, title: isFavorite ? "Remove from favorites" : "Save track", children: _jsx("svg", { className: "w-3.5 h-3.5", fill: isFavorite ? "currentColor" : "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }) }) })] })] })] })), !isMinimized && currentTrack && (_jsx("div", { className: "hidden" }))] }));
};
export default ModernAudioPlayer;
