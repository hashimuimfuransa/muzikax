'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function Explore() {
    const [activeTab, setActiveTab] = useState('tracks');
    // Mock data
    const tracks = [
        {
            id: '1',
            title: 'Rwandan Vibes',
            artist: 'Kizito M',
            plays: 12400,
            likes: 890,
            coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
        },
        {
            id: '2',
            title: 'Mountain Echoes',
            artist: 'Divine Ikirezi',
            plays: 9800,
            likes: 756,
            coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
        },
        {
            id: '3',
            title: 'City Lights',
            artist: 'Benji Flavours',
            plays: 15600,
            likes: 1200,
            coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
        }
    ];
    const creators = [
        {
            id: '1',
            name: 'Kizito M',
            type: 'Artist',
            followers: 12500,
            avatar: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
        },
        {
            id: '2',
            name: 'Divine Ikirezi',
            type: 'Producer',
            followers: 8900,
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
        },
        {
            id: '3',
            name: 'Benji Flavours',
            type: 'DJ',
            followers: 15600,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black", children: [_jsxs("div", { className: "relative py-8 sm:py-12 lg:py-16 overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center", style: { backgroundImage: 'url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' } }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60" })] }), _jsx("div", { className: "absolute -top-20 -left-20 w-64 h-64 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "absolute -bottom-20 -right-20 w-64 h-64 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "container mx-auto px-4 sm:px-8 relative z-10", children: _jsxs("div", { className: "max-w-3xl mx-auto text-center", children: [_jsx("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] mb-3 sm:mb-4", children: "Explore Rwandan Music" }), _jsx("p", { className: "text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8", children: "Discover trending tracks and talented creators from Rwanda's vibrant music scene" }), _jsxs("div", { className: "relative max-w-xl mx-auto", children: [_jsx("input", { type: "text", placeholder: "Search tracks, artists, albums...", className: "w-full py-2.5 sm:py-3 px-4 sm:px-6 pl-10 sm:pl-12 bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D67] focus:border-transparent transition-all text-sm sm:text-base shadow-lg" }), _jsx("div", { className: "absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400", children: _jsx("svg", { className: "w-4 h-4 sm:w-5 sm:h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) })] })] }) })] }), _jsxs("div", { className: "container mx-auto px-4 sm:px-8 py-12 sm:py-16 md:py-20 pb-32 flex-1", children: [_jsxs("div", { className: "flex border-b border-gray-800 mb-8 sm:mb-10", children: [_jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${activeTab === 'tracks'
                                    ? 'text-[#FF4D67] border-b-2 border-[#FF4D67]'
                                    : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('tracks'), children: "Trending Tracks" }), _jsx("button", { className: `py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${activeTab === 'creators'
                                    ? 'text-[#FFCB2B] border-b-2 border-[#FFCB2B]'
                                    : 'text-gray-500 hover:text-gray-300'}`, onClick: () => setActiveTab('creators'), children: "Top Creators" })] }), activeTab === 'tracks' && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8", children: tracks.map((track) => (_jsxs("div", { className: "group card-bg rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: track.coverImage, alt: track.title, className: "w-full h-40 sm:h-48 md:h-56 object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: _jsx("button", { className: "w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300", children: _jsx("svg", { className: "w-5 h-5 sm:w-6 sm:h-6", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" }) }) }) }), _jsx("div", { className: "absolute top-2 right-2 sm:top-3 sm:right-3", children: _jsx("button", { className: "p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx("svg", { className: "w-4 h-4 sm:w-5 sm:h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" }) }) }) })] }), _jsxs("div", { className: "p-4 sm:p-5", children: [_jsx("h3", { className: "font-bold text-white text-lg mb-1 truncate", children: track.title }), _jsx("p", { className: "text-gray-400 text-sm sm:text-base mb-3 sm:mb-4", children: track.artist }), _jsxs("div", { className: "flex justify-between text-xs sm:text-sm text-gray-500", children: [_jsxs("span", { children: [track.plays.toLocaleString(), " plays"] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3 sm:w-4 sm:h-4", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { fillRule: "evenodd", d: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z", clipRule: "evenodd" }) }), _jsx("span", { children: track.likes })] })] })] })] }, track.id))) })), activeTab === 'creators' && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8", children: creators.map((creator) => (_jsxs("div", { className: "group card-bg rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[#FFCB2B]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FFCB2B]/10", children: [_jsxs("div", { className: "flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: creator.avatar, alt: creator.name, className: "w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" }), _jsx("div", { className: "absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#FF4D67] border-2 border-gray-900" })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-white text-base sm:text-lg", children: creator.name }), _jsx("p", { className: "text-[#FFCB2B] text-xs sm:text-sm", children: creator.type })] })] }), _jsx("p", { className: "text-gray-400 text-xs sm:text-sm mb-4 sm:mb-5", children: "Creating amazing music that resonates with the heart of Rwanda. Join thousands of fans enjoying their work." }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-500 text-xs sm:text-sm", children: [creator.followers.toLocaleString(), " followers"] }), _jsx("button", { className: "px-3 py-1.5 sm:px-4 sm:py-2 bg-transparent border border-[#FFCB2B] text-[#FFCB2B] hover:bg-[#FFCB2B]/10 rounded-full text-xs sm:text-sm font-medium transition-colors", children: "Follow" })] })] }, creator.id))) }))] })] }));
}
