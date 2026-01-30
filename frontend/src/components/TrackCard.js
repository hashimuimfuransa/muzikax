import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import AddToQueueButton from './AddToQueueButton';
export default function TrackCard({ track, fullTrackData, showPlayButton = true, showLikeButton = true, showAddToQueueButton = true }) {
    var _a;
    const { currentTrack, isPlaying, playTrack, setCurrentPlaylist, favorites, addToFavorites, removeFromFavorites } = useAudioPlayer();
    const handlePlay = () => {
        if (fullTrackData && fullTrackData.audioURL) {
            playTrack({
                id: track.id,
                title: track.title,
                artist: track.artist,
                coverImage: track.coverImage,
                audioUrl: fullTrackData.audioURL,
                creatorId: typeof fullTrackData.creatorId === 'object' && fullTrackData.creatorId !== null
                    ? fullTrackData.creatorId._id
                    : fullTrackData.creatorId,
                type: fullTrackData.type,
                creatorWhatsapp: (typeof fullTrackData.creatorId === 'object' && fullTrackData.creatorId !== null
                    ? fullTrackData.creatorId.whatsappContact
                    : undefined)
            });
            // Set the current playlist to tracks from this section
            // We'll use the current track data for now
            const playlistTracks = [fullTrackData].filter((t) => t.audioURL).map((t) => ({
                id: t._id,
                title: t.title,
                artist: typeof t.creatorId === "object" && t.creatorId !== null
                    ? t.creatorId.name
                    : "Unknown Artist",
                coverImage: t.coverURL || '',
                audioUrl: t.audioURL,
                creatorId: typeof t.creatorId === 'object' && t.creatorId !== null
                    ? t.creatorId._id
                    : t.creatorId,
                type: t.type,
                creatorWhatsapp: (typeof t.creatorId === 'object' && t.creatorId !== null
                    ? t.creatorId.whatsappContact
                    : undefined)
            }));
            setCurrentPlaylist(playlistTracks);
        }
    };
    const toggleFavorite = () => {
        if (fullTrackData) {
            const isFavorite = favorites.some(fav => fav.id === track.id);
            if (isFavorite) {
                removeFromFavorites(track.id);
            }
            else {
                addToFavorites({
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    coverImage: track.coverImage || '',
                    audioUrl: track.audioUrl || '',
                    creatorId: track.creatorId,
                    type: track.type,
                    creatorWhatsapp: track.creatorWhatsapp
                });
            }
        }
    };
    const isFavorite = favorites.some(fav => fav.id === track.id);
    return (_jsxs("div", { className: "flex-shrink-0 w-40 sm:w-44 md:w-44 lg:w-48 group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10", children: [_jsxs("div", { className: "relative", children: [track.coverImage && track.coverImage.trim() !== '' ? (_jsx("img", { src: track.coverImage, alt: track.title, className: "w-full aspect-square object-cover" })) : (_jsx("div", { className: "w-full aspect-square bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center", children: _jsx("svg", { className: "w-8 h-8 text-white", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" }) }) })), showPlayButton && (_jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2", children: [_jsx("button", { onClick: handlePlay, className: "w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300", children: (currentTrack === null || currentTrack === void 0 ? void 0 : currentTrack.id) === track.id && isPlaying ? (_jsx("svg", { className: "w-4 h-4 sm:w-5 sm:h-5", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) })) : (_jsx("svg", { className: "w-4 h-4 sm:w-5 sm:h-5", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" }) })) }), showLikeButton && (_jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    toggleFavorite();
                                }, className: "w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110", children: _jsx("svg", { className: `w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${isFavorite ? 'text-red-500 fill-current scale-110' : 'stroke-current'}`, fill: isFavorite ? "currentColor" : "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }) }) })), showAddToQueueButton && (_jsx(AddToQueueButton, { track: {
                                    id: track.id,
                                    title: track.title,
                                    artist: track.artist,
                                    coverImage: track.coverImage || '',
                                    audioUrl: track.audioUrl || '',
                                    duration: track.duration ? (track.duration.includes(':') ?
                                        (() => {
                                            const [mins, secs] = track.duration.split(':').map(Number);
                                            return mins * 60 + secs;
                                        })() : Number(track.duration)) : undefined,
                                    creatorId: track.creatorId,
                                    type: track.type,
                                    creatorWhatsapp: track.creatorWhatsapp
                                }, size: "sm", variant: "secondary", className: "opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75" }))] }))] }), _jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-start justify-between mb-1", children: [_jsx("h3", { className: "font-bold text-white text-sm sm:text-base truncate flex-1", children: track.title }), track.type === 'beat' && (_jsx("span", { className: "ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full whitespace-nowrap", children: "BEAT" }))] }), _jsx("p", { className: "text-gray-400 text-xs sm:text-sm truncate", children: track.artist }), track.type === 'beat' && (_jsx("div", { className: "mt-2", children: _jsx("span", { className: `inline-block px-2 py-1 text-xs rounded-full ${track.paymentType === 'paid' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`, children: track.paymentType === 'paid' ? 'PAID BEAT' : 'FREE BEAT' }) })), track.type === 'beat' && (_jsx("div", { className: "mt-2", children: track.paymentType === 'paid' ? (_jsxs("button", { onClick: (e) => {
                                e.stopPropagation();
                                // Open WhatsApp with pre-filled message
                                const message = `Hi, I'm interested in your beat "${track.title}" that I found on MuzikaX.`;
                                window.open(`https://wa.me/${track.creatorWhatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                            }, className: "w-full py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs flex items-center justify-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" }) }), "WhatsApp"] })) : (_jsxs("button", { onClick: (e) => {
                                e.stopPropagation();
                                // Download free beat immediately
                                if (fullTrackData && fullTrackData.audioURL) {
                                    // Create temporary link for download
                                    const link = document.createElement('a');
                                    link.href = fullTrackData.audioURL;
                                    link.download = `${track.title}.mp3`;
                                    link.target = '_blank';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }
                                else {
                                    alert('Download link not available');
                                }
                            }, className: "w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs flex items-center justify-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }) }), "Download"] })) })), _jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-2", children: [_jsxs("span", { children: [((_a = track.plays) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || '0', " plays"] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z", clipRule: "evenodd" }) }), _jsx("span", { children: track.likes || 0 })] })] })] })] }));
}
