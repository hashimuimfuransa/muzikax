'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
// Import UploadCare components
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
export default function CreateAlbum() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('afrobeat');
    const [coverUrl, setCoverUrl] = useState(null); // State for uploaded cover URL
    const [tracks, setTracks] = useState([]);
    const [availableTracks, setAvailableTracks] = useState([]); // Tracks available for selection
    const [selectedTrackIds, setSelectedTrackIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();
    const { isAuthenticated, userRole, isLoading } = useAuth();
    // Extended list of popular genres
    const genres = [
        'afrobeat',
        'amapiano',
        'gakondo',
        'amapiyano',
        'afro gako',
        'hiphop',
        'rnb',
        'afropop',
        'gospel',
        'traditional',
        'dancehall',
        'reggae',
        'soul',
        'jazz',
        'blues',
        'pop',
        'rock',
        'electronic',
        'house',
        'techno',
        'drill',
        'trap',
        'lofi',
        'ambient'
    ];
    // Check authentication and role on component mount
    useEffect(() => {
        // Don't redirect while loading
        if (!isLoading && !isAuthenticated) {
            // If not authenticated, redirect to login
            router.push('/login');
        }
        else if (!isLoading && isAuthenticated && userRole !== 'creator') {
            // If authenticated but not a creator, redirect to upgrade
            router.push('/upgrade');
        }
    }, [isAuthenticated, userRole, router, isLoading]);
    // Fetch creator tracks on component mount
    useEffect(() => {
        const loadTracks = async () => {
            if (!isLoading && isAuthenticated && userRole === 'creator') {
                try {
                    setLoading(true);
                    // Fetch tracks with token refresh
                    const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/creator/tracks?page=1&limit=100`);
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to fetch tracks');
                    }
                    const data = await response.json();
                    setAvailableTracks(data.tracks);
                }
                catch (err) {
                    console.error('Failed to fetch tracks:', err);
                    setError('Failed to load your tracks');
                }
                finally {
                    setLoading(false);
                }
            }
        };
        loadTracks();
    }, [isAuthenticated, userRole, isLoading]);
    // Show loading state while checking auth
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center", children: _jsx("div", { className: "text-white", children: "Loading..." }) }));
    }
    // Handle successful cover image upload
    const handleCoverUploadSuccess = (info) => {
        console.log('Cover image uploaded successfully:', info);
        if (info.cdnUrl) {
            setCoverUrl(info.cdnUrl);
        }
    };
    // Function to refresh token
    const refreshToken = async () => {
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
        }
        catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    };
    // Helper function to make authenticated request with token refresh
    const makeAuthenticatedRequest = async (url, options = {}) => {
        let accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('No access token found');
        }
        // Add authorization header to options
        const requestOptions = Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, options.headers), { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }) });
        // Make initial request
        let response = await fetch(url, requestOptions);
        // If token is expired, try to refresh it
        if (response.status === 401) {
            console.log('Token might be expired, attempting to refresh...');
            const newToken = await refreshToken();
            if (newToken) {
                // Retry the request with new token
                requestOptions.headers = Object.assign(Object.assign({}, requestOptions.headers), { 'Authorization': `Bearer ${newToken}` });
                response = await fetch(url, requestOptions);
            }
        }
        return response;
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Album title is required');
            return;
        }
        if (selectedTrackIds.length === 0) {
            setError('Please select at least one track for your album');
            return;
        }
        try {
            setIsUploading(true);
            setError(null);
            setSuccess(null);
            // Create the album with token refresh
            const albumData = {
                title,
                description,
                genre,
                coverURL: coverUrl || '',
                trackIds: selectedTrackIds
            };
            const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/albums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(albumData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create album');
            }
            const newAlbum = await response.json();
            setSuccess('Album created successfully!');
            // Redirect to album page after a short delay
            setTimeout(() => {
                router.push(`/album/${newAlbum._id}`);
            }, 1500);
        }
        catch (err) {
            console.error('Failed to create album:', err);
            setError(err.message || 'Failed to create album');
        }
        finally {
            setIsUploading(false);
        }
    };
    // Toggle track selection
    const toggleTrackSelection = (trackId) => {
        setSelectedTrackIds(prev => {
            if (prev.includes(trackId)) {
                return prev.filter(id => id !== trackId);
            }
            else {
                return [...prev, trackId];
            }
        });
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12", children: [_jsx("div", { className: "absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "container mx-auto px-4 sm:px-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("button", { onClick: () => router.back(), className: "flex items-center text-gray-400 hover:text-white mb-6 transition-colors", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z", clipRule: "evenodd" }) }), "Back"] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-2", children: "Create New Album" }), _jsx("p", { className: "text-gray-400", children: "Organize your tracks into a cohesive album" })] }), _jsxs("div", { className: "card-bg rounded-2xl p-6 sm:p-8 border border-gray-700/50", children: [error && (_jsx("div", { className: "bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6", children: _jsx("div", { className: "text-red-300", children: error }) })), success && (_jsx("div", { className: "bg-green-900/50 border border-green-700 rounded-lg p-4 mb-6", children: _jsx("div", { className: "text-green-300", children: success }) })), _jsx("form", { onSubmit: handleSubmit, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-300 mb-2", children: "Album Title *" }), _jsx("input", { type: "text", id: "title", name: "title", value: title, onChange: (e) => setTitle(e.target.value), className: "w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all", placeholder: "Enter album title" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "genre", className: "block text-sm font-medium text-gray-300 mb-2", children: "Genre" }), _jsx("select", { id: "genre", name: "genre", value: genre, onChange: (e) => setGenre(e.target.value), className: "w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all", children: genres.map((g) => (_jsx("option", { value: g, children: g.charAt(0).toUpperCase() + g.slice(1) }, g))) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-300 mb-2", children: "Description" }), _jsx("textarea", { id: "description", name: "description", value: description, onChange: (e) => setDescription(e.target.value), rows: 4, className: "w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all", placeholder: "Describe your album..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Album Cover Image" }), _jsx("div", { className: "border-2 border-dashed border-gray-700 rounded-lg p-6 text-center", children: coverUrl ? (_jsxs("div", { className: "relative", children: [_jsx("img", { src: coverUrl, alt: "Album cover", className: "mx-auto max-h-64 rounded-lg" }), _jsx("button", { type: "button", onClick: () => setCoverUrl(null), className: "absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700", children: _jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] })) : (_jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_UPLOADCARE_PUBLIC_KEY", onFileUploadSuccess: handleCoverUploadSuccess, className: "w-full" })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Select Tracks for Album *" }), loading ? (_jsx("div", { className: "text-white py-4", children: "Loading your tracks..." })) : availableTracks.length > 0 ? (_jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto pr-2", children: availableTracks.map((track) => (_jsx("div", { className: `flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedTrackIds.includes(track._id)
                                                                ? 'border-[#FF4D67] bg-[#FF4D67]/10'
                                                                : 'border-gray-700 hover:border-gray-600'}`, onClick: () => toggleTrackSelection(track._id), children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-5 h-5 rounded border flex items-center justify-center mr-3 ${selectedTrackIds.includes(track._id)
                                                                            ? 'bg-[#FF4D67] border-[#FF4D67]'
                                                                            : 'border-gray-600'}`, children: selectedTrackIds.includes(track._id) && (_jsx("svg", { className: "w-3 h-3 text-white", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-white font-medium truncate", children: track.title }), _jsxs("div", { className: "flex text-xs text-gray-400 gap-2", children: [_jsx("span", { children: track.genre }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(track.createdAt).toLocaleDateString() })] })] })] }) }, track._id))) })) : (_jsxs("div", { className: "text-gray-400 py-4 text-center", children: ["You haven't uploaded any tracks yet. ", _jsx("button", { type: "button", onClick: () => router.push('/upload'), className: "text-[#FF4D67] hover:underline", children: "Upload tracks first" })] })), selectedTrackIds.length > 0 && (_jsxs("div", { className: "mt-3 text-sm text-gray-400", children: ["Selected ", selectedTrackIds.length, " track", selectedTrackIds.length !== 1 ? 's' : ''] }))] }), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx("button", { type: "submit", disabled: isUploading || !title.trim() || selectedTrackIds.length === 0, className: "flex-1 px-6 py-3 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium", children: isUploading ? 'Creating Album...' : 'Create Album' }), _jsx("button", { type: "button", onClick: () => router.push('/profile'), className: "px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium", children: "Cancel" })] })] }) })] })] }) })] }));
}
