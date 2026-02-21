'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCommentsForTrack, addCommentToTrack, incrementTrackPlayCount } from '../services/trackService';
import { getUserFavorites, getUserPlaylists, addTrackToFavorites, removeTrackFromFavorites, addTrackToPlaylist as addTrackToPlaylistService, createPlaylist as createPlaylistService } from '../services/userService';
import { addRecentlyPlayed } from '../services/recentlyPlayedService';
import { fetchRecommendedTracks } from '../services/recommendationService';
import { reportInvalidTrack } from '../services/trackCleanupService';
const AudioPlayerContext = createContext(undefined);
export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};
export const AudioPlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playlist, setPlaylist] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isLooping, setIsLooping] = useState(false);
    const [queue, setQueue] = useState([]); // Queue for upcoming tracks
    const audioRef = useRef(null);
    const hasIncrementedPlayCount = useRef(new Set());
    const router = useRouter();
    const currentPlaybackContext = useRef({ type: 'single' });
    // Audio visualization refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const frequencyDataRef = useRef(null);
    const animationFrameRef = useRef(null);
    // Refs to hold current values for audio event handlers
    const currentTrackRef = useRef(null);
    const playlistRef = useRef([]);
    const currentTrackIndexRef = useRef(0);
    // Ref to store the original playlist when switching to single track context
    const originalPlaylistRef = useRef([]);
    // Store the original playlist before switching to single track context
    const storeOriginalPlaylist = () => {
        if (currentPlaybackContext.current.type !== 'single' && playlistRef.current.length > 0) {
            originalPlaylistRef.current = [...playlistRef.current];
            console.log('Stored original playlist with', originalPlaylistRef.current.length, 'tracks');
        }
    };
    // Expose the playback context globally so it can be accessed from other components
    useEffect(() => {
        window.audioPlayerContext = currentPlaybackContext;
        return () => {
            delete window.audioPlayerContext;
        };
    }, []);
    // Load favorites and playlists from backend on mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                // Check if user is authenticated by checking for access token
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    console.log('No access token found, skipping user data load');
                    setFavoritesLoading(false);
                    return;
                }
                // Load favorites
                const userFavorites = await getUserFavorites();
                setFavorites(userFavorites);
                setFavoritesLoading(false);
                // Dispatch a custom event to notify that favorites have been loaded
                window.dispatchEvent(new CustomEvent('favoritesLoaded'));
                // Load playlists
                const userPlaylists = await getUserPlaylists();
                // Map the playlists to ensure each has a unique id
                const mappedPlaylists = userPlaylists.map((playlist) => {
                    var _a;
                    return (Object.assign(Object.assign({}, playlist), { id: playlist._id || playlist.id, tracks: ((_a = playlist.tracks) === null || _a === void 0 ? void 0 : _a.map((track) => (Object.assign(Object.assign({}, track), { id: track._id || track.id // Use _id if available, otherwise use id
                         })))) || [] }));
                });
                setPlaylists(mappedPlaylists);
            }
            catch (error) {
                console.error('Error loading user data:', error);
                setFavoritesLoading(false);
            }
        };
        loadUserData();
    }, []);
    // Load comments when currentTrack changes
    useEffect(() => {
        const loadCommentsForTrack = async () => {
            if (currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.id) {
                try {
                    const trackComments = await fetchCommentsForTrack(currentTrack.id);
                    // Convert timestamp format if needed
                    const formattedComments = trackComments.map((comment) => ({
                        id: comment._id,
                        userId: comment.userId._id || comment.userId,
                        username: comment.userId.name || 'Unknown User',
                        text: comment.text,
                        timestamp: comment.createdAt
                    }));
                    setComments(formattedComments);
                }
                catch (error) {
                    console.error('Error loading comments:', error);
                    setComments([]);
                }
            }
            else {
                setComments([]);
            }
        };
        loadCommentsForTrack();
    }, [currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.id]);
    // Flag to track if the track was explicitly played by user
    const explicitlyPlayedRef = useRef(false);
    // Update audio playback rate when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);
    // Navigate to full player page when a track is played and not minimized
    // Only navigate when explicitly playing a new track, not when auto-playing next track
    useEffect(() => {
        console.log('Navigation useEffect triggered');
        console.log('currentTrack:', currentTrack);
        console.log('isMinimized:', isMinimized);
        console.log('explicitlyPlayedRef.current:', explicitlyPlayedRef.current);
        if (currentTrack && !isMinimized && explicitlyPlayedRef.current) {
            console.log('Navigating to /player');
            router.push('/player');
            // Reset the flag after navigation
            explicitlyPlayedRef.current = false;
        }
        else {
            console.log('Not navigating to /player because:');
            if (!currentTrack)
                console.log('- No current track');
            if (isMinimized)
                console.log('- Player is minimized');
            if (!explicitlyPlayedRef.current)
                console.log('- Not explicitly played');
        }
    }, [currentTrack, isMinimized, router]);
    const playTrack = (track, contextPlaylist, albumContext, isCycling = false) => {
        console.log('PLAY TRACK CALLED with track:', track);
        console.log('Current track before playTrack:', currentTrack);
        console.log('Current track index before playTrack:', currentTrackIndex);
        console.log('Explicitly played ref:', explicitlyPlayedRef.current);
        console.log('Current playback context before setting:', currentPlaybackContext.current);
        console.log('Is cycling:', isCycling);
        // Validate that we have a valid audio URL
        if (!track.audioUrl || track.audioUrl.trim() === '') {
            console.error('Cannot play track: Invalid audio URL', track);
            return;
        }

        // Check if track is paid and requires purchase
        if (track.paymentType === 'paid' && track.price > 0) {
            // Dispatch event to trigger payment modal
            const paymentEvent = new CustomEvent('requestTrackPayment', {
                detail: {
                    trackId: track.id,
                    trackTitle: track.title,
                    price: track.price,
                    audioUrl: track.audioUrl
                }
            });
            window.dispatchEvent(paymentEvent);
            return; // Don't play the track yet
        }
        // If we're already playing this track, just resume
        if ((currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.id) === track.id && audioRef.current) {
            console.log('Resuming existing track');
            audioRef.current.play().catch(error => {
                console.error('Error resuming track:', error);
            });
            setIsPlaying(true);
            console.log('Track resumed successfully');
            return;
        }
        // Stop current track if playing
        if (audioRef.current) {
            console.log('Stopping current audio');
            audioRef.current.pause();
            audioRef.current = null;
        }
        // Clean up previous audio context
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        // Set the playback context
        if (albumContext) {
            console.log('Setting album context');
            currentPlaybackContext.current = {
                type: 'album',
                data: albumContext,
                albumId: albumContext.albumId,
                albumComplete: false // Reset album completion flag
            };
            // Set the playlist to the album tracks
            setPlaylist(albumContext.tracks);
            // Update ref synchronously
            playlistRef.current = albumContext.tracks;
            const index = albumContext.tracks.findIndex(t => t.id === track.id);
            console.log('Setting album track index to:', index);
            setCurrentTrackIndex(index >= 0 ? index : 0);
            // Update ref synchronously
            currentTrackIndexRef.current = index >= 0 ? index : 0;
            // Add remaining album tracks to queue (excluding the current track)
            const remainingAlbumTracks = albumContext.tracks
                .filter((t, i) => i > index) // Only tracks after the current one
                .filter(t => !queue.some(qt => qt.id === t.id)); // Avoid duplicates in queue
            if (remainingAlbumTracks.length > 0) {
                setQueue(prev => [...prev, ...remainingAlbumTracks]);
                console.log(`Added ${remainingAlbumTracks.length} remaining album tracks to queue`);
            }
        }
        else if (contextPlaylist && contextPlaylist.length > 0) {
            console.log('Setting playlist context with tracks:', contextPlaylist);
            currentPlaybackContext.current = {
                type: 'playlist',
                data: contextPlaylist
            };
            setPlaylist(contextPlaylist);
            // Update ref synchronously
            playlistRef.current = contextPlaylist;
            // Only calculate the index if we're not cycling through tracks
            if (!isCycling) {
                const index = contextPlaylist.findIndex(t => t.id === track.id);
                console.log('Setting playlist track index to:', index);
                setCurrentTrackIndex(index >= 0 ? index : 0);
                // Update ref synchronously
                currentTrackIndexRef.current = index >= 0 ? index : 0;
            }
        }
        else {
            console.log('Setting single track context');
            // Store the original playlist before switching to single track context
            storeOriginalPlaylist();
            currentPlaybackContext.current = { type: 'single' };
            // For For single track, create a playlist with just this track
            setPlaylist([track]);
            // Update ref synchronously
            playlistRef.current = [track];
            setCurrentTrackIndex(0);
            // Update ref synchronously
            currentTrackIndexRef.current = 0;
        }
        console.log('Current playback context after setting:', currentPlaybackContext.current);
        // Create new audio element
        const audio = new Audio(track.audioUrl);
        audioRef.current = audio;
        // Set initial volume
        audio.volume = volume;
        // Set initial playback rate
        audio.playbackRate = playbackRate;
        // Set up event listeners
        audio.onplay = () => {
            console.log('Audio started playing');
            setIsPlaying(true);
        };
        audio.onpause = () => {
            console.log('Audio paused');
            setIsPlaying(false);
        };
        audio.onended = handleAudioEnded;
        audio.ontimeupdate = () => {
            if (audio.duration) {
                setProgress(audio.currentTime);
                setDuration(audio.duration);
            }
        };
        audio.onloadedmetadata = () => {
            setDuration(audio.duration || 0);
        };
        audio.onerror = async (error) => {
            console.error('Audio error occurred:', error);
            // Report invalid track to backend for cleanup
            if (currentTrackRef.current) {
                console.log(`Reporting invalid track ${currentTrackRef.current.id} for cleanup`);
                try {
                    const cleanupResult = await reportInvalidTrack(currentTrackRef.current.id);
                    if (cleanupResult.success && cleanupResult.removed) {
                        console.log(`Successfully removed invalid track: ${cleanupResult.trackTitle}`);
                    }
                    else if (cleanupResult.success) {
                        console.log(`Track ${cleanupResult.trackTitle} validated as valid`);
                    }
                    else {
                        console.error('Failed to process track cleanup:', cleanupResult.message);
                    }
                }
                catch (cleanupError) {
                    console.error('Error during track cleanup:', cleanupError);
                }
            }
        };
        // Set the current track and index immediately
        console.log('Setting current track to:', track);
        setCurrentTrack(track);
        // Update ref synchronously
        currentTrackRef.current = track;
        // Only expand player when new track starts if it was explicitly played by user
        // If it's an automatic playback (next track), preserve the current minimized state
        if (explicitlyPlayedRef.current) {
            setIsMinimized(false); // Expand player when explicitly played by user
        }
        // If explicitlyPlayedRef.current is false, we preserve the current isMinimized state
        // Mark this as an explicit play action
        explicitlyPlayedRef.current = true;
        // Add to recently played (only for authenticated users)
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            addRecentlyPlayed(track.id)
                .then(() => {
                console.log(`Successfully added track ${track.id} to recently played`);
            })
                .catch((error) => {
                console.error(`Failed to add track ${track.id} to recently played:`, error);
            });
        }
        // Increment play count for this track (only once per session)
        if (!hasIncrementedPlayCount.current.has(track.id)) {
            hasIncrementedPlayCount.current.add(track.id);
            incrementTrackPlayCount(track.id)
                .then(() => {
                console.log(`Successfully incremented play count for track ${track.id}`);
            })
                .catch((error) => {
                console.error(`Failed to increment play count for track ${track.id}:`, error);
            });
        }
        // Start playing the audio
        audio.play().catch(error => {
            console.error('Error playing track:', error);
            // Even if play fails, we still set the track so UI reflects the current state
            setIsPlaying(false);
        });
        console.log('Audio play initiated');
    };
    const playNextTrack = async () => {
        console.log('PLAY NEXT TRACK CALLED');
        console.log('Current track:', currentTrackRef.current);
        console.log('Current track index:', currentTrackIndexRef.current);
        console.log('Playlist:', playlistRef.current);
        console.log('Playback context:', currentPlaybackContext.current);
        console.log('Playback context type:', currentPlaybackContext.current.type);
        console.log('Playback context data:', currentPlaybackContext.current.data);
        console.log('Queue:', queue);
        // Check if the player has been explicitly stopped
        // If currentTrack is null, it means the player was explicitly stopped
        if (currentTrackRef.current === null) {
            console.log('Player has been explicitly stopped, not playing next track');
            return;
        }
        // First, check if there are tracks in the queue and play the first one
        if (queue.length > 0) {
            console.log('Queue has tracks, playing first track in queue');
            // Play the first track in the queue
            const nextTrack = queue[0];
            // Remove the track from the queue
            setQueue(prev => prev.slice(1));
            // Play the track without expanding the player
            // Use the current playlist context or fall back to a single track context
            explicitlyPlayedRef.current = false; // Mark as auto-played
            const contextToUse = playlistRef.current.length > 0 ? playlistRef.current : [nextTrack];
            playTrack(nextTrack, contextToUse);
            return;
        }
        // Log the actual values being checked
        const contextType = currentPlaybackContext.current.type;
        console.log('Direct context type value:', contextType);
        console.log('Is context type equal to "single":', contextType === 'single');
        console.log('Is context type equal to "album":', contextType === 'album');
        console.log('Is context type equal to "playlist":', contextType === 'playlist');
        console.log('Playlist length:', playlistRef.current.length);
        // Add one more check to see if the context object itself has changed
        console.log('Context object keys:', Object.keys(currentPlaybackContext.current));
        console.log('Context object JSON:', JSON.stringify(currentPlaybackContext.current));
        // Check if we're in an album context
        if (currentPlaybackContext.current.type === 'album') {
            console.log('Album context, ensuring tracks play within album until completion');
            // Check if we have more tracks in the album
            if (currentTrackIndexRef.current + 1 < playlistRef.current.length) {
                // Play the next track in the album
                const nextIndex = currentTrackIndexRef.current + 1;
                console.log('Playing next track in album at index:', nextIndex);
                // Play the next track without expanding the player
                explicitlyPlayedRef.current = false; // Mark as auto-played
                playTrackAtIndex(nextIndex);
                return;
            }
            else {
                // We've reached the end of the album
                console.log('Reached end of album, marking album as complete');
                // Update the context to indicate album is complete
                currentPlaybackContext.current.albumComplete = true;
                // If user wants to continue after album completion, play recommendations
                // Otherwise, stop playback
                try {
                    if (currentTrackRef.current) {
                        const recommendedTracks = await fetchRecommendedTracks(currentTrackRef.current.id, 10);
                        if (recommendedTracks && recommendedTracks.length > 0) {
                            console.log('Got', recommendedTracks.length, 'recommended tracks after album completion');
                            // Convert recommended tracks to our Track interface
                            const newTracks = recommendedTracks.map(nextTrack => ({
                                id: nextTrack._id,
                                title: nextTrack.title,
                                artist: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                    ? nextTrack.creatorId.name
                                    : nextTrack.creatorId || 'Unknown Artist',
                                coverImage: nextTrack.coverURL || '',
                                audioUrl: nextTrack.audioURL || '',
                                duration: 0, // Duration is not available in ITrack interface
                                creatorId: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                    ? nextTrack.creatorId._id
                                    : nextTrack.creatorId,
                                likes: nextTrack.likes,
                                type: nextTrack.type, // Include track type
                                creatorWhatsapp: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                    ? nextTrack.creatorId.whatsappContact
                                    : undefined // Include creator's WhatsApp contact
                            }));
                            // Update the playlist to include recommended tracks
                            const updatedPlaylist = [...playlistRef.current, ...newTracks];
                            setPlaylist(updatedPlaylist);
                            playlistRef.current = updatedPlaylist;
                            // Play the first recommended track
                            const nextIndex = playlistRef.current.length; // Start after the album tracks
                            const nextTrack = updatedPlaylist[nextIndex];
                            // Change context to playlist since we're now playing non-album tracks
                            currentPlaybackContext.current.type = 'playlist';
                            // Play the next track without expanding the player
                            explicitlyPlayedRef.current = false; // Mark as auto-played
                            playTrackAtIndex(nextIndex);
                            return;
                        }
                    }
                }
                catch (error) {
                    console.error('Error fetching recommendations after album:', error);
                }
                // If no recommendations or error, stop playback
                console.log('No recommendations available, stopping playback after album completion');
                stopTrack();
                return;
            }
        }
        // Check if we're in a single track context
        if (contextType === 'single') {
            console.log('Single track context, fetching recommendations');
            // For single track, fetch recommendations and play the next recommended track
            try {
                if (currentTrackRef.current) {
                    const recommendedTracks = await fetchRecommendedTracks(currentTrackRef.current.id, 10);
                    if (recommendedTracks && recommendedTracks.length > 0) {
                        const nextTrack = recommendedTracks[0];
                        // Convert the recommended track to our Track interface
                        const track = {
                            id: nextTrack._id,
                            title: nextTrack.title,
                            artist: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                ? nextTrack.creatorId.name
                                : nextTrack.creatorId || 'Unknown Artist',
                            coverImage: nextTrack.coverURL || '',
                            audioUrl: nextTrack.audioURL || '',
                            duration: 0, // Duration is not available in ITrack interface
                            creatorId: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                ? nextTrack.creatorId._id
                                : nextTrack.creatorId,
                            likes: nextTrack.likes,
                            type: nextTrack.type, // Include track type
                            creatorWhatsapp: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                ? nextTrack.creatorId.whatsappContact
                                : undefined // Include creator's WhatsApp contact
                        };
                        // Play the recommended track
                        explicitlyPlayedRef.current = false; // Mark as auto-played
                        // For recommended tracks, we maintain the single track context but update the current track
                        // We don't create a new playlist as that would break the user's original playlist context
                        playTrack(track, playlistRef.current, undefined, true);
                        return;
                    }
                    else {
                        console.log('No recommendations found, checking other songs');
                        // If no recommendations found, check other songs from the original playlist
                        if (originalPlaylistRef.current.length > 0) {
                            // Find the next track in the original playlist
                            const currentIndex = originalPlaylistRef.current.findIndex(t => { var _a; return t.id === ((_a = currentTrackRef.current) === null || _a === void 0 ? void 0 : _a.id); });
                            if (currentIndex !== -1) {
                                // Calculate next track index with proper cycling
                                const nextIndex = (currentIndex + 1) % originalPlaylistRef.current.length;
                                console.log('Playing next track from original playlist at index:', nextIndex);
                                const nextTrack = originalPlaylistRef.current[nextIndex];
                                // Play the next track from the original playlist
                                explicitlyPlayedRef.current = false; // Mark as auto-played
                                playTrack(nextTrack, originalPlaylistRef.current, undefined, true);
                                return;
                            }
                            else {
                                // If current track is not in the original playlist, play the first track
                                console.log('Current track not in original playlist, playing first track');
                                const nextTrack = originalPlaylistRef.current[0];
                                explicitlyPlayedRef.current = false; // Mark as auto-played
                                playTrack(nextTrack, originalPlaylistRef.current, undefined, true);
                                return;
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error fetching recommendations:', error);
                // If recommendations failed, check other songs from the original playlist
                if (originalPlaylistRef.current.length > 0) {
                    // Find the next track in the original playlist
                    const currentIndex = originalPlaylistRef.current.findIndex(t => { var _a; return t.id === ((_a = currentTrackRef.current) === null || _a === void 0 ? void 0 : _a.id); });
                    if (currentIndex !== -1) {
                        // Calculate next track index with proper cycling
                        const nextIndex = (currentIndex + 1) % originalPlaylistRef.current.length;
                        console.log('Playing next track from original playlist at index (after recommendation error):', nextIndex);
                        const nextTrack = originalPlaylistRef.current[nextIndex];
                        // Play the next track from the original playlist
                        explicitlyPlayedRef.current = false; // Mark as auto-played
                        playTrack(nextTrack, originalPlaylistRef.current, undefined, true);
                        return;
                    }
                }
            }
            // If we still can't find a track to play, stop playback
            console.log('No tracks found to play, stopping playback');
            stopTrack();
            return;
        }
        // Check if we have a playlist and it's not empty
        if (playlistRef.current.length === 0) {
            console.log('No playlist, stopping playback');
            stopTrack();
            return;
        }
        // Check if we're at the end of the playlist
        if (currentTrackIndexRef.current + 1 >= playlistRef.current.length) {
            console.log('Reached end of playlist, fetching more recommendations');
            // We've reached the end of the playlist, fetch more recommendations
            try {
                if (currentTrackRef.current) {
                    // Fetch more recommended tracks
                    const recommendedTracks = await fetchRecommendedTracks(currentTrackRef.current.id, 10); // Fetch 10 more tracks for better variety
                    if (recommendedTracks && recommendedTracks.length > 0) {
                        console.log('Got', recommendedTracks.length, 'new recommended tracks');
                        // Convert recommended tracks to our Track interface
                        const newTracks = recommendedTracks.map(nextTrack => ({
                            id: nextTrack._id,
                            title: nextTrack.title,
                            artist: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                ? nextTrack.creatorId.name
                                : nextTrack.creatorId || 'Unknown Artist',
                            coverImage: nextTrack.coverURL || '',
                            audioUrl: nextTrack.audioURL || '',
                            duration: 0, // Duration is not available in ITrack interface
                            creatorId: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                ? nextTrack.creatorId._id
                                : nextTrack.creatorId,
                            likes: nextTrack.likes,
                            type: nextTrack.type, // Include track type
                            creatorWhatsapp: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                                ? nextTrack.creatorId.whatsappContact
                                : undefined // Include creator's WhatsApp contact
                        }));
                        // Add new tracks to the playlist
                        const updatedPlaylist = [...playlistRef.current, ...newTracks];
                        setPlaylist(updatedPlaylist);
                        playlistRef.current = updatedPlaylist;
                        // Play the first new track
                        const nextIndex = currentTrackIndexRef.current + 1;
                        console.log('Playing next track at index:', nextIndex);
                        const nextTrack = updatedPlaylist[nextIndex];
                        // Play the next track without expanding the player
                        explicitlyPlayedRef.current = false; // Mark as auto-played
                        playTrackAtIndex(nextIndex);
                        return;
                    }
                    else {
                        console.log('No more recommendations available, stopping playback');
                        stopTrack();
                        return;
                    }
                }
            }
            catch (error) {
                console.error('Error fetching more recommendations:', error);
                // If recommendations failed, stop playback
                stopTrack();
                return;
            }
        }
        // Calculate next track index (normal case)
        const nextIndex = currentTrackIndexRef.current + 1;
        console.log('Next track index:', nextIndex);
        // Get next track
        const nextTrack = playlistRef.current[nextIndex];
        console.log('Next track:', nextTrack);
        if (nextTrack) {
            // Play the next track without expanding the player
            explicitlyPlayedRef.current = false; // Mark as auto-played
            // Preserve the current playlist context when playing the next track
            // Pass the specific index to avoid recalculating it in playTrack
            playTrackAtIndex(nextIndex);
        }
        else {
            console.log('No next track found, stopping playback');
            stopTrack();
        }
    };
    const playPreviousTrack = () => {
        console.log('PLAY PREVIOUS TRACK CALLED');
        console.log('Current track:', currentTrackRef.current);
        console.log('Current track index:', currentTrackIndexRef.current);
        console.log('Playlist:', playlistRef.current);
        // Check if the player has been explicitly stopped
        // If currentTrack is null, it means the player was explicitly stopped
        if (currentTrackRef.current === null) {
            console.log('Player has been explicitly stopped, not playing previous track');
            return;
        }
        // Check if we have a playlist and it's not empty
        if (playlistRef.current.length === 0 || !currentTrackRef.current) {
            console.log('No playlist or current track, cannot play previous');
            return;
        }
        // Calculate previous track index with wrapping
        let prevIndex = currentTrackIndexRef.current - 1;
        // Handle wrapping to the end of the playlist if we're at the beginning
        if (prevIndex < 0) {
            prevIndex = playlistRef.current.length - 1;
        }
        console.log('Previous track index:', prevIndex);
        // Get previous track
        const prevTrack = playlistRef.current[prevIndex];
        console.log('Previous track:', prevTrack);
        if (prevTrack) {
            // Play the previous track without expanding the player
            explicitlyPlayedRef.current = false; // Mark as auto-played
            playTrackAtIndex(prevIndex);
        }
    };
    // Helper function to handle audio ended event
    const handleAudioEnded = async () => {
        console.log('AUDIO ONENDED EVENT TRIGGERED');
        console.log('Current track in onended:', currentTrackRef.current);
        console.log('Current track index in onended:', currentTrackIndexRef.current);
        console.log('Playlist in onended:', playlistRef.current);
        console.log('Playback context in onended:', currentPlaybackContext.current);
        console.log('Playback context type in onended:', currentPlaybackContext.current.type);
        console.log('Playback context data in onended:', currentPlaybackContext.current.data);
        console.log('Full context object in onended:', JSON.stringify(currentPlaybackContext.current));
        console.log('Is looping:', isLooping);
        setIsPlaying(false);
        // Check if the player has been explicitly stopped
        // If currentTrack is null, it means the player was explicitly stopped
        if (currentTrackRef.current === null) {
            console.log('Player has been explicitly stopped, not playing next track');
            return;
        }
        // Check if loop is enabled
        if (isLooping) {
            console.log('Loop is enabled, replaying current track');
            // If loop is enabled, replay the current track
            playTrack(currentTrackRef.current, playlistRef.current);
            return;
        }
        // According to the specification, we should NOT set currentTrack to null at the end of playback
        // Instead, we should preserve the full track context including currentTrack, currentTrackIndex, and playback state
        // Call playNextTrack first to ensure the context and playlist information is still available
        await playNextTrack();
        // Removed the line that sets currentTrack to null to preserve context for seamless resumption
    };
    // Helper function to play a track at a specific index in the current playlist
    const playTrackAtIndex = (index) => {
        console.log('PLAY TRACK AT INDEX CALLED with index:', index);
        if (index < 0 || index >= playlistRef.current.length) {
            console.error('Invalid index for playTrackAtIndex:', index);
            return;
        }
        const track = playlistRef.current[index];
        console.log('Playing track at index:', track);
        // Stop current track if playing
        if (audioRef.current) {
            console.log('Stopping current audio');
            audioRef.current.pause();
            audioRef.current = null;
        }
        // Clean up previous audio context
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        // Create new audio element
        const audio = new Audio(track.audioUrl);
        audioRef.current = audio;
        // Set up event listeners
        audio.onplay = () => {
            console.log('Audio started playing');
            setIsPlaying(true);
        };
        audio.onpause = () => {
            console.log('Audio paused');
            setIsPlaying(false);
        };
        audio.onended = handleAudioEnded;
        audio.ontimeupdate = () => {
            if (audio.duration) {
                setProgress(audio.currentTime);
                setDuration(audio.duration);
            }
        };
        audio.onloadedmetadata = () => {
            setDuration(audio.duration || 0);
        };
        // Set the current track and index immediately
        console.log('Setting current track to:', track);
        setCurrentTrack(track);
        // Update ref synchronously
        currentTrackRef.current = track;
        console.log('Setting current track index to:', index);
        setCurrentTrackIndex(index);
        // Update ref synchronously
        currentTrackIndexRef.current = index;
        // Only expand player when new track starts if it was explicitly played by user
        // If it's an automatic playback (next track), preserve the current minimized state
        if (explicitlyPlayedRef.current) {
            setIsMinimized(false); // Expand player when explicitly played by user
        }
        // If explicitlyPlayedRef.current is false, we preserve the current isMinimized state
        // Mark this as an auto-played action (not explicitly played by user)
        explicitlyPlayedRef.current = false;
        // Add to recently played (only for authenticated users)
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            addRecentlyPlayed(track.id)
                .then(() => {
                console.log(`Successfully added track ${track.id} to recently played`);
            })
                .catch((error) => {
                console.error(`Failed to add track ${track.id} to recently played:`, error);
            });
        }
        // Increment play count for this track (only once per session)
        if (!hasIncrementedPlayCount.current.has(track.id)) {
            hasIncrementedPlayCount.current.add(track.id);
            incrementTrackPlayCount(track.id)
                .then(() => {
                console.log(`Successfully incremented play count for track ${track.id}`);
            })
                .catch((error) => {
                console.error(`Failed to increment play count for track ${track.id}:`, error);
            });
        }
        // Start playing the audio
        audio.play().catch(error => {
            console.error('Error playing track:', error);
            // Even if play fails, we still set the track so UI reflects the current state
            setIsPlaying(false);
        });
    };
    const pauseTrack = () => {
        console.log('PAUSE TRACK CALLED');
        console.log('Current audioRef state:', audioRef.current);
        console.log('Current isPlaying state:', isPlaying);
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                setIsPlaying(false);
                console.log('Audio paused successfully');
            }
            catch (error) {
                console.error('Error pausing track:', error);
            }
        }
        else {
            console.log('No audio element to pause');
        }
    };
    const stopTrack = () => {
        console.log('STOP TRACK CALLED');
        if (audioRef.current) {
            console.log('Stopping and cleaning up audio element');
            audioRef.current.pause();
            audioRef.current = null;
        }
        // Clean up audio visualization
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
        // According to the specification, at the end of playback, currentTrack should be set to null
        // but currentTrackIndex should retain its value
        // However, for normal playlist cycling, we should preserve the context
        // Only set currentTrack to null when explicitly stopping, not when cycling
        // For explicit stopping, we preserve the currentTrackIndex but set currentTrack to null
        setCurrentTrack(null);
        // Update ref synchronously
        currentTrackRef.current = null;
        // Note: We intentionally do NOT reset currentTrackIndex here to preserve playlist position
        console.log('STOP TRACK COMPLETED - currentTrack is now null');
    };
    const togglePlayPause = () => {
        console.log('TOGGLE PLAY PAUSE CALLED');
        console.log('Current track:', currentTrackRef.current);
        console.log('Is playing:', isPlaying);
        // Check if the player has been explicitly stopped
        // If currentTrack is null, it means the player was explicitly stopped
        if (currentTrackRef.current === null) {
            console.log('Player has been explicitly stopped, cannot toggle play/pause');
            return;
        }
        if (!currentTrackRef.current) {
            console.log('No current track, cannot toggle play/pause');
            return;
        }
        if (isPlaying) {
            pauseTrack();
        }
        else {
            playTrack(currentTrackRef.current, playlistRef.current);
        }
    };
    const toggleMinimize = () => {
        const willBeMinimized = !isMinimized;
        setIsMinimized(willBeMinimized);
    };
    const minimizeAndGoBack = () => {
        setIsMinimized(true);
        router.back();
    };
    const closePlayer = () => {
        console.log('CLOSE PLAYER CALLED');
        stopTrack();
        setIsMinimized(false);
        console.log('CLOSE PLAYER COMPLETED');
    };
    const addToPlaylist = (track) => {
        // Check if track already exists in the main playlist
        const existsInMainPlaylist = playlist.some(t => t.id === track.id);
        if (!existsInMainPlaylist) {
            setPlaylist(prev => [...prev, track]);
        }
        // Also add to the first user playlist if it exists
        if (playlists.length > 0) {
            addTrackToPlaylistService(playlists[0].id, track.id)
                .then((result) => {
                if (result) {
                    console.log('Track added to playlist');
                }
                else {
                    console.log('Failed to add track to playlist - user may not be authenticated');
                }
            })
                .catch((error) => {
                console.error('Error adding track to playlist:', error);
            });
        }
    };
    const removeFromPlaylist = (trackId) => {
        setPlaylist(prev => prev.filter(track => track.id !== trackId));
    };
    const createPlaylist = async (name) => {
        try {
            const newPlaylist = await createPlaylistService(name);
            // Add the new playlist to the playlists array
            setPlaylists(prev => [...prev, newPlaylist]);
            // Dispatch a custom event to notify that a playlist has been created
            window.dispatchEvent(new CustomEvent('playlistCreated', { detail: newPlaylist }));
        }
        catch (error) {
            console.error('Error creating playlist:', error);
        }
    };
    const addToFavorites = (track) => {
        // Check if track already exists in favorites
        const existsInFavorites = favorites.some(t => t.id === track.id);
        if (!existsInFavorites) {
            setFavorites(prev => [...prev, track]);
            // Also add to user's favorites in backend
            addTrackToFavorites(track.id)
                .then((result) => {
                if (result) {
                    console.log('Track added to favorites');
                    // Dispatch a custom event to notify that favorites have been updated
                    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
                    // Also dispatch a specific event for analytics updates
                    window.dispatchEvent(new CustomEvent('analyticsUpdated'));
                }
                else {
                    console.log('Failed to add track to favorites - user may not be authenticated');
                }
            })
                .catch((error) => {
                console.error('Error adding track to favorites:', error);
            });
        }
    };
    const removeFromFavorites = (trackId) => {
        setFavorites(prev => prev.filter(track => track.id !== trackId));
        // Also remove from user's favorites in backend
        removeTrackFromFavorites(trackId)
            .then((result) => {
            if (result) {
                console.log('Track removed from favorites');
                // Dispatch a custom event to notify that favorites have been updated
                window.dispatchEvent(new CustomEvent('favoritesUpdated'));
                // Also dispatch a specific event for analytics updates
                window.dispatchEvent(new CustomEvent('analyticsUpdated'));
            }
            else {
                console.log('Failed to remove track from favorites - user may not be authenticated');
            }
        })
            .catch((error) => {
            console.error('Error removing track from favorites:', error);
        });
    };
    const setCurrentPlaylist = (tracks) => {
        setPlaylist(tracks);
    };
    // Queue management functions
    const addToQueue = (track) => {
        // Ensure the track has all necessary properties to play
        const normalizedTrack = {
            id: track.id,
            title: track.title,
            artist: track.artist,
            coverImage: track.coverImage || '',
            audioUrl: track.audioUrl || track.audioURL || '',
            creatorId: track.creatorId,
            likes: track.likes || 0,
            type: track.type || 'song',
            creatorWhatsapp: track.creatorWhatsapp,
            // Include other necessary properties
            plays: track.plays || 0
        };
        
        setQueue(prev => {
            // Check if track is already in queue
            const exists = prev.some(t => t.id === normalizedTrack.id);
            if (!exists) {
                return [...prev, normalizedTrack];
            }
            return prev;
        });
    };
    // Add recommendations to queue
    const addRecommendationsToQueue = async (limit = 10) => {
        var _a;
        try {
            // Fetch recommendations based on the current track
            const recommendedTracks = await fetchRecommendedTracks((_a = currentTrackRef.current) === null || _a === void 0 ? void 0 : _a.id, limit);
            if (recommendedTracks && recommendedTracks.length > 0) {
                // Convert recommended tracks to our Track interface
                const tracksToAdd = recommendedTracks.map(nextTrack => ({
                    id: nextTrack._id,
                    title: nextTrack.title,
                    artist: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                        ? nextTrack.creatorId.name
                        : nextTrack.creatorId || 'Unknown Artist',
                    coverImage: nextTrack.coverURL || '',
                    audioUrl: nextTrack.audioURL || '',
                    duration: 0, // Duration is not available in ITrack interface
                    creatorId: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                        ? nextTrack.creatorId._id
                        : nextTrack.creatorId,
                    likes: nextTrack.likes,
                    type: nextTrack.type, // Include track type
                    creatorWhatsapp: (typeof nextTrack.creatorId === 'object' && nextTrack.creatorId !== null)
                        ? nextTrack.creatorId.whatsappContact
                        : undefined // Include creator's WhatsApp contact
                }));
                // Add the recommended tracks to the queue
                setQueue(prev => {
                    // Filter out tracks that are already in the queue
                    const newTracks = tracksToAdd.filter(track => !prev.some(t => t.id === track.id));
                    return [...prev, ...newTracks];
                });
                return tracksToAdd.length;
            }
        }
        catch (error) {
            console.error('Error adding recommendations to queue:', error);
        }
        return 0;
    };
    const removeFromQueue = (trackId) => {
        setQueue(prev => prev.filter(track => track.id !== trackId));
    };
    const clearQueue = () => {
        setQueue([]);
    };
    const moveQueueItem = (fromIndex, toIndex) => {
        setQueue(prev => {
            const newQueue = [...prev];
            const [movedItem] = newQueue.splice(fromIndex, 1);
            newQueue.splice(toIndex, 0, movedItem);
            return newQueue;
        });
    };
    const playFromQueue = (trackId) => {
        const trackIndex = queue.findIndex(track => track.id === trackId);
        if (trackIndex !== -1) {
            const track = queue[trackIndex];
            // Remove the track from the queue and play it
            setQueue(prev => prev.filter((_, idx) => idx !== trackIndex));
            // Play the track but maintain the current playlist context
            // If we're in a playlist/album context, continue using that context
            // Otherwise, use the current playlist or create a single track context
            const contextToUse = playlistRef.current.length > 0 ? playlistRef.current : [track];
            playTrack(track, contextToUse);
        }
    };
    // Function to add all tracks from an album to the queue
    const addAlbumToQueue = (albumTracks) => {
        // Filter out tracks that are already in the queue to avoid duplicates
        const newTracks = albumTracks.filter(track => !queue.some(queueTrack => queueTrack.id === track.id));
        if (newTracks.length > 0) {
            setQueue(prev => [...prev, ...newTracks]);
            // Dispatch a toast notification
            const toastEvent = new CustomEvent('showToast', {
                detail: { message: `Added ${newTracks.length} tracks to queue`, type: 'success' }
            });
            window.dispatchEvent(toastEvent);
        }
    };
    // Add shufflePlaylist function
    const shufflePlaylist = () => {
        if (playlist.length <= 1) {
            // Dispatch event to notify UI that shuffle was attempted but playlist is too small
            window.dispatchEvent(new CustomEvent('shuffleAttempted', {
                detail: {
                    success: false,
                    reason: 'Playlist has only one track or is empty',
                    playlistLength: playlist.length
                }
            }));
            return;
        }
        // Create a copy of the current playlist
        const shuffledPlaylist = [...playlist];
        // Fisher-Yates shuffle algorithm
        for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
        }
        // Check if the playlist actually changed order
        let playlistChanged = false;
        for (let i = 0; i < playlist.length; i++) {
            if (playlist[i].id !== shuffledPlaylist[i].id) {
                playlistChanged = true;
                break;
            }
        }
        // Update the playlist state
        setPlaylist(shuffledPlaylist);
        playlistRef.current = shuffledPlaylist;
        // If we have a current track, find its new index in the shuffled playlist
        let newIndex = -1;
        if (currentTrack) {
            newIndex = shuffledPlaylist.findIndex(track => track.id === currentTrack.id);
            if (newIndex !== -1) {
                setCurrentTrackIndex(newIndex);
                currentTrackIndexRef.current = newIndex;
            }
        }
        // Dispatch event to notify UI that shuffle was successful
        window.dispatchEvent(new CustomEvent('shuffleAttempted', {
            detail: {
                success: true,
                playlistChanged,
                playlistLength: shuffledPlaylist.length,
                currentTrackNewIndex: newIndex
            }
        }));
    };
    // Add toggleLoop function
    const toggleLoop = () => {
        setIsLooping(prev => !prev);
        console.log('Loop toggled, isLooping:', !isLooping);
    };
    const addComment = async (comment) => {
        if (!(currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.id)) {
            console.error('Cannot add comment: No current track');
            return;
        }
        try {
            // Add comment to backend
            const newComment = await addCommentToTrack(currentTrack.id, comment.text);
            // Format the comment to match our frontend structure
            const formattedComment = {
                id: newComment._id,
                userId: newComment.userId._id || newComment.userId,
                username: newComment.userId.name || comment.username,
                text: newComment.text,
                timestamp: newComment.createdAt
            };
            // Update the comments state
            setComments(prev => [...prev, formattedComment]);
        }
        catch (error) {
            console.error('Error adding comment:', error);
            // Fallback to local-only comment if backend fails
            const fallbackComment = Object.assign(Object.assign({ id: Date.now().toString() }, comment), { timestamp: new Date().toISOString() });
            setComments(prev => [...prev, fallbackComment]);
        }
    };
    const removeComment = (commentId) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
    };
    // New function to load comments from backend
    const loadComments = async (trackId) => {
        try {
            const trackComments = await fetchCommentsForTrack(trackId);
            // Convert timestamp format if needed
            const formattedComments = trackComments.map((comment) => ({
                id: comment._id,
                userId: comment.userId._id || comment.userId,
                username: comment.userId.name || 'Unknown User',
                text: comment.text,
                timestamp: comment.createdAt
            }));
            setComments(formattedComments);
        }
        catch (error) {
            console.error('Error loading comments:', error);
            setComments([]);
        }
    };
    // Add setVolume function to update volume
    const updateVolume = (newVolume) => {
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };
    // Add shareTrack function
    const shareTrack = (platform) => {
        if (!currentTrack)
            return;
        const trackUrl = `${window.location.origin}/tracks/${currentTrack.id}`;
        const text = `Check out "${currentTrack.title}" by ${currentTrack.artist} on MuzikaX`;
        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackUrl)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(trackUrl)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${trackUrl}`)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(trackUrl)}&title=${encodeURIComponent(currentTrack.title)}&summary=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(trackUrl);
                break;
            default:
                console.warn('Unsupported sharing platform:', platform);
        }
    };
    // Add downloadTrack function
    const downloadTrack = async () => {
        if (!currentTrack)
            return;
        // Check if the track is a beat
        const isBeat = currentTrack.type === 'beat' ||
            (currentTrack.title && currentTrack.title.toLowerCase().includes('beat'));
        if (isBeat) {
            // For beats, check if it's free or paid
            if (currentTrack.paymentType === 'paid') {
                // For paid beats, we need to ensure we have the creator's WhatsApp number
                let creatorWhatsapp = currentTrack.creatorWhatsapp;
                // If we don't have the WhatsApp number, fetch it directly
                if (!creatorWhatsapp && currentTrack.creatorId) {
                    const { fetchCreatorWhatsapp } = await import('@/services/trackService');
                    const whatsappResult = await fetchCreatorWhatsapp(currentTrack.creatorId);
                    if (whatsappResult) {
                        creatorWhatsapp = whatsappResult;
                    }
                }
                if (creatorWhatsapp) {
                    // Open WhatsApp with pre-filled message
                    const message = `Hi, I'm interested in your beat "${currentTrack.title}" that I found on MuzikaX.`;
                    window.open(`https://wa.me/${creatorWhatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                }
                else {
                    // No WhatsApp contact available
                    alert('This is a paid beat that requires contacting the creator via WhatsApp to obtain. Unfortunately, the creator has not provided their WhatsApp contact information.');
                }
            }
            else {
                // Free beat - allow download
                // Create a temporary link element
                const link = document.createElement('a');
                link.href = currentTrack.audioUrl;
                link.download = `${currentTrack.title.replace(/\s+/g, '_')}.mp3`; // Suggest a filename
                // Trigger the download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            return;
        }
        // For non-beat tracks, proceed with normal download
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = currentTrack.audioUrl;
        link.download = `${currentTrack.title.replace(/\s+/g, '_')}.mp3`; // Suggest a filename
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Play track bypassing payment validation (used after successful purchase)
    const playTrackAfterPurchase = (track, contextPlaylist, albumContext, isCycling = false) => {
        console.log('PLAY TRACK AFTER PURCHASE CALLED with track:', track);
        // This bypasses the payment check and plays the track directly
        // Rest of the function remains the same as original playTrack
        
        // Validate that we have a valid audio URL
        if (!track.audioUrl || track.audioUrl.trim() === '') {
            console.error('Cannot play track: Invalid audio URL', track);
            return;
        }
        
        // If we're already playing this track, just resume
        if ((currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.id) === track.id && audioRef.current) {
            console.log('Resuming existing track');
            audioRef.current.play().catch(error => {
                console.error('Error resuming track:', error);
            });
            setIsPlaying(true);
            console.log('Track resumed successfully');
            return;
        }
        
        // Stop current track if playing
        if (audioRef.current) {
            console.log('Stopping current audio');
            audioRef.current.pause();
            audioRef.current = null;
        }
        
        // Clean up previous audio context
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        
        // Set the playback context
        if (albumContext) {
            console.log('Setting album context');
            currentPlaybackContext.current = {
                type: 'album',
                data: albumContext,
                albumId: albumContext.albumId,
                albumComplete: false // Reset album completion flag
            };
            // Set the playlist to the album tracks
            setPlaylist(albumContext.tracks);
            // Update ref synchronously
            playlistRef.current = albumContext.tracks;
            const index = albumContext.tracks.findIndex(t => t.id === track.id);
            console.log('Setting album track index to:', index);
            
            // Set the current track and index immediately
            console.log('Setting current track to:', track);
            setCurrentTrack(track);
            // Update ref synchronously
            currentTrackRef.current = track;
            console.log('Setting current track index to:', index);
            setCurrentTrackIndex(index);
            // Update ref synchronously
            currentTrackIndexRef.current = index;
        }
        else if (contextPlaylist && contextPlaylist.length > 0) {
            console.log('Setting playlist context with', contextPlaylist.length, 'tracks');
            // Store the original playlist before switching to single track context
            storeOriginalPlaylist();
            currentPlaybackContext.current = {
                type: 'playlist',
                data: contextPlaylist
            };
            setPlaylist(contextPlaylist);
            // Update ref synchronously
            playlistRef.current = contextPlaylist;
            const index = contextPlaylist.findIndex(t => t.id === track.id);
            console.log('Setting playlist track index to:', index);
            
            // Set the current track and index immediately
            console.log('Setting current track to:', track);
            setCurrentTrack(track);
            // Update ref synchronously
            currentTrackRef.current = track;
            console.log('Setting current track index to:', index);
            setCurrentTrackIndex(index);
            // Update ref synchronously
            currentTrackIndexRef.current = index;
        }
        else {
            console.log('Setting single track context');
            // Store the original playlist before switching to single track context
            storeOriginalPlaylist();
            currentPlaybackContext.current = { type: 'single' };
            setPlaylist([track]);
            // Update ref synchronously
            playlistRef.current = [track];
            console.log('Setting single track index to: 0');
            
            // Set the current track and index immediately
            console.log('Setting current track to:', track);
            setCurrentTrack(track);
            // Update ref synchronously
            currentTrackRef.current = track;
            console.log('Setting current track index to: 0');
            setCurrentTrackIndex(0);
            // Update ref synchronously
            currentTrackIndexRef.current = 0;
        }
        
        // Create new audio element
        const audio = new Audio(track.audioUrl);
        audioRef.current = audio;
        
        // Set up event listeners
        audio.onplay = () => {
            console.log('Audio started playing');
            setIsPlaying(true);
        };
        audio.onpause = () => {
            console.log('Audio paused');
            setIsPlaying(false);
        };
        audio.onended = handleAudioEnded;
        audio.ontimeupdate = () => {
            if (audio.duration) {
                setProgress(audio.currentTime);
                setDuration(audio.duration);
            }
        };
        audio.onloadedmetadata = () => {
            setDuration(audio.duration || 0);
        };
        
        // Play the audio
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        
        // Only expand player when new track starts if it was explicitly played by user
        // If it's an automatic playback (next track), preserve the current minimized state
        if (explicitlyPlayedRef.current) {
            setIsMinimized(false); // Expand player when explicitly played by user
        }
        
        // If explicitlyPlayedRef.current is false, we preserve the current isMinimized state
        // Mark this as an auto-played action (not explicitly played by user)
        explicitlyPlayedRef.current = false;
        
        // Add to recently played (only for authenticated users)
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            addRecentlyPlayed(track.id)
                .then(() => {
                console.log(`Successfully added track ${track.id} to recently played`);
            })
                .catch((error) => {
                console.error('Error adding track to recently played:', error);
            });
        }
        
        // Increment play count (only for authenticated users and not already incremented)
        if (accessToken && !hasIncrementedPlayCount.current.has(track.id)) {
            incrementPlayCount(track.id)
                .then(() => {
                console.log(`Successfully incremented play count for track ${track.id}`);
                hasIncrementedPlayCount.current.add(track.id);
            })
                .catch((error) => {
                console.error('Error incrementing play count:', error);
            });
        }
    };

    return (_jsx(AudioPlayerContext.Provider, { value: {
            currentTrack,
            isPlaying,
            isMinimized,
            queue,
            playTrack,
            playNextTrack,
            playPreviousTrack,
            pauseTrack,
            stopTrack,
            togglePlayPause,
            toggleMinimize,
            minimizeAndGoBack,
            closePlayer,
            progress,
            duration,
            setProgress,
            playlist,
            playlists,
            favorites,
            favoritesLoading,
            comments,
            addToPlaylist,
            removeFromPlaylist,
            createPlaylist,
            addToFavorites,
            removeFromFavorites,
            setCurrentPlaylist,
            shufflePlaylist, // Export shufflePlaylist function
            toggleLoop,
            isLooping,
            currentTrackIndex,
            audioRef,
            addToQueue,
            removeFromQueue,
            clearQueue,
            moveQueueItem,
            playFromQueue,
            addAlbumToQueue, // Export addAlbumToQueue function
            addRecommendationsToQueue,
            addComment,
            removeComment,
            loadComments,
            volume,
            setVolume: updateVolume,
            playbackRate,
            setPlaybackRate,
            shareTrack,
            downloadTrack, // Export downloadTrack function
            playTrackAfterPurchase, // Export playTrackAfterPurchase function
            // Music visualization properties
            audioAnalyser: analyserRef.current,
            audioContext: audioContextRef.current,
            frequencyData: frequencyDataRef.current
        }, children: children }));
};
