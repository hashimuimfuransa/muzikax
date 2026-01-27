'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
export default function AdminDashboard() {
    const [timeRange, setTimeRange] = useState('30d');
    const router = useRouter();
    const { isAuthenticated, userRole } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [authChecked, setAuthChecked] = useState(false);
    // Check authentication and role on component mount
    useEffect(() => {
        // Small delay to ensure AuthContext has time to initialize
        const timer = setTimeout(() => {
            setAuthChecked(true);
            if (!isAuthenticated) {
                // If not authenticated, redirect to login
                router.push('/login');
            }
            else if (userRole !== 'admin') {
                // If authenticated but not an admin, redirect to home
                router.push('/');
            }
            else {
                // Fetch admin data
                fetchAdminData();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [isAuthenticated, userRole, router]);
    const fetchAdminData = async () => {
        try {
            setLoading(true);
            // Fetch analytics data
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }
            const data = await response.json();
            setAnalytics(data);
            setLoading(false);
        }
        catch (err) {
            console.error('Error fetching admin data:', err);
            setError('Failed to fetch data');
            setLoading(false);
        }
    };
    // Don't render the dashboard until auth check is complete
    if (!authChecked) {
        return (_jsx("div", { className: "flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]" }) }));
    }
    // Don't render the dashboard if not authenticated or not authorized
    if (!isAuthenticated || userRole !== 'admin') {
        return null;
    }
    // Stats data based on real analytics
    const stats = analytics ? [
        { title: 'Total Users', value: analytics.totalUsers.toString(), change: '+12%', icon: 'users', color: 'from-[#FF4D67] to-[#FF4D67]' },
        { title: 'Active Creators', value: analytics.totalCreators.toString(), change: '+8%', icon: 'creator', color: 'from-[#FFCB2B] to-[#FFCB2B]' },
        { title: 'Total Tracks', value: analytics.totalTracks.toString(), change: '+15%', icon: 'music', color: 'from-[#6366F1] to-[#6366F1]' },
        { title: 'Total Plays', value: analytics.totalPlays.toLocaleString(), change: '+18%', icon: 'play', color: 'from-[#10B981] to-[#10B981]' }
    ] : [];
    return (_jsxs("div", { className: "flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black", children: [_jsx(AdminSidebar, {}), _jsxs("main", { className: "flex-1 flex flex-col w-full min-h-screen md:ml-64", children: [_jsx("div", { className: "absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10" }), _jsxs("div", { className: "container mx-auto px-4 sm:px-8 py-6 sm:py-8", children: [_jsxs("div", { className: "mb-6 sm:mb-8", children: [_jsx("h1", { className: "text-xl sm:text-2xl md:text-3xl font-bold text-white", children: "Admin Dashboard" }), _jsx("p", { className: "text-gray-400 text-sm sm:text-base", children: "Manage platform users and monitor system performance" })] }), _jsx("div", { className: "flex justify-end mb-6 sm:mb-8", children: _jsx("div", { className: "inline-flex rounded-lg bg-gray-800/50 p-1", children: ['7d', '30d', '90d', '1y'].map((range) => (_jsx("button", { type: "button", className: `px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${timeRange === range
                                            ? 'bg-[#FF4D67] text-white'
                                            : 'text-gray-400 hover:text-white'}`, onClick: () => setTimeRange(range), children: range }, range))) }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8", children: stats.map((stat, index) => (_jsx("div", { className: "card-bg rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-xs sm:text-sm mb-1", children: stat.title }), _jsx("p", { className: "text-xl sm:text-2xl font-bold text-white", children: stat.value }), _jsxs("p", { className: "text-xs sm:text-sm text-green-500 mt-1", children: [stat.change, " from last period"] })] }), _jsx("div", { className: `w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`, children: _jsxs("div", { className: "text-white", children: [stat.icon === 'users' && (_jsx("svg", { className: "w-5 h-5 sm:w-6 sm:h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }) })), stat.icon === 'creator' && (_jsx("svg", { className: "w-5 h-5 sm:w-6 sm:h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) })), stat.icon === 'music' && (_jsx("svg", { className: "w-5 h-5 sm:w-6 sm:h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" }) })), stat.icon === 'play' && (_jsxs("svg", { className: "w-5 h-5 sm:w-6 sm:h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })] }))] }) })] }) }, index))) }), _jsxs("div", { className: "card-bg rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-4 sm:mb-6", children: [_jsx("h2", { className: "text-lg sm:text-xl font-bold text-white", children: "Recent Users" }), _jsx("button", { onClick: () => router.push('/admin/users'), className: "text-xs sm:text-sm text-[#FF4D67] hover:text-[#FF4D67]/80 transition-colors", children: "View All Users" })] }), loading ? (_jsx("div", { className: "flex justify-center items-center h-32", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]" }) })) : error ? (_jsx("div", { className: "text-red-500 text-center py-4", children: error })) : analytics ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500 text-xs sm:text-sm border-b border-gray-800", children: [_jsx("th", { className: "pb-3 font-normal", children: "User" }), _jsx("th", { className: "pb-3 font-normal", children: "Role" }), _jsx("th", { className: "pb-3 font-normal", children: "Status" }), _jsx("th", { className: "pb-3 font-normal", children: "Joined" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-800", children: analytics.recentUsers.map((user) => (_jsxs("tr", { className: "hover:bg-gray-800/30 transition-colors", children: [_jsxs("td", { className: "py-3 sm:py-4", children: [_jsx("div", { className: "font-medium text-white text-sm sm:text-base", children: user.name }), _jsx("div", { className: "text-gray-400 text-xs sm:text-sm", children: user.email })] }), _jsx("td", { className: "py-3 sm:py-4", children: _jsxs("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                                        ? 'bg-purple-500/20 text-purple-400'
                                                                        : user.role === 'creator'
                                                                            ? 'bg-blue-500/20 text-blue-400'
                                                                            : 'bg-gray-500/20 text-gray-400'}`, children: [user.role, user.creatorType && ` (${user.creatorType})`] }) }), _jsx("td", { className: "py-3 sm:py-4", children: _jsx("span", { className: "px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400", children: "Active" }) }), _jsx("td", { className: "py-3 sm:py-4 text-gray-400 text-sm", children: new Date(user.createdAt).toLocaleDateString() })] }, user.id))) })] }) })) : null] }), _jsxs("div", { className: "card-bg rounded-2xl p-4 sm:p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4 sm:mb-6", children: [_jsx("h2", { className: "text-lg sm:text-xl font-bold text-white", children: "Trending Tracks" }), _jsx("button", { onClick: () => router.push('/admin/content'), className: "text-xs sm:text-sm text-[#FF4D67] hover:text-[#FF4D67]/80 transition-colors", children: "View All Content" })] }), loading ? (_jsx("div", { className: "flex justify-center items-center h-32", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D67]" }) })) : error ? (_jsx("div", { className: "text-red-500 text-center py-4", children: error })) : analytics ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500 text-xs sm:text-sm border-b border-gray-800", children: [_jsx("th", { className: "pb-3 font-normal", children: "Track" }), _jsx("th", { className: "pb-3 font-normal", children: "Creator" }), _jsx("th", { className: "pb-3 font-normal", children: "Plays" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-800", children: analytics.trendingTracks.map((track) => {
                                                        var _a;
                                                        return (_jsxs("tr", { className: "hover:bg-gray-800/30 transition-colors", children: [_jsx("td", { className: "py-3 sm:py-4", children: _jsx("div", { className: "font-medium text-white text-sm sm:text-base", children: track.title }) }), _jsx("td", { className: "py-3 sm:py-4 text-gray-400 text-sm", children: ((_a = track.creatorId) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown' }), _jsx("td", { className: "py-3 sm:py-4 text-gray-400 text-sm", children: track.plays.toLocaleString() })] }, track.id));
                                                    }) })] }) })) : null] })] })] })] }));
}
