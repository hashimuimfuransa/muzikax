"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
export default function OfflinePage() {
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-md w-full text-center", children: [_jsx("div", { className: "bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "You're Offline" }), _jsx("p", { className: "text-gray-600 mb-6", children: "It seems you've lost your internet connection. Please check your connection and try again." }), _jsx(Link, { href: "/", className: "inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none", children: "Retry" })] }) }));
}
