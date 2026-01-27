'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import AdminSidebar from '../../../components/AdminSidebar';
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                setLoading(false);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [isAuthenticated, userRole, router]);
    // Form states
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'MuzikaX',
        siteDescription: 'The ultimate music streaming platform',
        contactEmail: 'support@muzikax.com',
        maintenanceMode: false
    });
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: true,
        passwordMinLength: 8,
        sessionTimeout: 30
    });
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        userReports: true,
        systemAlerts: true
    });
    const handleSaveGeneral = (e) => {
        e.preventDefault();
        // In a real app, this would save to the backend
        alert('General settings saved!');
    };
    const handleSaveSecurity = (e) => {
        e.preventDefault();
        // In a real app, this would save to the backend
        alert('Security settings saved!');
    };
    const handleSaveNotifications = (e) => {
        e.preventDefault();
        // In a real app, this would save to the backend
        alert('Notification settings saved!');
    };
    // Don't render the page until auth check is complete
    if (!authChecked) {
        return (_jsx("div", { className: "flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D67]" }) }));
    }
    // Don't render the page if not authenticated or not authorized
    if (!isAuthenticated || userRole !== 'admin') {
        return null;
    }
    return (_jsxs("div", { className: "flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black", children: [_jsx(AdminSidebar, {}), _jsxs("main", { className: "flex-1 flex flex-col w-full min-h-screen md:ml-64", children: [_jsx("div", { className: "absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10" }), _jsx("div", { className: "absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10" }), _jsxs("div", { className: "container mx-auto px-4 sm:px-8 py-6 sm:py-8", children: [_jsxs("div", { className: "mb-6 sm:mb-8", children: [_jsx("h1", { className: "text-xl sm:text-2xl md:text-3xl font-bold text-white", children: "System Settings" }), _jsx("p", { className: "text-gray-400 text-sm sm:text-base", children: "Configure platform-wide settings and preferences" })] }), _jsxs("div", { className: "card-bg rounded-2xl p-4 sm:p-6 mb-6", children: [_jsx("div", { className: "border-b border-gray-800", children: _jsx("nav", { className: "-mb-px flex space-x-6 sm:space-x-8", children: [
                                                { id: 'general', name: 'General' },
                                                { id: 'security', name: 'Security' },
                                                { id: 'notifications', name: 'Notifications' },
                                                { id: 'integrations', name: 'Integrations' }
                                            ].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.id), className: `py-2 px-1 text-sm sm:text-base font-medium border-b-2 ${activeTab === tab.id
                                                    ? 'border-[#FF4D67] text-white'
                                                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`, children: tab.name }, tab.id))) }) }), _jsxs("div", { className: "mt-6", children: [activeTab === 'general' && (_jsx("form", { onSubmit: handleSaveGeneral, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "siteName", className: "block text-sm font-medium text-gray-400 mb-1", children: "Site Name" }), _jsx("input", { type: "text", id: "siteName", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: generalSettings.siteName, onChange: (e) => setGeneralSettings(Object.assign(Object.assign({}, generalSettings), { siteName: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "siteDescription", className: "block text-sm font-medium text-gray-400 mb-1", children: "Site Description" }), _jsx("textarea", { id: "siteDescription", rows: 3, className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: generalSettings.siteDescription, onChange: (e) => setGeneralSettings(Object.assign(Object.assign({}, generalSettings), { siteDescription: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "contactEmail", className: "block text-sm font-medium text-gray-400 mb-1", children: "Contact Email" }), _jsx("input", { type: "email", id: "contactEmail", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: generalSettings.contactEmail, onChange: (e) => setGeneralSettings(Object.assign(Object.assign({}, generalSettings), { contactEmail: e.target.value })) })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "maintenanceMode", className: "h-4 w-4 text-[#FF4D67] focus:ring-[#FF4D67] border-gray-700 rounded bg-gray-800", checked: generalSettings.maintenanceMode, onChange: (e) => setGeneralSettings(Object.assign(Object.assign({}, generalSettings), { maintenanceMode: e.target.checked })) }), _jsx("label", { htmlFor: "maintenanceMode", className: "ml-2 block text-sm text-gray-400", children: "Enable Maintenance Mode" })] }), _jsx("div", { className: "pt-4", children: _jsx("button", { type: "submit", className: "px-4 py-2 bg-[#FF4D67] hover:bg-[#FF4D67]/80 text-white rounded-lg transition-colors", children: "Save General Settings" }) })] }) })), activeTab === 'security' && (_jsx("form", { onSubmit: handleSaveSecurity, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "twoFactorAuth", className: "h-4 w-4 text-[#FF4D67] focus:ring-[#FF4D67] border-gray-700 rounded bg-gray-800", checked: securitySettings.twoFactorAuth, onChange: (e) => setSecuritySettings(Object.assign(Object.assign({}, securitySettings), { twoFactorAuth: e.target.checked })) }), _jsx("label", { htmlFor: "twoFactorAuth", className: "ml-2 block text-sm text-gray-400", children: "Require Two-Factor Authentication for Admins" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "passwordMinLength", className: "block text-sm font-medium text-gray-400 mb-1", children: "Minimum Password Length" }), _jsx("input", { type: "number", id: "passwordMinLength", min: "6", max: "20", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: securitySettings.passwordMinLength, onChange: (e) => setSecuritySettings(Object.assign(Object.assign({}, securitySettings), { passwordMinLength: parseInt(e.target.value) || 8 })) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "sessionTimeout", className: "block text-sm font-medium text-gray-400 mb-1", children: "Session Timeout (minutes)" }), _jsx("input", { type: "number", id: "sessionTimeout", min: "5", max: "120", className: "w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]", value: securitySettings.sessionTimeout, onChange: (e) => setSecuritySettings(Object.assign(Object.assign({}, securitySettings), { sessionTimeout: parseInt(e.target.value) || 30 })) })] }), _jsx("div", { className: "pt-4", children: _jsx("button", { type: "submit", className: "px-4 py-2 bg-[#FF4D67] hover:bg-[#FF4D67]/80 text-white rounded-lg transition-colors", children: "Save Security Settings" }) })] }) })), activeTab === 'notifications' && (_jsx("form", { onSubmit: handleSaveNotifications, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "emailNotifications", className: "h-4 w-4 text-[#FF4D67] focus:ring-[#FF4D67] border-gray-700 rounded bg-gray-800", checked: notificationSettings.emailNotifications, onChange: (e) => setNotificationSettings(Object.assign(Object.assign({}, notificationSettings), { emailNotifications: e.target.checked })) }), _jsx("label", { htmlFor: "emailNotifications", className: "ml-2 block text-sm text-gray-400", children: "Enable Email Notifications" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "userReports", className: "h-4 w-4 text-[#FF4D67] focus:ring-[#FF4D67] border-gray-700 rounded bg-gray-800", checked: notificationSettings.userReports, onChange: (e) => setNotificationSettings(Object.assign(Object.assign({}, notificationSettings), { userReports: e.target.checked })) }), _jsx("label", { htmlFor: "userReports", className: "ml-2 block text-sm text-gray-400", children: "Send User Reports Daily" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "systemAlerts", className: "h-4 w-4 text-[#FF4D67] focus:ring-[#FF4D67] border-gray-700 rounded bg-gray-800", checked: notificationSettings.systemAlerts, onChange: (e) => setNotificationSettings(Object.assign(Object.assign({}, notificationSettings), { systemAlerts: e.target.checked })) }), _jsx("label", { htmlFor: "systemAlerts", className: "ml-2 block text-sm text-gray-400", children: "System Alerts and Updates" })] }), _jsx("div", { className: "pt-4", children: _jsx("button", { type: "submit", className: "px-4 py-2 bg-[#FF4D67] hover:bg-[#FF4D67]/80 text-white rounded-lg transition-colors", children: "Save Notification Settings" }) })] }) })), activeTab === 'integrations' && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white", children: "Spotify Integration" }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Connect with Spotify for cross-platform sharing" })] }), _jsx("button", { className: "px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors", children: "Configure" })] }) }), _jsx("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white", children: "Apple Music Integration" }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Sync with Apple Music library" })] }), _jsx("button", { className: "px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors", children: "Configure" })] }) }), _jsx("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white", children: "Google Analytics" }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Track user engagement and platform metrics" })] }), _jsx("button", { className: "px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors", children: "Configure" })] }) }), _jsx("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white", children: "Payment Gateway" }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Configure subscription payments" })] }), _jsx("button", { className: "px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors", children: "Configure" })] }) })] }))] })] }), _jsxs("div", { className: "card-bg rounded-2xl p-4 sm:p-6", children: [_jsx("h2", { className: "text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6", children: "Platform Information" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6", children: [_jsxs("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: [_jsx("div", { className: "text-gray-400 text-sm mb-1", children: "Version" }), _jsx("div", { className: "text-xl font-bold text-white", children: "v2.1.4" })] }), _jsxs("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: [_jsx("div", { className: "text-gray-400 text-sm mb-1", children: "Last Deployment" }), _jsx("div", { className: "text-xl font-bold text-white", children: "Dec 8, 2025" })] }), _jsxs("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: [_jsx("div", { className: "text-gray-400 text-sm mb-1", children: "Uptime" }), _jsx("div", { className: "text-xl font-bold text-white", children: "99.98%" })] }), _jsxs("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: [_jsx("div", { className: "text-gray-400 text-sm mb-1", children: "Database Size" }), _jsx("div", { className: "text-xl font-bold text-white", children: "2.4 GB" })] }), _jsxs("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: [_jsx("div", { className: "text-gray-400 text-sm mb-1", children: "Active Connections" }), _jsx("div", { className: "text-xl font-bold text-white", children: "1,248" })] }), _jsxs("div", { className: "border border-gray-800 rounded-xl p-4 sm:p-5", children: [_jsx("div", { className: "text-gray-400 text-sm mb-1", children: "API Requests (24h)" }), _jsx("div", { className: "text-xl font-bold text-white", children: "1.2M" })] })] })] })] })] })] }));
}
