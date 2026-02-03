"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Show the install prompt
            setShowInstallPrompt(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);
    const installApp = () => {
        if (!deferredPrompt)
            return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            else {
                console.log('User dismissed the install prompt');
            }
            // Clear the deferred prompt
            setDeferredPrompt(null);
            // Hide the install prompt
            setShowInstallPrompt(false);
        });
    };
    const closePrompt = () => {
        setShowInstallPrompt(false);
    };
    if (!showInstallPrompt)
        return null;
    return (_jsxs("div", { className: "fixed bottom-20 right-4 left-4 md:left-auto md:w-80 bg-white rounded-lg shadow-xl p-4 z-[10000] border border-gray-200 md:bottom-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-lg text-gray-900", children: "Install MuzikaX App" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Add to your home screen for faster access and improved experience." })] }), _jsx("button", { onClick: closePrompt, className: "text-gray-400 hover:text-gray-500", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsx("button", { onClick: installApp, className: "flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors", children: "Install" }), _jsx("button", { onClick: closePrompt, className: "flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors", children: "Later" })] })] }));
};
export default PWAInstallPrompt;
