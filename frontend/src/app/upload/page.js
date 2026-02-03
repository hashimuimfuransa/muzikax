'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
// Import UploadCare components
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
export default function Upload() {
    const [dragActive, setDragActive] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('afrobeat');
    const [type, setType] = useState('song'); // Add track type state
    const [paymentType, setPaymentType] = useState('free'); // Add payment type state for beats
    const [visibility, setVisibility] = useState('public');
    const [releaseDate, setReleaseDate] = useState(''); // Release date state
    const [collaborators, setCollaborators] = useState(''); // Collaborators state
    const [copyrightAccepted, setCopyrightAccepted] = useState(false); // Copyright acceptance state
    const [file, setFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null); // State for cover image
    const [audioUrl, setAudioUrl] = useState(null); // State for uploaded audio URL
    const [coverUrl, setCoverUrl] = useState(null); // State for uploaded cover URL
    // Album upload states
    const [isAlbumUpload, setIsAlbumUpload] = useState(false);
    const [albumTitle, setAlbumTitle] = useState('');
    const [albumDescription, setAlbumDescription] = useState('');
    const [albumCoverUrl, setAlbumCoverUrl] = useState(null); // Album cover image
    const [albumTracks, setAlbumTracks] = useState([]);
    const router = useRouter();
    const { isAuthenticated, userRole, upgradeToCreator, isLoading, user } = useAuth(); // Add user to get avatar
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [selectedCreatorType, setSelectedCreatorType] = useState('artist');
    const [isUpgrading, setIsUpgrading] = useState(false); // State for upload process
    const [isUploading, setIsUploading] = useState(false);
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
        console.log('Upload page - isAuthenticated:', isAuthenticated);
        console.log('Upload page - userRole:', userRole);
        // Don't redirect while loading
        if (!isLoading && !isAuthenticated) {
            // If not authenticated, redirect to login
            console.log('Not authenticated, redirecting to login');
            router.push('/login');
        }
        else if (!isLoading && isAuthenticated && userRole !== 'creator') {
            // If authenticated but not a creator, show upgrade prompt
            console.log('Authenticated but not creator, showing upgrade prompt');
            setShowUpgradePrompt(true);
        }
    }, [isAuthenticated, userRole, router, isLoading]); // Add isLoading to dependency array
    // Show loading state while checking auth
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center", children: _jsx("div", { className: "text-white", children: "Loading..." }) }));
    }
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        }
        else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };
    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    // Handle successful audio upload
    const handleAudioUploadSuccess = (info) => {
        console.log('Audio uploaded successfully:', info);
        if (info.cdnUrl) {
            setAudioUrl(info.cdnUrl);
        }
    };
    // Handle successful cover image upload
    const handleCoverUploadSuccess = (info) => {
        console.log('Cover image uploaded successfully:', info);
        if (info.cdnUrl) {
            setCoverUrl(info.cdnUrl);
        }
    };
    // Handle successful album cover image upload
    const handleAlbumCoverUploadSuccess = (info) => {
        console.log('Album cover image uploaded successfully:', info);
        if (info.cdnUrl) {
            setAlbumCoverUrl(info.cdnUrl);
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
    // Album functions
    const addAlbumTrack = () => {
        setAlbumTracks(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                title: '',
                audioUrl: null,
                coverUrl: null,
                description: '',
                genre: 'afrobeat',
                type: 'song',
                releaseDate: new Date().toISOString().split('T')[0],
                collaborators: [],
                copyrightAccepted: true
            }
        ]);
    };
    const removeAlbumTrack = (id) => {
        setAlbumTracks(prev => prev.filter(track => track.id !== id));
    };
    const updateAlbumTrack = (id, field, value) => {
        setAlbumTracks(prev => prev.map(track => track.id === id ? Object.assign(Object.assign({}, track), { [field]: value }) : track));
    };
    const handleAlbumAudioUploadSuccess = (info, trackId) => {
        console.log('Album audio uploaded successfully:', info);
        if (info.cdnUrl) {
            updateAlbumTrack(trackId, 'audioUrl', info.cdnUrl);
        }
    };
    const handleAlbumTrackCoverUploadSuccess = (info, trackId) => {
        console.log('Album track cover uploaded successfully:', info);
        if (info.cdnUrl) {
            updateAlbumTrack(trackId, 'coverUrl', info.cdnUrl);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            if (isAlbumUpload) {
                // Handle album upload
                await handleAlbumUpload();
            }
            else {
                // Handle single track upload
                await handleSingleTrackUpload();
            }
        }
        catch (error) {
            console.error('Error uploading:', error);
            alert(`Error uploading: ${error.message || 'Unknown error'}`);
        }
        finally {
            setIsUploading(false);
        }
    };
    const handleSingleTrackUpload = async () => {
        // If no cover image is provided, use user's avatar
        let finalCoverUrl = coverUrl;
        if (!finalCoverUrl && (user === null || user === void 0 ? void 0 : user.avatar)) {
            finalCoverUrl = user.avatar;
        }
        // If we don't have an audio URL from UploadCare, we can't proceed
        if (!audioUrl) {
            alert('Please upload an audio file first');
            return;
        }
        console.log('Uploading:', { title, description, genre, type, paymentType, visibility, audioUrl, coverUrl: finalCoverUrl, releaseDate, collaborators, copyrightAccepted });
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
                type,
                paymentType,
                audioURL: audioUrl,
                coverURL: finalCoverUrl || '',
                releaseDate: releaseDate || new Date().toISOString(),
                collaborators: collaborators ? collaborators.split(',').map(c => c.trim()) : [],
                copyrightAccepted
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
                        type,
                        audioURL: audioUrl,
                        coverURL: finalCoverUrl || '',
                        releaseDate: releaseDate || new Date().toISOString(),
                        collaborators: collaborators ? collaborators.split(',').map(c => c.trim()) : [],
                        copyrightAccepted
                    })
                });
            }
            else {
                // Refresh failed, force logout
                alert('Session expired. Please log in again.');
                router.push('/login');
                return;
            }
        }
        if (!response.ok) {
            const errorData = await response.json();
            // Check if it's a WhatsApp requirement error for beats
            if (type === 'beat' && errorData.redirectToProfile) {
                if (confirm(`Beats require a WhatsApp contact number. Would you like to go to your profile to add your WhatsApp number?\n\nError: ${errorData.message}`)) {
                    // Redirect to profile page with WhatsApp tab active
                    router.push('/profile?tab=whatsapp');
                }
                return;
            }
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
    };
    const handleAlbumUpload = async () => {
        var _a;
        // Validate album
        if (!albumTitle.trim()) {
            alert('Please enter an album title');
            return;
        }
        if (albumTracks.length === 0) {
            alert('Please add at least one track to the album');
            return;
        }
        // Check if all tracks have audio files
        for (const track of albumTracks) {
            if (!track.audioUrl) {
                alert(`Please upload an audio file for track: ${track.title || 'Untitled'}`);
                return;
            }
        }
        // Upload each track and collect their IDs
        const uploadedTrackIds = [];
        for (const track of albumTracks) {
            // If no cover image is provided for this track, use album cover or user's avatar
            let finalCoverUrl = track.coverUrl || albumCoverUrl;
            if (!finalCoverUrl && (user === null || user === void 0 ? void 0 : user.avatar)) {
                finalCoverUrl = user.avatar;
            }
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
                    title: track.title.trim() || `${albumTitle} - Track ${albumTracks.indexOf(track) + 1}`,
                    description: track.description,
                    genre: track.genre,
                    type: track.type,
                    paymentType: paymentType,
                    audioURL: track.audioUrl,
                    coverURL: finalCoverUrl || '',
                    releaseDate: new Date().toISOString(),
                    collaborators: [],
                    copyrightAccepted: true
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
                            title: track.title.trim() || `${albumTitle} - Track ${albumTracks.indexOf(track) + 1}`,
                            description: track.description,
                            genre: track.genre,
                            type: track.type,
                            paymentType: paymentType,
                            audioURL: track.audioUrl,
                            coverURL: finalCoverUrl || '',
                            releaseDate: new Date().toISOString(),
                            collaborators: [],
                            copyrightAccepted: true
                        })
                    });
                }
                else {
                    // Refresh failed, force logout
                    alert('Session expired. Please log in again.');
                    router.push('/login');
                    return;
                }
            }
            if (!response.ok) {
                const errorData = await response.json();
                // Check if it's a WhatsApp requirement error for beats
                if (track.type === 'beat' && errorData.redirectToProfile) {
                    if (confirm(`Beats require a WhatsApp contact number. Would you like to go to your profile to add your WhatsApp number?\n\nError: ${errorData.message}`)) {
                        // Redirect to profile page with WhatsApp tab active
                        router.push('/profile?tab=whatsapp');
                    }
                    return;
                }
                throw new Error(`Failed to upload track "${track.title}": ${errorData.message || 'Unknown error'}`);
            }
            const result = await response.json();
            console.log('Track uploaded successfully:', result);
            uploadedTrackIds.push(result._id);
        }
        // Create the album with the uploaded track IDs
        try {
            const albumResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    title: albumTitle,
                    description: albumDescription,
                    genre: ((_a = albumTracks[0]) === null || _a === void 0 ? void 0 : _a.genre) || 'afrobeat',
                    coverURL: albumCoverUrl || '',
                    trackIds: uploadedTrackIds
                })
            });
            if (!albumResponse.ok) {
                const errorData = await albumResponse.json();
                throw new Error(errorData.message || 'Failed to create album');
            }
            const albumResult = await albumResponse.json();
            console.log('Album created successfully:', albumResult);
            // Reset form
            setAlbumTitle('');
            setAlbumDescription('');
            setAlbumCoverUrl(null);
            setAlbumTracks([]);
            alert('Album uploaded successfully!');
            router.push('/profile'); // Redirect to profile page
        }
        catch (error) {
            console.error('Error creating album:', error);
            alert(`Failed to create album: ${error.message}`);
        }
    };
    const handleUpgradeToCreator = async () => {
        setIsUpgrading(true);
        try {
            const success = await upgradeToCreator(selectedCreatorType);
            if (success) {
                // Successfully upgraded, hide the prompt and show the upload form
                setShowUpgradePrompt(false);
            }
            else {
                // Handle error case
                console.error('Failed to upgrade to creator');
            }
        }
        catch (error) {
            console.error('Error upgrading to creator:', error);
        }
        finally {
            setIsUpgrading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12", children: [_jsx("div", { className: "absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10" }), showUpgradePrompt && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto", children: _jsx("div", { className: "card-bg rounded-2xl p-4 sm:p-5 md:p-8 max-w-sm sm:max-w-md w-full border border-gray-700/50 shadow-2xl my-4 sm:my-8", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-[#FF4D67]/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4", children: _jsx("svg", { className: "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#FF4D67]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) }) }), _jsx("h2", { className: "text-base sm:text-lg md:text-2xl font-bold text-white mb-1 sm:mb-2 md:mb-3", children: "Become a Creator" }), _jsx("p", { className: "text-gray-400 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 md:mb-6", children: "You need to upgrade your account to upload music. Please select your creator type below." }), _jsx("div", { className: "grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6", children: ['artist', 'dj', 'producer'].map((type) => (_jsx("button", { type: "button", className: `py-1.5 sm:py-2 md:py-3 px-1 sm:px-2 rounded-lg text-xs sm:text-sm md:text-base font-medium transition-all ${selectedCreatorType === type
                                        ? 'bg-[#FF4D67] text-white'
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`, onClick: () => setSelectedCreatorType(type), children: type.charAt(0).toUpperCase() + type.slice(1) }, type))) }), _jsxs("div", { className: "flex flex-col gap-2 sm:gap-3", children: [_jsx("button", { onClick: handleUpgradeToCreator, disabled: isUpgrading, className: `w-full py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg text-white font-medium transition-opacity ${isUpgrading
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'gradient-primary hover:opacity-90'}`, children: isUpgrading ? 'Upgrading...' : 'Upgrade Account' }), _jsx("button", { onClick: () => router.push('/'), className: "w-full py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-medium hover:bg-gray-700/50 transition-colors", children: "Cancel" })] })] }) }) })), isAuthenticated && userRole === 'creator' && (_jsx("div", { className: "container mx-auto px-4 sm:px-8", children: _jsxs("div", { className: "max-w-3xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8 sm:mb-12", children: [_jsx("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4", children: "Upload Your Music" }), _jsx("p", { className: "text-gray-400 text-sm sm:text-base max-w-2xl mx-auto", children: "Share your creations with the world. Upload your tracks and connect with fans across Rwanda and beyond." })] }), _jsx("div", { className: "card-bg rounded-2xl p-5 sm:p-6 mb-6", children: _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { onClick: () => setIsAlbumUpload(false), className: `px-4 py-2 rounded-lg font-medium transition-all ${!isAlbumUpload
                                            ? 'bg-[#FF4D67] text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`, children: "Single Track" }), _jsx("button", { onClick: () => setIsAlbumUpload(true), className: `px-4 py-2 rounded-lg font-medium transition-all ${isAlbumUpload
                                            ? 'bg-[#FF4D67] text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`, children: "Album" })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6 sm:space-y-8", children: [!isAlbumUpload ? (
                                // Single Track Upload Form
                                _jsxs(_Fragment, { children: [_jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6", children: [_jsx("h2", { className: "text-lg sm:text-xl font-medium text-white mb-4", children: "Audio File" }), !audioUrl ? (_jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE", onFileUploadSuccess: handleAudioUploadSuccess, multiple: false, className: "my-config" })) : (_jsxs("div", { className: "p-4 bg-green-900/30 border border-green-700 rounded-lg", children: [_jsx("p", { className: "text-green-400", children: "Audio uploaded successfully!" }), _jsxs("p", { className: "text-sm text-gray-400 mt-1", children: ["File: ", audioUrl.split('/').pop()] })] }))] }), _jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6", children: [_jsx("h2", { className: "text-lg sm:text-xl font-medium text-white mb-4", children: "Cover Image" }), !coverUrl ? (_jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE", onFileUploadSuccess: handleCoverUploadSuccess, multiple: false, className: "my-config" })) : (_jsxs("div", { className: "p-4 bg-green-900/30 border border-green-700 rounded-lg", children: [_jsx("p", { className: "text-green-400", children: "Cover image uploaded successfully!" }), _jsx("img", { src: coverUrl, alt: "Cover", className: "mt-2 w-32 h-32 object-cover rounded-lg" })] })), !coverUrl && (user === null || user === void 0 ? void 0 : user.avatar) && (_jsx("div", { className: "mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg", children: _jsx("p", { className: "text-blue-400 text-sm", children: "If you don't upload a cover image, your profile avatar will be used as the track cover." }) }))] }), _jsxs("div", { className: "space-y-5 sm:space-y-6 card-bg rounded-2xl p-5 sm:p-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-300 mb-2", children: "Track Title" }), _jsx("input", { type: "text", id: "title", value: title, onChange: (e) => setTitle(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", placeholder: "Enter track title", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-300 mb-2", children: "Description" }), _jsx("textarea", { id: "description", rows: 3, value: description, onChange: (e) => setDescription(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", placeholder: "Tell us about your track..." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "genre", className: "block text-sm font-medium text-gray-300 mb-2", children: "Genre" }), _jsx("select", { id: "genre", value: genre, onChange: (e) => setGenre(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", children: genres.map(genreOption => (_jsx("option", { value: genreOption, children: genreOption.charAt(0).toUpperCase() + genreOption.slice(1) }, genreOption))) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "type", className: "block text-sm font-medium text-gray-300 mb-2", children: "Type" }), _jsxs("select", { id: "type", value: type, onChange: (e) => setType(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", children: [_jsx("option", { value: "song", children: "Song" }), _jsx("option", { value: "beat", children: "Beat" }), _jsx("option", { value: "mix", children: "Mix" })] })] }), type === 'beat' && (_jsxs("div", { children: [_jsx("label", { htmlFor: "paymentType", className: "block text-sm font-medium text-gray-300 mb-2", children: "Payment Type" }), _jsxs("select", { id: "paymentType", value: paymentType, onChange: (e) => setPaymentType(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", children: [_jsx("option", { value: "free", children: "Free" }), _jsx("option", { value: "paid", children: "Paid" })] }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: paymentType === 'paid'
                                                                        ? 'Users will contact you via WhatsApp to obtain this beat'
                                                                        : 'Users can download this beat for free' })] }))] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "releaseDate", className: "block text-sm font-medium text-gray-300 mb-2", children: "Release Date" }), _jsx("input", { type: "date", id: "releaseDate", value: releaseDate, onChange: (e) => setReleaseDate(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { htmlFor: "visibility", className: "block text-sm font-medium text-gray-300 mb-2", children: "Visibility" }), _jsxs("select", { id: "visibility", value: visibility, onChange: (e) => setVisibility(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", children: [_jsx("option", { value: "public", children: "Public" }), _jsx("option", { value: "fans", children: "Fans Only" }), _jsx("option", { value: "private", children: "Private" })] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "collaborators", className: "block text-sm font-medium text-gray-300 mb-2", children: "Collaborators (comma separated)" }), _jsx("input", { type: "text", id: "collaborators", value: collaborators, onChange: (e) => setCollaborators(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", placeholder: "e.g., Producer: John Doe, Featuring: Jane Smith" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Enter collaborators with their roles (optional)" })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex items-center h-5", children: _jsx("input", { id: "copyrightAccepted", type: "checkbox", checked: copyrightAccepted, onChange: (e) => setCopyrightAccepted(e.target.checked), required: true, className: "w-4 h-4 text-[#FF4D67] bg-gray-800 border-gray-700 rounded focus:ring-[#FF4D67] focus:ring-2" }) }), _jsxs("div", { className: "ml-3 text-sm", children: [_jsx("label", { htmlFor: "copyrightAccepted", className: "font-medium text-gray-300", children: "I accept the copyright policy" }), _jsx("p", { className: "text-gray-500", children: "I confirm that this content is my original work and I have the rights to upload it." })] })] })] })] })) : (
                                // Album Upload Form
                                _jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-5 sm:space-y-6 card-bg rounded-2xl p-5 sm:p-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "albumTitle", className: "block text-sm font-medium text-gray-300 mb-2", children: "Album Title" }), _jsx("input", { type: "text", id: "albumTitle", value: albumTitle, onChange: (e) => setAlbumTitle(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", placeholder: "Enter album title", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "albumDescription", className: "block text-sm font-medium text-gray-300 mb-2", children: "Album Description" }), _jsx("textarea", { id: "albumDescription", rows: 3, value: albumDescription, onChange: (e) => setAlbumDescription(e.target.value), className: "w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base", placeholder: "Tell us about your album..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Album Cover Image" }), !albumCoverUrl ? (_jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE", onFileUploadSuccess: handleAlbumCoverUploadSuccess, multiple: false, className: "my-config" })) : (_jsxs("div", { className: "p-4 bg-green-900/30 border border-green-700 rounded-lg", children: [_jsx("p", { className: "text-green-400", children: "Album cover uploaded successfully!" }), _jsx("img", { src: albumCoverUrl, alt: "Album Cover", className: "mt-2 w-32 h-32 object-cover rounded-lg" })] })), !albumCoverUrl && (user === null || user === void 0 ? void 0 : user.avatar) && (_jsx("div", { className: "mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg", children: _jsx("p", { className: "text-blue-400 text-sm", children: "If you don't upload an album cover, your profile avatar will be used as the default cover for tracks." }) }))] })] }), _jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg sm:text-xl font-medium text-white", children: "Album Tracks" }), _jsx("button", { type: "button", onClick: addAlbumTrack, className: "px-3 py-1 bg-[#FF4D67] text-white rounded-lg hover:bg-[#FF4D67]/80 transition-colors text-sm", children: "Add Track" })] }), albumTracks.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-400", children: "No tracks added yet. Click \"Add Track\" to start adding tracks to your album." })) : (_jsx("div", { className: "space-y-6", children: albumTracks.map((track, index) => (_jsxs("div", { className: "border border-gray-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsxs("h3", { className: "text-white font-medium", children: ["Track ", index + 1] }), _jsx("button", { type: "button", onClick: () => removeAlbumTrack(track.id), className: "text-red-500 hover:text-red-400", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-gray-300 text-sm mb-2", children: "Audio File" }), !track.audioUrl ? (_jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE", onFileUploadSuccess: (info) => handleAlbumAudioUploadSuccess(info, track.id), multiple: false, className: "my-config" })) : (_jsx("div", { className: "p-2 bg-green-900/30 border border-green-700 rounded-lg", children: _jsx("p", { className: "text-green-400 text-sm", children: "Audio uploaded successfully!" }) }))] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-gray-300 text-sm mb-2", children: "Track Cover Image (Optional)" }), !track.coverUrl ? (_jsx(FileUploaderRegular, { pubkey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "YOUR_PUBLIC_KEY_HERE", onFileUploadSuccess: (info) => handleAlbumTrackCoverUploadSuccess(info, track.id), multiple: false, className: "my-config" })) : (_jsxs("div", { className: "p-2 bg-green-900/30 border border-green-700 rounded-lg", children: [_jsx("p", { className: "text-green-400 text-sm", children: "Cover uploaded successfully!" }), _jsx("img", { src: track.coverUrl, alt: "Track Cover", className: "mt-2 w-16 h-16 object-cover rounded" })] }))] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 text-xs mb-1", children: "Track Title" }), _jsx("input", { type: "text", value: track.title, onChange: (e) => updateAlbumTrack(track.id, 'title', e.target.value), className: "w-full px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-white text-sm", placeholder: "Enter track title" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 text-xs mb-1", children: "Description" }), _jsx("textarea", { value: track.description, onChange: (e) => updateAlbumTrack(track.id, 'description', e.target.value), className: "w-full px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-white text-sm", placeholder: "Track description", rows: 2 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 text-xs mb-1", children: "Genre" }), _jsx("select", { value: track.genre, onChange: (e) => updateAlbumTrack(track.id, 'genre', e.target.value), className: "w-full px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-white text-sm", children: genres.map(genreOption => (_jsx("option", { value: genreOption, children: genreOption.charAt(0).toUpperCase() + genreOption.slice(1) }, genreOption))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 text-xs mb-1", children: "Type" }), _jsxs("select", { value: track.type, onChange: (e) => updateAlbumTrack(track.id, 'type', e.target.value), className: "w-full px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-white text-sm", children: [_jsx("option", { value: "song", children: "Song" }), _jsx("option", { value: "beat", children: "Beat" }), _jsx("option", { value: "mix", children: "Mix" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 text-xs mb-1", children: "Release Date" }), _jsx("input", { type: "date", value: track.releaseDate || '', onChange: (e) => updateAlbumTrack(track.id, 'releaseDate', e.target.value), className: "w-full px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-white text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 text-xs mb-1", children: "Collaborators" }), _jsx("input", { type: "text", value: track.collaborators ? track.collaborators.join(', ') : '', onChange: (e) => {
                                                                                    const collabArray = e.target.value ? e.target.value.split(',').map(c => c.trim()) : [];
                                                                                    updateAlbumTrack(track.id, 'collaborators', collabArray);
                                                                                }, className: "w-full px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-white text-sm", placeholder: "e.g., Producer: John Doe, Featuring: Jane Smith" })] }), _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "flex items-center h-4", children: _jsx("input", { type: "checkbox", checked: track.copyrightAccepted || false, onChange: (e) => updateAlbumTrack(track.id, 'copyrightAccepted', e.target.checked), className: "w-3 h-3 text-[#FF4D67] bg-gray-800 border-gray-700 rounded focus:ring-[#FF4D67] focus:ring-2" }) }), _jsx("div", { className: "ml-2 text-xs", children: _jsx("label", { className: "font-medium text-gray-300", children: "I accept the copyright policy" }) })] })] })] }, track.id))) }))] })] })), _jsxs("div", { className: "card-bg rounded-2xl p-5 sm:p-6 border-l-4 border-[#FFCB2B]", children: [_jsxs("h3", { className: "font-medium text-white mb-2 flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4 sm:w-5 sm:h-5 text-[#FFCB2B]", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }), "Upload Tips"] }), _jsxs("ul", { className: "text-xs sm:text-sm text-gray-400 space-y-1", children: [_jsx("li", { children: "\u2022 High quality audio files (320kbps MP3 or lossless) sound best" }), _jsx("li", { children: "\u2022 Add detailed descriptions to help fans discover your music" }), _jsx("li", { children: "\u2022 Use relevant hashtags to increase visibility" }), _jsx("li", { children: "\u2022 Consider uploading artwork for a professional look" })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: isUploading || (!isAlbumUpload && !audioUrl) || (isAlbumUpload && albumTracks.length === 0), className: `px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-all ${!isUploading && ((isAlbumUpload && albumTracks.length > 0) || (!isAlbumUpload && audioUrl))
                                            ? 'gradient-primary text-white hover:opacity-90'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'} text-sm sm:text-base`, children: isUploading ? (isAlbumUpload ? 'Uploading Album...' : 'Uploading Track...') : (isAlbumUpload ? 'Upload Album' : 'Upload Track') }) })] })] }) }))] }));
}
