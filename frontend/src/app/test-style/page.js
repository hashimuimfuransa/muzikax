"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
export default function TestStylePage() {
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground p-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: "Style Test Page" }), _jsx("p", { className: "mb-4", children: "This page tests if Tailwind styles are working correctly." }), _jsx("div", { className: "bg-primary text-white p-4 rounded-lg mb-4", children: "This should have a primary background color" }), _jsx("div", { className: "bg-accent text-dark p-4 rounded-lg mb-4", children: "This should have an accent background color" }), _jsx("button", { className: "btn-primary px-4 py-2 rounded-md", children: "This should be a primary button" }), _jsx("div", { className: "mt-8", children: _jsx(Link, { href: "/", className: "text-primary hover:underline", children: "Back to Home" }) })] }));
}
