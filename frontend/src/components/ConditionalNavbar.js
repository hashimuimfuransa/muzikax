'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import MobileNavbar from './MobileNavbar';
export default function ConditionalNavbar() {
    const pathname = usePathname();
    // Hide navbar on player page
    const isPlayerPage = pathname === '/player';
    if (isPlayerPage) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx(MobileNavbar, {})] }));
}
