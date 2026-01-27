'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCreatorAnalytics, fetchCreatorTracks } from '../../services/creatorService';
import { getAlbumsByCreator } from '../../services/albumService';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { getFollowedCreators } from '../../services/trackService';
import { getRecentlyPlayed } from '../../services/recentlyPlayedService';
// Import UploadCare components
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
export default function Profile() {
    var _a, _b, _c, _d, _e, _f;
    const [activeTab, setActiveTab] = useState('profile');
    const [analytics, setAnalytics] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [filteredTracks, setFilteredTracks] = useState([]);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [loadingTracks, setLoadingTracks] = useState(false);
    const [loadingAlbums, setLoadingAlbums] = useState(false);
    const [tracksPage, setTracksPage] = useState(1);
    const [tracksTotalPages, setTracksTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [bio, setBio] = useState('');
    const [genres, setGenres] = useState([]);
    const [followedCreators, setFollowedCreators] = useState([]);
    const [loadingFollowed, setLoadingFollowed] = useState(false);
    const [newGenre, setNewGenre] = useState('');
    const [whatsappContact, setWhatsappContact] = useState(''); // Add WhatsApp contact state
    const [avatarUrl, setAvatarUrl] = useState(null); // Add avatar URL state
    const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState([]);
    const [loadingRecentlyPlayed, setLoadingRecentlyPlayed] = useState(false);
    const { currentTrack, isPlaying, playTrack, setCurrentPlaylist, favorites, addToFavorites, removeFromFavorites } = useAudioPlayer();
    const router = useRouter();
    const { isAuthenticated, user, isLoading, updateProfile, updateWhatsAppContact } = useAuth(); // Import both functions
    // Check authentication on component mount
    useEffect(() => {
        // Don't redirect while loading
        if (!isLoading && !isAuthenticated) {
            // If not authenticated, redirect to login
            router.push('/login');
        }
    }, [isAuthenticated, router, isLoading]); // Add isLoading to dependency array
    // Check URL parameters to set active tab
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam === 'whatsapp' && (user === null || user === void 0 ? void 0 : user.role) === 'creator') {
            setActiveTab('whatsapp');
        }
    }, [user]);
    // Fetch user data when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setBio(user.bio || '');
            setGenres(user.genres || []);
            setAvatarUrl(user.avatar || null);
            // Properly initialize WhatsApp contact - check if it's an object or string
            let whatsappNumber = '';
            if (typeof user.whatsappContact === 'string') {
                whatsappNumber = user.whatsappContact;
            }
            else if (user.whatsappContact && typeof user.whatsappContact === 'object') {
                // If it's an object, try to extract the actual WhatsApp number
                whatsappNumber = user.whatsappContact.whatsappContact || '';
            }
            console.log('Initializing WhatsApp contact:', whatsappNumber, typeof whatsappNumber);
            setWhatsappContact(whatsappNumber);
            // Fetch analytics for creators
            if (user.role === 'creator') {
                fetchAnalytics();
                fetchTracks(1);
                fetchAlbums();
            }
            // Fetch recently played tracks for all users
            fetchRecentlyPlayed();
        }
        // Fetch followed creators
        fetchFollowedCreators();
    }, [isAuthenticated, user]);
    const fetchFollowedCreators = async () => {
        if (!isAuthenticated || !user)
            return;
        setLoadingFollowed(true);
        try {
            const creators = await getFollowedCreators();
            setFollowedCreators(creators);
        }
        catch (error) {
            console.error('Failed to fetch followed creators:', error);
        }
        finally {
            setLoadingFollowed(false);
        }
    };
    // Fetch recently played tracks
    const fetchRecentlyPlayed = async () => {
        setLoadingRecentlyPlayed(true);
        try {
            const tracksData = await getRecentlyPlayed();
            // Transform the data to match our Track interface
            const transformedTracks = tracksData.map((track) => ({
                _id: track._id,
                id: track._id,
                title: track.title,
                artist: typeof track.creatorId === 'object' && track.creatorId !== null ? track.creatorId.name : 'Unknown Artist',
                album: '',
                plays: track.plays,
                likes: track.likes,
                coverImage: track.coverURL || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
                coverURL: track.coverURL,
                duration: undefined,
                audioUrl: track.audioURL,
                creatorId: typeof track.creatorId === 'object' && track.creatorId !== null ? track.creatorId._id : track.creatorId,
                playedAt: track.playedAt
            }));
            setRecentlyPlayedTracks(transformedTracks);
        }
        catch (error) {
            console.error('Error fetching recently played tracks:', error);
        }
        finally {
            setLoadingRecentlyPlayed(false);
        }
    };
    // Add a separate effect to update WhatsApp contact when user changes
    useEffect(() => {
        if (user && user.whatsappContact !== undefined) {
            // Properly extract WhatsApp contact - check if it's an object or string
            let whatsappNumber = '';
            if (typeof user.whatsappContact === 'string') {
                whatsappNumber = user.whatsappContact;
            }
            else if (user.whatsappContact && typeof user.whatsappContact === 'object') {
                // If it's an object, try to extract the actual WhatsApp number
                whatsappNumber = user.whatsappContact.whatsappContact || '';
            }
            console.log('Updating WhatsApp contact from user change:', whatsappNumber, typeof whatsappNumber);
            setWhatsappContact(whatsappNumber);
        }
    }, [user === null || user === void 0 ? void 0 : user.whatsappContact]);
    // Listen for track updates (when favorites are added/removed)
    useEffect(() => {
        const handleTrackUpdate = (event) => {
            const detail = event.detail;
            if (detail && detail.trackId) {
                // Also refresh analytics since total likes may have changed
                fetchAnalytics();
            }
        };
        // Listen for analytics updates specifically
        const handleAnalyticsUpdate = () => {
            fetchAnalytics();
        };
        // Add event listeners
        window.addEventListener('trackUpdated', handleTrackUpdate);
        window.addEventListener('analyticsUpdated', handleAnalyticsUpdate);
        // Clean up event listeners
        return () => {
            window.removeEventListener('trackUpdated', handleTrackUpdate);
            window.removeEventListener('analyticsUpdated', handleAnalyticsUpdate);
        };
    }, [user, tracksPage]);
    const fetchAnalytics = async () => {
        if (!user || user.role !== 'creator')
            return;
        setLoadingAnalytics(true);
        setError(null);
        try {
            const data = await fetchCreatorAnalytics();
            setAnalytics(data);
        }
        catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError(`Failed to fetch analytics: ${err.message || 'Unknown error'}`);
        }
        finally {
            setLoadingAnalytics(false);
        }
    };
    const fetchTracks = async (page = 1) => {
        if (!user || user.role !== 'creator')
            return;
        setLoadingTracks(true);
        setError(null);
        try {
            const data = await fetchCreatorTracks(page, 6); // 6 items per page
            setTracks(data.tracks);
            setFilteredTracks(data.tracks);
            setTracksTotalPages(data.pages);
            setTracksPage(data.page);
        }
        catch (err) {
            console.error('Failed to fetch tracks:', err);
            setError(`Failed to fetch tracks: ${err.message || 'Unknown error'}`);
        }
        finally {
            setLoadingTracks(false);
        }
    };
    const fetchAlbums = async () => {
        if (!user || user.role !== 'creator')
            return;
        setLoadingAlbums(true);
        setError(null);
        try {
            const albumsData = await getAlbumsByCreator(user.id); // Pass actual user ID instead of empty string
            // Transform the data to match our interface
            const transformedAlbums = albumsData.map((album) => {
                var _a;
                return ({
                    id: album._id,
                    title: album.title,
                    artist: (typeof album.creatorId === 'object' && album.creatorId !== null && 'name' in album.creatorId) ? album.creatorId.name : 'Unknown Artist',
                    coverImage: album.coverURL,
                    year: new Date(album.releaseDate || album.createdAt).getFullYear(),
                    tracks: ((_a = album.tracks) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    createdAt: album.createdAt
                });
            });
            setAlbums(transformedAlbums);
            setFilteredAlbums(transformedAlbums);
        }
        catch (err) {
            console.error('Failed to fetch albums:', err);
            setError(`Failed to fetch albums: ${err.message || 'Unknown error'}`);
        }
        finally {
            setLoadingAlbums(false);
        }
    };
    // Handle avatar upload success
    const handleAvatarUploadSuccess = (info) => {
        console.log('Avatar uploaded successfully:', info);
        if (info && info.cdnUrl) {
            setAvatarUrl(info.cdnUrl);
            // Update the user's avatar in the database
            updateProfile({ avatar: info.cdnUrl });
        }
    };
    const handlePageChange = (newPage, type) => {
        if (type === 'tracks') {
            fetchTracks(newPage);
        }
    };
    // Map ITrack to Track interface for audio player
    const mapTrackForPlayer = (track) => ({
        id: track._id,
        title: track.title,
        artist: (typeof track.creatorId === 'object' && track.creatorId !== null && 'name' in track.creatorId) ? track.creatorId.name : 'Unknown Artist', // This would need to be fetched from the creator data
        coverImage: track.coverURL,
        audioUrl: track.audioURL,
        duration: 0, // Would need to calculate or fetch duration
        creatorId: track.creatorId,
        likes: track.likes,
        type: track.type, // Include track type for WhatsApp functionality
        creatorWhatsapp: (typeof track.creatorId === 'object' && track.creatorId !== null
            ? track.creatorId.whatsappContact
            : undefined) // Include creator's WhatsApp contact
    });
    const handleSubmit = async (e) => {
        var _a, _b, _c;
        e.preventDefault();
        try {
            const form = e.target;
            const name = ((_a = form.elements.namedItem('name')) === null || _a === void 0 ? void 0 : _a.value) || '';
            const email = ((_b = form.elements.namedItem('email')) === null || _b === void 0 ? void 0 : _b.value) || '';
            const bio = ((_c = form.elements.namedItem('bio')) === null || _c === void 0 ? void 0 : _c.value) || '';
            const currentPasswordInput = form.elements.namedItem('currentPassword');
            const passwordInput = form.elements.namedItem('password');
            const currentPassword = (currentPasswordInput === null || currentPasswordInput === void 0 ? void 0 : currentPasswordInput.value) || '';
            const password = (passwordInput === null || passwordInput === void 0 ? void 0 : passwordInput.value) || '';
            // Prepare update data
            const updateData = {
                name: name.trim(),
                email: email.trim(),
                bio: bio.trim(),
                genres: genres, // Use the genres from state directly
                avatar: avatarUrl // Include avatar URL
            };
            // Only include fields that have values
            if (name.trim())
                updateData.name = name.trim();
            if (email.trim())
                updateData.email = email.trim();
            if (bio.trim())
                updateData.bio = bio.trim();
            if (genres.length > 0)
                updateData.genres = genres;
            if (avatarUrl)
                updateData.avatar = avatarUrl;
            // Only include password fields if they have values
            if (currentPassword) {
                updateData.currentPassword = currentPassword;
            }
            if (password) {
                updateData.password = password;
            }
            // Call the update profile function from AuthContext
            const success = await updateProfile(updateData);
            if (success) {
                // Refresh tracks to show updated creator name
                if ((user === null || user === void 0 ? void 0 : user.role) === 'creator') {
                    await fetchTracks();
                }
                alert('Profile updated successfully!');
            }
            else {
                alert('Failed to update profile. Please try again.');
            }
            // Clear password fields
            if (currentPasswordInput) {
                currentPasswordInput.value = '';
            }
            if (passwordInput) {
                passwordInput.value = '';
            }
        }
        catch (error) {
            console.error('Failed to update profile:', error);
            // Show more specific error messages
            if (error.message && error.message.includes('duplicate key')) {
                alert('Email is already in use by another account');
            }
            else {
                alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
            }
        }
    };
    const confirmDelete = async () => {
        if (!itemToDelete)
            return;
        try {
            if (itemToDelete.type === 'track') {
                // Delete track with token refresh
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${itemToDelete.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete track');
                }
                setTracks(prevTracks => prevTracks.filter(track => track._id !== itemToDelete.id));
                setFilteredTracks(prevFilteredTracks => prevFilteredTracks.filter(track => track._id !== itemToDelete.id));
            }
            else if (itemToDelete.type === 'album') {
                // Delete album with token refresh
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/${itemToDelete.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete album');
                }
                setAlbums(prevAlbums => prevAlbums.filter(album => album.id !== itemToDelete.id));
                setFilteredAlbums(prevFilteredAlbums => prevFilteredAlbums.filter(album => album.id !== itemToDelete.id));
            }
            setShowDeleteModal(false);
            setItemToDelete(null); // Clear the item to delete
        }
        catch (error) {
            console.error(`Failed to delete ${itemToDelete.type}:`, error);
            setError(`Failed to delete ${itemToDelete.type}: ${error.message || 'Unknown error'}`);
            // Keep the modal open so user can see the error
        }
    };
    // Show loading state while checking auth
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center", children: _jsx("div", { className: "text-white", children: "Loading..." }) }));
    }
    // Don't render the profile if not authenticated
    if (!isAuthenticated) {
        return null;
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-6 sm:py-8 md:py-12 overflow-x-hidden", children: [_jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 w-1/2 max-w-96 h-1/2 max-h-96 sm:w-96 sm:h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "absolute -bottom-40 left-1/2 -translate-x-1/2 w-1/2 max-w-96 h-1/2 max-h-96 sm:w-96 sm:h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-6 sm:mb-8 md:mb-12", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B]", children: (user === null || user === void 0 ? void 0 : user.role) === 'creator' ? 'Creator Dashboard' : 'Your Profile' }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => router.push('/playlists'), className: "px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" }) }), _jsx("span", { children: "Playlists" })] }), _jsxs("button", { onClick: () => {
                                                        if (typeof window !== 'undefined') {
                                                            localStorage.removeItem('user');
                                                            localStorage.removeItem('accessToken');
                                                            localStorage.removeItem('refreshToken');
                                                        }
                                                        router.push('/login');
                                                    }, className: "px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FF4D67] text-[#FF4D67] hover:bg-[#FF4D67]/10 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }), _jsx("span", { children: "Logout" })] })] })] }), _jsx("p", { className: "text-gray-400 text-sm", children: (user === null || user === void 0 ? void 0 : user.role) === 'creator'
                                        ? 'Manage your content, view analytics, and engage with your audience'
                                        : 'Manage your account settings and preferences' })] }), _jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 mb-6 border border-gray-700/50", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-5 mb-5", children: [_jsx("div", { className: "relative", children: _jsxs("div", { className: "w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center relative overflow-hidden", children: [avatarUrl ? (_jsx("img", { src: avatarUrl, alt: "Profile", className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-2xl sm:text-3xl font-bold text-white z-10", children: ((_b = (_a = user === null || user === void 0 ? void 0 : user.name) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'U' })), _jsx("div", { className: "absolute inset-0 bg-black/20" })] }) }), _jsxs("div", { className: "text-center sm:text-left flex-1", children: [_jsx("h2", { className: "text-xl sm:text-2xl font-bold text-white", children: (user === null || user === void 0 ? void 0 : user.name) || 'User' }), _jsx("p", { className: "text-gray-400 mb-2 text-sm", children: (user === null || user === void 0 ? void 0 : user.email) || 'user@example.com' }), _jsxs("div", { className: "inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-xs", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 mr-2" }), (user === null || user === void 0 ? void 0 : user.role) === 'creator' ? 'Creator Account' : 'Fan Account'] }), (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (user === null || user === void 0 ? void 0 : user.creatorType) && (_jsx("div", { className: "mt-2 inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-xs", children: user.creatorType.charAt(0).toUpperCase() + user.creatorType.slice(1) })), (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (_jsxs("div", { className: "mt-4 flex flex-wrap gap-2 justify-center sm:justify-start", children: [_jsxs("button", { onClick: () => router.push('/upload'), className: "px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors text-sm font-medium flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" }) }), "Upload Track"] }), _jsxs("button", { onClick: () => router.push('/create-album'), className: "px-4 py-2 bg-[#FFCB2B] text-gray-900 rounded-lg hover:bg-[#FFCB2B]/80 transition-colors text-sm font-medium flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" }) }), "Create Album"] })] }))] })] }), _jsx("div", { className: "flex justify-center sm:justify-start", children: _jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE", onFileUploadSuccess: handleAvatarUploadSuccess, multiple: false, className: "my-config" }) }), (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (_jsxs("div", { className: "mb-5", children: [_jsx("h3", { className: "text-gray-400 text-xs mb-2", children: "Bio" }), _jsx("p", { className: "text-white text-sm", children: bio || 'No bio added yet. Tell your fans about yourself!' })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3", children: [_jsxs("div", { className: "card-bg rounded-xl p-4 border border-gray-700/30", children: [_jsx("h3", { className: "text-gray-400 text-xs mb-1", children: "Member Since" }), _jsx("p", { className: "text-white font-medium text-sm", children: "January 2024" })] }), _jsxs("div", { className: "card-bg rounded-xl p-4 border border-gray-700/30", children: [_jsx("h3", { className: "text-gray-400 text-xs mb-1", children: "Favorite Genres" }), _jsx("p", { className: "text-white font-medium text-sm", children: genres && genres.length > 0 ? genres.join(', ') : 'Not specified' })] }), _jsxs("div", { className: "card-bg rounded-xl p-4 border border-gray-700/30 cursor-pointer hover:border-[#FFCB2B]/50 transition-colors", onClick: () => router.push('/'), children: [_jsx("h3", { className: "text-gray-400 text-xs mb-1", children: "Following" }), _jsx("p", { className: "text-white font-medium text-sm", children: ((_c = user === null || user === void 0 ? void 0 : user.followingCount) === null || _c === void 0 ? void 0 : _c.toLocaleString()) || '0' })] }), _jsxs("div", { className: "card-bg rounded-xl p-4 border border-gray-700/30", children: [_jsx("h3", { className: "text-gray-400 text-xs mb-1", children: "Followers" }), _jsx("p", { className: "text-white font-medium text-sm", children: ((_d = user === null || user === void 0 ? void 0 : user.followersCount) === null || _d === void 0 ? void 0 : _d.toLocaleString()) || '0' })] })] })] }), _jsxs("div", { className: "flex overflow-x-auto border-b border-gray-800 mb-6 scrollbar-hide", style: { scrollbarWidth: 'none', msOverflowStyle: 'none' }, children: [_jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'profile'
                                        ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                        : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('profile'), children: "Profile Settings" }), _jsx(Link, { href: "/favorites", className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'favorites'
                                        ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                        : 'text-gray-500 hover:text-gray-300'}`, children: "Favorites" }), _jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'recently-played'
                                        ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                        : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('recently-played'), children: "Recently Played" }), _jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'following'
                                        ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                        : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('following'), children: "Following" }), (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (_jsxs(_Fragment, { children: [_jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'analytics'
                                                ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                                : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('analytics'), children: "Analytics" }), _jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'tracks'
                                                ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                                : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('tracks'), children: "My Tracks" }), _jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'albums'
                                                ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                                : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('albums'), children: "My Albums" }), _jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'whatsapp'
                                                ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                                : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('whatsapp'), children: "WhatsApp Contact" })] }))] }), activeTab === 'profile' && (_jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50", children: [_jsx("h3", { className: "text-lg sm:text-xl font-bold text-white mb-5", children: "Account Settings" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { className: "pt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Profile Picture" }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4", children: [_jsxs("div", { className: "w-16 h-16 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center relative overflow-hidden", children: [avatarUrl ? (_jsx("img", { src: avatarUrl, alt: "Profile", className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-lg font-bold text-white z-10", children: ((_f = (_e = user === null || user === void 0 ? void 0 : user.name) === null || _e === void 0 ? void 0 : _e.charAt(0)) === null || _f === void 0 ? void 0 : _f.toUpperCase()) || 'U' })), _jsx("div", { className: "absolute inset-0 bg-black/20" })] }), _jsx("div", { className: "flex flex-col sm:flex-row gap-2 w-full sm:w-auto", children: !avatarUrl ? (_jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE", onFileUploadSuccess: handleAvatarUploadSuccess, multiple: false, className: "my-config" })) : (_jsxs("div", { className: "flex flex-col sm:flex-row gap-2 w-full sm:w-auto", children: [_jsx("button", { type: "button", onClick: () => setAvatarUrl(null), className: "px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium w-full sm:w-auto", children: "Remove" }), _jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE", onFileUploadSuccess: handleAvatarUploadSuccess, multiple: false, className: "my-config" })] })) })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-300 mb-2", children: "Full Name" }), _jsx("input", { type: "text", id: "name", defaultValue: (user === null || user === void 0 ? void 0 : user.name) || '', className: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-300 mb-2", children: "Email Address" }), _jsx("input", { type: "email", id: "email", defaultValue: (user === null || user === void 0 ? void 0 : user.email) || '', className: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm" })] }), (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "bio", className: "block text-sm font-medium text-gray-300 mb-2", children: "Bio" }), _jsx("textarea", { id: "bio", value: bio, onChange: (e) => setBio(e.target.value), placeholder: "Tell your fans about yourself...", className: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm min-h-[100px]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Favorite Genres" }), _jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: genres.map((genre, index) => (_jsxs("div", { className: "flex items-center bg-gray-700 rounded-full px-3 py-1 text-sm", children: [_jsx("span", { className: "text-white", children: genre }), _jsx("button", { type: "button", onClick: () => setGenres(genres.filter((_, i) => i !== index)), className: "ml-2 text-gray-400 hover:text-white", children: _jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }, index))) }), _jsxs("div", { className: "flex", children: [_jsx("input", { type: "text", value: newGenre, onChange: (e) => setNewGenre(e.target.value), placeholder: "Add a genre...", className: "flex-1 px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-l-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm", onKeyDown: (e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            if (newGenre.trim() && !genres.includes(newGenre.trim())) {
                                                                                setGenres([...genres, newGenre.trim()]);
                                                                                setNewGenre('');
                                                                            }
                                                                        }
                                                                    } }), _jsx("button", { type: "button", onClick: () => {
                                                                        if (newGenre.trim() && !genres.includes(newGenre.trim())) {
                                                                            setGenres([...genres, newGenre.trim()]);
                                                                            setNewGenre('');
                                                                        }
                                                                    }, className: "px-4 bg-[#FF4D67] text-white rounded-r-lg hover:bg-[#FF4D67]/80 transition-colors text-sm font-medium", children: "Add" })] })] })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "currentPassword", className: "block text-sm font-medium text-gray-300 mb-2", children: "Current Password" }), _jsx("input", { type: "password", id: "currentPassword", placeholder: "Enter current password", className: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-300 mb-2", children: "New Password" }), _jsx("input", { type: "password", id: "password", placeholder: "Enter new password", className: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm" })] }), (user === null || user === void 0 ? void 0 : user.role) !== 'creator' && (_jsxs("div", { className: "card-bg rounded-xl p-4 border-l-4 border-[#FFCB2B]", children: [_jsxs("h4", { className: "font-medium text-white mb-2 flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4 text-[#FFCB2B]", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 101 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }), "Want to become a creator?"] }), _jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Upgrade your account to upload music and connect with fans." }), _jsx("button", { onClick: () => router.push('/upload'), className: "px-3 py-1.5 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs font-medium transition-colors", type: "button", children: "Upgrade to Creator" })] })), _jsx("div", { className: "flex justify-end pt-2", children: _jsx("button", { type: "submit", className: "px-5 py-2.5 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm", children: "Save Changes" }) })] }), _jsxs("div", { className: "mt-8 pt-6 border-t border-gray-700", children: [_jsxs("h3", { className: "text-lg font-bold text-white mb-4 flex items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-[#FF4D67]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), "Legal & Information"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs(Link, { href: "/about", className: "flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors group", children: [_jsx("span", { className: "text-gray-300 group-hover:text-white", children: "About Us" }), _jsx("svg", { className: "w-4 h-4 text-gray-500 group-hover:text-[#FF4D67]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" }) })] }), _jsxs(Link, { href: "/contact", className: "flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors group", children: [_jsx("span", { className: "text-gray-300 group-hover:text-white", children: "Contact Us" }), _jsx("svg", { className: "w-4 h-4 text-gray-500 group-hover:text-[#FF4D67]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" }) })] }), _jsxs(Link, { href: "/faq", className: "flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors group", children: [_jsx("span", { className: "text-gray-300 group-hover:text-white", children: "FAQ" }), _jsx("svg", { className: "w-4 h-4 text-gray-500 group-hover:text-[#FF4D67]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" }) })] }), _jsxs(Link, { href: "/terms", className: "flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors group", children: [_jsx("span", { className: "text-gray-300 group-hover:text-white", children: "Terms of Use" }), _jsx("svg", { className: "w-4 h-4 text-gray-500 group-hover:text-[#FF4D67]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" }) })] }), _jsxs(Link, { href: "/privacy", className: "flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors group", children: [_jsx("span", { className: "text-gray-300 group-hover:text-white", children: "Privacy Policy" }), _jsx("svg", { className: "w-4 h-4 text-gray-500 group-hover:text-[#FF4D67]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" }) })] }), _jsxs(Link, { href: "/copyright", className: "flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-colors group", children: [_jsx("span", { className: "text-gray-300 group-hover:text-white", children: "Copyright Policy" }), _jsx("svg", { className: "w-4 h-4 text-gray-500 group-hover:text-[#FF4D67]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" }) })] })] })] })] })), activeTab === 'analytics' && (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (_jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50", children: [_jsx("h3", { className: "text-lg sm:text-xl font-bold text-white mb-5", children: "Performance Analytics" }), error && (_jsxs("div", { className: "bg-red-900/50 border border-red-700 rounded-lg p-4 mb-5", children: [_jsx("div", { className: "text-red-300 text-sm", children: error }), _jsx("button", { onClick: fetchAnalytics, className: "mt-2 px-3 py-1.5 bg-red-700 text-white rounded hover:bg-red-600 text-sm", children: "Retry" })] })), loadingAnalytics ? (_jsx("div", { className: "flex justify-center items-center h-40", children: _jsx("div", { className: "text-white text-sm", children: "Loading analytics..." }) })) : analytics ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "card-bg rounded-xl p-5 border border-gray-700/30 text-center", children: [_jsx("div", { className: "text-2xl sm:text-3xl font-bold text-[#FF4D67] mb-2", children: analytics.totalTracks }), _jsx("div", { className: "text-gray-400 text-sm", children: "Total Tracks" })] }), _jsxs("div", { className: "card-bg rounded-xl p-5 border border-gray-700/30 text-center", children: [_jsx("div", { className: "text-2xl sm:text-3xl font-bold text-[#FFCB2B] mb-2", children: analytics.totalPlays.toLocaleString() }), _jsx("div", { className: "text-gray-400 text-sm", children: "Total Plays" })] }), _jsxs("div", { className: "card-bg rounded-xl p-5 border border-gray-700/30 text-center", children: [_jsx("div", { className: "text-2xl sm:text-3xl font-bold text-[#6C63FF] mb-2", children: analytics.totalLikes.toLocaleString() }), _jsx("div", { className: "text-gray-400 text-sm", children: "Total Likes" })] })] }), analytics.topCountries && analytics.topCountries.length > 0 && (_jsxs("div", { className: "card-bg rounded-xl p-5 border border-gray-700/30 mb-6", children: [_jsx("h4", { className: "text-lg font-bold text-white mb-4", children: "Top Listener Locations" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: analytics.topCountries.map((countryData, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center text-white text-xs font-bold mr-3", children: index + 1 }), _jsx("span", { className: "text-white font-medium", children: countryData.country })] }), _jsxs("span", { className: "text-gray-400 text-sm", children: [countryData.count, " listeners"] })] }, index))) }), _jsx("div", { className: "mt-4 text-xs text-gray-500", children: "Based on IP address tracking of listeners" })] }))] })) : !error ? (_jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "No analytics data available" })) : null] })), activeTab === 'tracks' && (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (_jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50", children: [_jsxs("div", { className: "flex justify-between items-center mb-5", children: [_jsx("h3", { className: "text-lg sm:text-xl font-bold text-white", children: "My Tracks" }), _jsxs("button", { onClick: () => router.push('/upload'), className: "px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors text-sm font-medium flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" }) }), "Upload Track"] })] }), error && (_jsxs("div", { className: "bg-red-900/50 border border-red-700 rounded-lg p-4 mb-5", children: [_jsx("div", { className: "text-red-300 text-sm", children: error }), _jsx("button", { onClick: () => fetchTracks(tracksPage), className: "mt-2 px-3 py-1.5 bg-red-700 text-white rounded hover:bg-red-600 text-sm", children: "Retry" })] })), loadingTracks ? (_jsx("div", { className: "flex justify-center items-center h-40", children: _jsx("div", { className: "text-white text-sm", children: "Loading tracks..." }) })) : tracks && tracks.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredTracks.map((track) => (_jsxs("div", { className: "card-bg rounded-xl p-4 border border-gray-700/30 hover:border-[#FF4D67]/50 transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center overflow-hidden", children: track.coverURL ? (_jsx("img", { src: track.coverURL, alt: track.title, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-white font-bold text-xs", children: track.title.charAt(0) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-medium text-white truncate", children: track.title }), _jsx("p", { className: "text-gray-400 text-xs truncate", children: (typeof track.creatorId === 'object' && track.creatorId !== null && 'name' in track.creatorId) ? track.creatorId.name : 'Unknown Artist' })] })] }), _jsxs("div", { className: "flex justify-between items-center text-xs text-gray-400 mb-3", children: [_jsx("span", { children: new Date(track.createdAt).toLocaleDateString() }), _jsxs("span", { children: [track.likes || 0, " likes"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                                                                    // Map tracks to the format expected by the audio player
                                                                    const mappedTracks = filteredTracks.map(mapTrackForPlayer);
                                                                    setCurrentPlaylist(mappedTracks);
                                                                    playTrack(mapTrackForPlayer(track));
                                                                }, className: "flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium", children: "Play" }), _jsx("button", { onClick: () => router.push(`/edit-track/${track._id}`), className: "px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) }), _jsx("button", { onClick: () => {
                                                                    setItemToDelete({
                                                                        type: 'track',
                                                                        id: track._id,
                                                                        title: track.title
                                                                    });
                                                                    setShowDeleteModal(true);
                                                                }, className: "px-3 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg transition-colors", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" }) }) })] })] }, track._id))) }), tracksTotalPages > 1 && (_jsxs("div", { className: "flex justify-center items-center gap-2 mt-6", children: [_jsx("button", { onClick: () => handlePageChange(Math.max(1, tracksPage - 1), 'tracks'), disabled: tracksPage === 1, className: "px-3 py-1.5 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-sm", children: "Previous" }), _jsxs("span", { className: "text-white text-sm", children: ["Page ", tracksPage, " of ", tracksTotalPages] }), _jsx("button", { onClick: () => handlePageChange(Math.min(tracksTotalPages, tracksPage + 1), 'tracks'), disabled: tracksPage === tracksTotalPages, className: "px-3 py-1.5 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-sm", children: "Next" })] }))] })) : !error ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" }) }) }), _jsx("h4", { className: "text-white font-medium mb-2", children: "No tracks yet" }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: "Start uploading your music to share with fans" }), _jsx("button", { onClick: () => router.push('/upload'), className: "px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors text-sm font-medium", children: "Upload Your First Track" })] })) : null] })), activeTab === 'albums' && (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (_jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50", children: [_jsxs("div", { className: "flex justify-between items-center mb-5", children: [_jsx("h3", { className: "text-lg sm:text-xl font-bold text-white", children: "My Albums" }), _jsxs("button", { onClick: () => router.push('/create-album'), className: "px-4 py-2 bg-[#FFCB2B] text-gray-900 rounded-lg hover:bg-[#FFCB2B]/80 transition-colors text-sm font-medium flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" }) }), "Create Album"] })] }), error && (_jsxs("div", { className: "bg-red-900/50 border border-red-700 rounded-lg p-4 mb-5", children: [_jsx("div", { className: "text-red-300 text-sm", children: error }), _jsx("button", { onClick: fetchAlbums, className: "mt-2 px-3 py-1.5 bg-red-700 text-white rounded hover:bg-red-600 text-sm", children: "Retry" })] })), loadingAlbums ? (_jsx("div", { className: "flex justify-center items-center h-40", children: _jsx("div", { className: "text-white text-sm", children: "Loading albums..." }) })) : albums && albums.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredAlbums.map((album) => (_jsxs("div", { className: "card-bg rounded-xl p-4 border border-gray-700/30 hover:border-[#FFCB2B]/50 transition-colors group", children: [_jsxs("div", { className: "relative mb-3", children: [_jsx("div", { className: "aspect-square rounded-lg bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center overflow-hidden", children: album.coverImage ? (_jsx("img", { src: album.coverImage, alt: album.title, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-white font-bold text-2xl", children: album.title.charAt(0) })) }), _jsx("button", { onClick: () => {
                                                            // View album tracks
                                                            router.push(`/album/${album.id}`);
                                                        }, className: "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg", children: _jsxs("svg", { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })] }) })] }), _jsx("h4", { className: "font-medium text-white truncate mb-1", children: album.title }), _jsx("p", { className: "text-gray-400 text-xs mb-2", children: album.artist }), _jsxs("div", { className: "flex justify-between items-center text-xs text-gray-400", children: [_jsx("span", { children: album.year }), _jsxs("span", { children: [album.tracks, " tracks"] })] }), _jsxs("div", { className: "flex gap-2 mt-3", children: [_jsx("button", { onClick: () => router.push(`/edit-album/${album.id}`), className: "flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium", children: "Edit" }), _jsx("button", { onClick: () => {
                                                            setItemToDelete({
                                                                type: 'album',
                                                                id: album.id,
                                                                title: album.title
                                                            });
                                                            setShowDeleteModal(true);
                                                        }, className: "px-3 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg transition-colors", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" }) }) })] })] }, album.id))) })) : !error ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" }) }) }), _jsx("h4", { className: "text-white font-medium mb-2", children: "No albums yet" }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: "Create your first album to showcase your music collection" }), _jsx("button", { onClick: () => router.push('/create-album'), className: "px-4 py-2 bg-[#FFCB2B] text-gray-900 rounded-lg hover:bg-[#FFCB2B]/80 transition-colors text-sm font-medium", children: "Create Your First Album" })] })) : null] }))] }) }), showDeleteModal && itemToDelete && (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "card-bg rounded-2xl p-6 max-w-md w-full border border-gray-700/50", children: [_jsx("h3", { className: "text-lg font-bold text-white mb-2", children: "Confirm Deletion" }), _jsxs("p", { className: "text-gray-400 text-sm mb-6", children: ["Are you sure you want to delete \"", itemToDelete.title, "\"? This action cannot be undone."] }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx("button", { onClick: () => {
                                        setShowDeleteModal(false);
                                        setItemToDelete(null);
                                    }, className: "px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium", children: "Cancel" }), _jsx("button", { onClick: confirmDelete, className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium", children: "Delete" })] })] }) })), activeTab === 'whatsapp' && (user === null || user === void 0 ? void 0 : user.role) === 'creator' && (_jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50", children: [_jsx("h3", { className: "text-lg sm:text-xl font-bold text-white mb-5", children: "WhatsApp Contact Information" }), _jsxs("div", { className: "max-w-2xl", children: [_jsx("p", { className: "text-gray-400 text-sm mb-6", children: "Fans can contact you via WhatsApp for beats and collaborations. This information will be visible to other users when they view your profile or tracks marked as beats." }), _jsxs("form", { onSubmit: async (e) => {
                                    e.preventDefault();
                                    // Use the new WhatsApp contact update function
                                    const success = await updateWhatsAppContact(whatsappContact.trim());
                                    if (success) {
                                        alert('WhatsApp contact updated successfully!');
                                    }
                                    else {
                                        alert('Failed to update WhatsApp contact. Please try again.');
                                    }
                                }, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "whatsappContact", className: "block text-sm font-medium text-gray-300 mb-2", children: "WhatsApp Number" }), _jsx("input", { type: "text", id: "whatsappContact", value: whatsappContact, onChange: (e) => setWhatsappContact(e.target.value), placeholder: "Enter your WhatsApp number (e.g., +1234567890)", className: "w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm" }), _jsx("p", { className: "mt-2 text-xs text-gray-400", children: "Include country code. Leave empty if you don't want to be contacted via WhatsApp." })] }), _jsxs("div", { className: "bg-gray-800/30 rounded-lg p-4 border border-gray-700/50", children: [_jsxs("h4", { className: "font-medium text-white mb-2 flex items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-[#25D366]", fill: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.480-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" }) }), "How it works"] }), _jsxs("ul", { className: "text-xs text-gray-400 space-y-1", children: [_jsx("li", { children: "\u2022 Users can contact you directly via WhatsApp for beats" }), _jsx("li", { children: "\u2022 Your number is only visible for tracks marked as \"beats\"" }), _jsx("li", { children: "\u2022 You can update this information at any time" }), _jsx("li", { children: "\u2022 Leave empty to disable WhatsApp contact" })] })] }), _jsx("div", { className: "flex justify-end pt-2", children: _jsx("button", { type: "submit", className: "px-5 py-2.5 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm", children: "Save WhatsApp Number" }) })] })] })] })), activeTab === 'recently-played' && (_jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50", children: [_jsxs("div", { className: "flex justify-between items-center mb-5", children: [_jsx("h3", { className: "text-lg sm:text-xl font-bold text-white", children: "Recently Played" }), _jsxs("button", { onClick: () => router.push('/explore'), className: "px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors text-sm font-medium flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z", clipRule: "evenodd" }) }), "View New Tracks"] })] }), loadingRecentlyPlayed ? (_jsx("div", { className: "flex justify-center items-center h-40", children: _jsx("div", { className: "text-white text-sm", children: "Loading recently played tracks..." }) })) : recentlyPlayedTracks.length > 0 ? (_jsx("div", { className: "space-y-4", children: recentlyPlayedTracks.map((track) => (_jsxs("div", { className: "card-bg rounded-xl p-4 flex items-center gap-4 transition-all hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: track.coverImage, alt: track.title, className: "w-16 h-16 rounded-lg object-cover" }), _jsx("button", { onClick: () => {
                                                playTrack(track);
                                                // Set the current playlist to all recently played tracks
                                                setCurrentPlaylist(recentlyPlayedTracks);
                                            }, className: "absolute inset-0 w-full h-full rounded-lg bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" }) }) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-bold text-white text-sm sm:text-base truncate", children: track.title }), _jsx("p", { className: "text-gray-400 text-xs sm:text-sm truncate", children: track.artist }), _jsxs("p", { className: "text-gray-500 text-xs mt-1", children: ["Played ", new Date(track.playedAt).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-gray-500 text-xs sm:text-sm hidden sm:block", children: track.duration ? `${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, '0')}` : '3:45' }), _jsx("button", { onClick: () => {
                                                // Toggle favorite status for the track
                                                const isFavorite = Object.values(favorites).some((fav) => fav.id === track.id);
                                                if (isFavorite) {
                                                    removeFromFavorites(track.id);
                                                }
                                                else {
                                                    addToFavorites(track);
                                                }
                                            }, className: "p-1.5 sm:p-2 rounded-full hover:bg-gray-800/50 transition-all duration-300 hover:scale-110", children: _jsx("svg", { className: `w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${Object.values(favorites).some((fav) => fav.id === track.id) ? 'text-red-500 fill-current scale-110' : 'text-[#FF4D67] stroke-current'}`, fill: Object.values(favorites).some((fav) => fav.id === track.id) ? "currentColor" : "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }) }) })] })] }, track.id))) })) : (_jsxs("div", { className: "card-bg rounded-2xl p-8 sm:p-12 text-center border border-gray-700/50", children: [_jsx("div", { className: "mx-auto w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-6", children: _jsx("svg", { className: "w-8 h-8 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h3", { className: "text-xl sm:text-2xl font-bold text-white mb-3", children: "No recently played tracks" }), _jsx("p", { className: "text-gray-500 mb-6 max-w-md mx-auto", children: "Start listening to music and your recently played tracks will appear here" }), _jsx("button", { onClick: () => router.push('/explore'), className: "px-5 py-2.5 sm:px-6 sm:py-3 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base", children: "Explore Music" })] }))] })), activeTab === 'following' && (_jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 border border-gray-700/50", children: [_jsx("h3", { className: "text-lg sm:text-xl font-bold text-white mb-5", children: "Following" }), loadingFollowed ? (_jsx("div", { className: "flex justify-center items-center h-40", children: _jsx("div", { className: "text-white text-sm", children: "Loading followed creators..." }) })) : followedCreators && followedCreators.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: followedCreators.map((creator) => (_jsxs("div", { className: "card-bg rounded-xl p-4 border border-gray-700/30 hover:border-[#FF4D67]/50 transition-colors cursor-pointer", onClick: () => router.push(`/artists/${creator._id}`), children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center overflow-hidden", children: creator.avatar ? (_jsx("img", { src: creator.avatar, alt: creator.name, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-white font-bold text-xs", children: creator.name.charAt(0) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-medium text-white truncate", children: creator.name }), _jsx("p", { className: "text-gray-400 text-xs truncate capitalize", children: creator.creatorType })] })] }), _jsx("div", { className: "flex justify-between text-xs text-gray-400", children: _jsxs("span", { children: [creator.followersCount || 0, " followers"] }) })] }, creator._id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }) }) }), _jsx("h4", { className: "text-white font-medium mb-2", children: "Not following anyone yet" }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: "Start following creators to see them here" }), _jsx("button", { onClick: () => router.push('/explore'), className: "px-4 py-2 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors text-sm font-medium", children: "Explore Creators" })] }))] }))] }));
}
