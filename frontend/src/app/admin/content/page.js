'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useAudioPlayer } from '../../../contexts/AudioPlayerContext';
import AdminSidebar from '../../../components/AdminSidebar';
export default function ContentManagementPage() {
    const [tracks, setTracks] = useState([]);
    const { playTrack } = useAudioPlayer();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [trackToDelete, setTrackToDelete] = useState(null);
    const [deletionReason, setDeletionReason] = useState('');
    const router = useRouter();
    const { isAuthenticated, userRole } = useAuth();
    const [authChecked, setAuthChecked] = useState(false);
    // Check authentication and role on component mount
    useEffect(() => {
        // Small delay to ensure AuthContext has time to initialize
        const timer = setTimeout(() => {
            setAuthChecked(true);
            if (!isAuthenticated) {
                router.push('/login');
            }
            else if (userRole !== 'admin') {
                router.push('/');
            }
            else {
                fetchTracks();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [isAuthenticated, userRole, router, currentPage, searchQuery, typeFilter]);
    const fetchTracks = async () => {
        try {
            setLoading(true);
            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('limit', '10');
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            if (typeFilter !== 'all') {
                params.append('type', typeFilter);
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch tracks');
            }
            const data = await response.json();
            // Transform the data to match our interface
            const transformedTracks = data.tracks.map((track) => ({
                id: track._id || track.id || '',
                title: track.title || '',
                genre: track.genre || '',
                type: track.type || '',
                plays: track.plays || 0,
                likes: track.likes || 0,
                createdAt: track.createdAt || '',
                audioURL: track.audioURL || track.audioUrl || '',
                coverURL: track.coverURL || track.coverImage || '',
                creatorId: {
                    _id: (track.creatorId && typeof track.creatorId === 'object') ?
                        (track.creatorId._id || track.creatorId.id) :
                        track.creatorId,
                    name: (track.creatorId && typeof track.creatorId === 'object') ?
                        track.creatorId.name :
                        'Unknown'
                }
            }));
            setTracks(transformedTracks);
            setTotalPages(data.pages);
            setLoading(false);
        }
        catch (err) {
            console.error('Error fetching tracks:', err);
            setError('Failed to fetch tracks');
            setLoading(false);
        }
    };
    const handleDeleteTrack = async () => {
        if (!trackToDelete)
            return;
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${trackToDelete.id}`);
            url.searchParams.append('reason', encodeURIComponent(deletionReason));
            const response = await fetch(url.toString(), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete track');
            }
            // Refresh the track list
            fetchTracks();
            setShowDeleteModal(false);
            setTrackToDelete(null);
            setDeletionReason(''); // Clear the reason after successful deletion
        }
        catch (err) {
            console.error('Error deleting track:', err);
            setError('Failed to delete track');
        }
    };
    const openDeleteModal = (track) => {
        setTrackToDelete(track);
        setShowDeleteModal(true);
    };
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setTrackToDelete(null);
    };
    // Don't render the page until auth check is complete
    if (!authChecked) {
        return (_jsx("div", { className: "flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]" }) }));
    }
    // Don't render the page if not authenticated or not authorized
    if (!isAuthenticated || userRole !== 'admin') {
        return null;
    }
    return (_jsxs("div", { className: "flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black", children: [_jsx(AdminSidebar, {}), _jsxs("main", { className: "flex-1 flex flex-col w-full min-h-screen md:ml-64", children: [_jsx("div", { className: "absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10" }), _jsxs("div", { className: "container mx-auto px-4 sm:px-8 py-6 sm:py-8", children: [_jsxs("div", { className: "mb-6 sm:mb-8", children: [_jsx("h1", { className: "text-xl sm:text-2xl md:text-3xl font-bold text-white", children: "Content Management" }), _jsx("p", { className: "text-gray-400 text-sm sm:text-base", children: "Manage platform tracks and content" })] }), _jsx("div", { className: "card-bg rounded-2xl p-4 sm:p-6 mb-6", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "search", className: "block text-sm font-medium text-gray-400 mb-1", children: "Search Tracks" }), _jsx("input", { type: "text", id: "search", placeholder: "Search by title...", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "type-filter", className: "block text-sm font-medium text-gray-400 mb-1", children: "Filter by Type" }), _jsxs("select", { id: "type-filter", className: "px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "song", children: "Song" }), _jsx("option", { value: "beat", children: "Beat" }), _jsx("option", { value: "mix", children: "Mix" })] })] })] }) }), _jsx("div", { className: "card-bg rounded-2xl p-4 sm:p-6", children: loading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]" }) })) : error ? (_jsx("div", { className: "text-red-500 text-center py-8", children: error })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500 text-sm border-b border-gray-800", children: [_jsx("th", { className: "pb-4 font-normal", children: "Track" }), _jsx("th", { className: "pb-4 font-normal", children: "Creator" }), _jsx("th", { className: "pb-4 font-normal", children: "Genre" }), _jsx("th", { className: "pb-4 font-normal", children: "Type" }), _jsx("th", { className: "pb-4 font-normal", children: "Plays" }), _jsx("th", { className: "pb-4 font-normal", children: "Likes" }), _jsx("th", { className: "pb-4 font-normal", children: "Uploaded" }), _jsx("th", { className: "pb-4 font-normal", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-800", children: tracks.filter(t => t.id).map((track) => {
                                                            var _a;
                                                            return (_jsxs("tr", { className: "hover:bg-gray-800/30 transition-colors", children: [_jsx("td", { className: "py-4", children: _jsx("div", { className: "font-medium text-white", children: track.title }) }), _jsx("td", { className: "py-4 text-gray-400", children: ((_a = track.creatorId) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown' }), _jsx("td", { className: "py-4 text-gray-400 capitalize", children: track.genre }), _jsx("td", { className: "py-4", children: _jsx("span", { className: "px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 capitalize", children: track.type }) }), _jsx("td", { className: "py-4 text-gray-400", children: track.plays.toLocaleString() }), _jsx("td", { className: "py-4 text-gray-400", children: track.likes.toLocaleString() }), _jsx("td", { className: "py-4 text-gray-400", children: new Date(track.createdAt).toLocaleDateString() }), _jsx("td", { className: "py-4", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => {
                                                                                        var _a, _b;
                                                                                        // Play the track using the audio player
                                                                                        if (track.id && track.audioURL) {
                                                                                            playTrack({
                                                                                                id: track.id,
                                                                                                title: track.title,
                                                                                                artist: ((_a = track.creatorId) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                                                                                                coverImage: track.coverURL,
                                                                                                audioUrl: track.audioURL,
                                                                                                creatorId: (_b = track.creatorId) === null || _b === void 0 ? void 0 : _b._id,
                                                                                                plays: track.plays,
                                                                                                likes: track.likes,
                                                                                                type: track.type
                                                                                            });
                                                                                        }
                                                                                    }, disabled: !track.id || !track.audioURL, className: `px-3 py-1 rounded-lg text-sm transition-colors ${track.id && track.audioURL ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`, children: "Play" }), _jsx("button", { onClick: () => {
                                                                                        if (track.id) {
                                                                                            router.push(`/tracks/${track.id}`);
                                                                                        }
                                                                                    }, disabled: !track.id, className: `px-3 py-1 rounded-lg text-sm transition-colors ${track.id ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`, children: "View" }), _jsx("button", { onClick: () => openDeleteModal(track), disabled: !track.id, className: `px-3 py-1 rounded-lg text-sm transition-colors ${track.id ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`, children: "Delete" })] }) })] }, track.id));
                                                        }) })] }) }), totalPages > 1 && (_jsxs("div", { className: "flex justify-between items-center mt-6 pt-4 border-t border-gray-800", children: [_jsx("button", { onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)), disabled: currentPage === 1, className: `px-4 py-2 rounded-lg ${currentPage === 1
                                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`, children: "Previous" }), _jsxs("div", { className: "text-gray-400 text-sm", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, className: `px-4 py-2 rounded-lg ${currentPage === totalPages
                                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`, children: "Next" })] }))] })) })] })] }), showDeleteModal && trackToDelete && (_jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "card-bg rounded-2xl p-6 max-w-md w-full", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "Confirm Deletion" }), _jsxs("p", { className: "text-gray-400 mb-4", children: ["Are you sure you want to delete the track ", _jsx("span", { className: "text-white font-semibold", children: trackToDelete.title }), "? This action cannot be undone and will permanently remove the track from the platform."] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { htmlFor: "deletion-reason", className: "block text-sm font-medium text-gray-400 mb-2", children: "Reason for Deletion" }), _jsx("textarea", { id: "deletion-reason", value: deletionReason, onChange: (e) => setDeletionReason(e.target.value), placeholder: "Enter reason for deleting this track...", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] min-h-[100px]" })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: closeDeleteModal, className: "px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleDeleteTrack, className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors", disabled: !deletionReason.trim(), children: "Delete Track" })] })] }) }))] }));
}
