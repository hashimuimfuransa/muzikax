'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ReportDetailsModal from '../../../components/ReportDetailsModal';
export default function AdminReportsPage() {
    const { isAuthenticated, userRole, isLoading } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [filters, setFilters] = useState({
        status: '',
        reason: '',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    useEffect(() => {
        if (isAuthenticated && userRole === 'admin') {
            fetchReports();
        }
    }, [isAuthenticated, userRole, filters]);
    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const queryParams = new URLSearchParams(Object.assign(Object.assign(Object.assign({ page: filters.page.toString(), limit: filters.limit.toString() }, (filters.status && { status: filters.status })), (filters.reason && { reason: filters.reason })), { sortBy: filters.sortBy, sortOrder: filters.sortOrder })).toString();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }
            const data = await response.json();
            setReports(data.reports);
            setTotalPages(data.pages);
            setTotalReports(data.total);
        }
        catch (err) {
            setError(err.message || 'An error occurred while fetching reports');
            console.error('Error fetching reports:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleFilterChange = (field, value) => {
        setFilters(prev => (Object.assign(Object.assign({}, prev), { [field]: value, page: 1 // Reset to first page when filters change
         })));
    };
    const handleStatusUpdate = async (reportId, newStatus, adminNotes) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    adminNotes
                })
            });
            if (!response.ok) {
                throw new Error('Failed to update report status');
            }
            // Refresh the reports list
            fetchReports();
            alert('Report status updated successfully');
        }
        catch (err) {
            console.error('Error updating report status:', err);
            alert(err.message || 'An error occurred while updating the report status');
        }
    };
    if (isLoading || !isAuthenticated || userRole !== 'admin') {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center", children: _jsx("div", { className: "text-white", children: "Loading..." }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black p-8", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-6", children: "Report Management" }), _jsxs("div", { className: "bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400", children: ["Error: ", error] })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: "Report Management" }), _jsxs("div", { className: "text-white", children: ["Total Reports: ", _jsx("span", { className: "text-[#FF4D67]", children: totalReports })] })] }), _jsx("div", { className: "card-bg rounded-2xl p-6 mb-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Status" }), _jsxs("select", { value: filters.status, onChange: (e) => handleFilterChange('status', e.target.value), className: "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "reviewed", children: "Reviewed" }), _jsx("option", { value: "resolved", children: "Resolved" }), _jsx("option", { value: "dismissed", children: "Dismissed" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Reason" }), _jsxs("select", { value: filters.reason, onChange: (e) => handleFilterChange('reason', e.target.value), className: "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", children: [_jsx("option", { value: "", children: "All Reasons" }), _jsx("option", { value: "copyright", children: "Copyright" }), _jsx("option", { value: "inappropriate", children: "Inappropriate" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Sort By" }), _jsxs("select", { value: filters.sortBy, onChange: (e) => handleFilterChange('sortBy', e.target.value), className: "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", children: [_jsx("option", { value: "createdAt", children: "Created Date" }), _jsx("option", { value: "status", children: "Status" }), _jsx("option", { value: "reason", children: "Reason" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Order" }), _jsxs("select", { value: filters.sortOrder, onChange: (e) => handleFilterChange('sortOrder', e.target.value), className: "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", children: [_jsx("option", { value: "desc", children: "Descending" }), _jsx("option", { value: "asc", children: "Ascending" })] })] })] }) }), _jsx("div", { className: "card-bg rounded-2xl overflow-hidden", children: loading ? (_jsx("div", { className: "p-8 text-center text-gray-400", children: "Loading reports..." })) : reports.length === 0 ? (_jsx("div", { className: "p-8 text-center text-gray-400", children: "No reports found" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-800/50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", children: "Reporter" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", children: "Track" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", children: "Reason" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-700/50", children: reports.map((report) => (_jsxs("tr", { className: "hover:bg-gray-800/30", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm text-white", children: report.reporterId.name }), _jsx("div", { className: "text-sm text-gray-400", children: report.reporterId.email })] }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-sm text-white", children: report.trackId.title }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm text-white capitalize", children: report.reason }), report.description && (_jsx("div", { className: "text-sm text-gray-400 mt-1", children: report.description }))] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                                                                report.status === 'reviewed' ? 'bg-blue-600/20 text-blue-400' :
                                                                    report.status === 'resolved' ? 'bg-green-600/20 text-green-400' :
                                                                        'bg-gray-600/20 text-gray-400'}`, children: report.status }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-400", children: new Date(report.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: _jsx(DetailsModal, { report: report, onUpdateStatus: handleStatusUpdate }) })] }, report._id))) })] }) }), _jsxs("div", { className: "px-6 py-4 bg-gray-800/30 flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-400", children: ["Showing ", (currentPage - 1) * filters.limit + 1, " to ", Math.min(currentPage * filters.limit, totalReports), " of ", totalReports, " reports"] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleFilterChange('page', Math.max(1, currentPage - 1).toString()), disabled: currentPage === 1, className: "px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed", children: "Previous" }), _jsxs("span", { className: "px-3 py-1 bg-gray-700 text-white rounded", children: [currentPage, " of ", totalPages] }), _jsx("button", { onClick: () => handleFilterChange('page', Math.min(totalPages, currentPage + 1).toString()), disabled: currentPage === totalPages, className: "px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed", children: "Next" })] })] })] })) })] }) }));
}
function DetailsModal({ report, onUpdateStatus }) {
    const [isOpen, setIsOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setIsOpen(true), className: "text-[#FF4D67] hover:text-[#FF4D67]/80 font-medium", children: "View Details" }), _jsx(ReportDetailsModal, { isOpen: isOpen, onClose: () => setIsOpen(false), report: report, onUpdateStatus: onUpdateStatus })] }));
}
