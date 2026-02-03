'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import AdminSidebar from '../../../components/AdminSidebar';
export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
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
                fetchUsers();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [isAuthenticated, userRole, router, currentPage, searchQuery, roleFilter]);
    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('limit', '10');
            if (searchQuery) {
                params.append('query', searchQuery);
            }
            if (roleFilter !== 'all') {
                params.append('role', roleFilter);
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/search?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data.users);
            setFilteredUsers(data.users);
            setTotalPages(data.pages);
            setLoading(false);
        }
        catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
            setLoading(false);
        }
    };
    const handleDeleteUser = async () => {
        if (!userToDelete)
            return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            // Refresh the user list
            fetchUsers();
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
        catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user');
        }
    };
    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };
    // Don't render the page until auth check is complete
    if (!authChecked) {
        return (_jsx("div", { className: "flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]" }) }));
    }
    // Don't render the page if not authenticated or not authorized
    if (!isAuthenticated || userRole !== 'admin') {
        return null;
    }
    return (_jsxs("div", { className: "flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black", children: [_jsx(AdminSidebar, {}), _jsxs("main", { className: "flex-1 flex flex-col w-full min-h-screen md:ml-64", children: [_jsx("div", { className: "absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10" }), _jsxs("div", { className: "container mx-auto px-4 sm:px-8 py-6 sm:py-8", children: [_jsxs("div", { className: "mb-6 sm:mb-8", children: [_jsx("h1", { className: "text-xl sm:text-2xl md:text-3xl font-bold text-white", children: "User Management" }), _jsx("p", { className: "text-gray-400 text-sm sm:text-base", children: "Manage platform users and their roles" })] }), _jsx("div", { className: "card-bg rounded-2xl p-4 sm:p-6 mb-6", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "search", className: "block text-sm font-medium text-gray-400 mb-1", children: "Search Users" }), _jsx("input", { type: "text", id: "search", placeholder: "Search by name or email...", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "role-filter", className: "block text-sm font-medium text-gray-400 mb-1", children: "Filter by Role" }), _jsxs("select", { id: "role-filter", className: "px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Roles" }), _jsx("option", { value: "fan", children: "Fan" }), _jsx("option", { value: "creator", children: "Creator" }), _jsx("option", { value: "admin", children: "Admin" })] })] })] }) }), _jsx("div", { className: "card-bg rounded-2xl p-4 sm:p-6", children: loading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]" }) })) : error ? (_jsx("div", { className: "text-red-500 text-center py-8", children: error })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500 text-sm border-b border-gray-800", children: [_jsx("th", { className: "pb-4 font-normal", children: "User" }), _jsx("th", { className: "pb-4 font-normal", children: "Email" }), _jsx("th", { className: "pb-4 font-normal", children: "Role" }), _jsx("th", { className: "pb-4 font-normal", children: "Joined" }), _jsx("th", { className: "pb-4 font-normal", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-800", children: filteredUsers.map((user) => (_jsxs("tr", { className: "hover:bg-gray-800/30 transition-colors", children: [_jsx("td", { className: "py-4", children: _jsx("div", { className: "font-medium text-white", children: user.name }) }), _jsx("td", { className: "py-4 text-gray-400", children: user.email }), _jsx("td", { className: "py-4", children: _jsxs("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                                            ? 'bg-purple-500/20 text-purple-400'
                                                                            : user.role === 'creator'
                                                                                ? 'bg-blue-500/20 text-blue-400'
                                                                                : 'bg-gray-500/20 text-gray-400'}`, children: [user.role, user.creatorType && ` (${user.creatorType})`] }) }), _jsx("td", { className: "py-4 text-gray-400", children: new Date(user.createdAt).toLocaleDateString() }), _jsx("td", { className: "py-4", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => router.push(`/admin/users/${user.id}`), className: "px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors", children: "Edit" }), user.role !== 'admin' && (_jsx("button", { onClick: () => openDeleteModal(user), className: "px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors", children: "Delete" }))] }) })] }, user.id))) })] }) }), totalPages > 1 && (_jsxs("div", { className: "flex justify-between items-center mt-6 pt-4 border-t border-gray-800", children: [_jsx("button", { onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)), disabled: currentPage === 1, className: `px-4 py-2 rounded-lg ${currentPage === 1
                                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`, children: "Previous" }), _jsxs("div", { className: "text-gray-400 text-sm", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, className: `px-4 py-2 rounded-lg ${currentPage === totalPages
                                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-700 hover:bg-gray-600 text-white'}`, children: "Next" })] }))] })) })] })] }), showDeleteModal && userToDelete && (_jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "card-bg rounded-2xl p-6 max-w-md w-full", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "Confirm Deletion" }), _jsxs("p", { className: "text-gray-400 mb-6", children: ["Are you sure you want to delete user ", _jsx("span", { className: "text-white font-semibold", children: userToDelete.name }), "? This action cannot be undone and will permanently remove all user data."] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: closeDeleteModal, className: "px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleDeleteUser, className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors", children: "Delete User" })] })] }) }))] }));
}
