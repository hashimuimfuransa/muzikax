import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "../../globals.css";
import Navbar from "../../components/Navbar";
import MobileNavbar from "../../components/MobileNavbar";
import { AuthProvider } from "../../contexts/AuthContext";
import { AudioPlayerProvider } from "../../contexts/AudioPlayerContext";
import ModernAudioPlayer from "../../components/ModernAudioPlayer";
import PWAInstallPrompt from "../../components/PWAInstallPrompt";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Footer from "../../components/Footer";
import FloatingComponents from "../../components/FloatingComponents";
export const metadata = {
    title: "MuzikaX - Rwanda's and Africa's Digital Music Ecosystem",
    description: "Connecting Rwandan music creators with fans worldwide",
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },
};
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#000000',
};
export default function AppLayout({ children, }) {
    return (_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsx("meta", { name: "application-name", content: "MuzikaX" }), _jsx("meta", { name: "mobile-web-app-capable", content: "yes" }), _jsx("meta", { name: "apple-mobile-web-app-title", content: "MuzikaX" }), _jsx("meta", { name: "theme-color", content: "#000000" }), _jsx("link", { rel: "manifest", href: "/manifest.json" })] }), _jsxs("body", { className: "pb-24 md:pb-0 flex flex-col min-h-screen overflow-hidden", children: [_jsx(GoogleOAuthProvider, { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", children: _jsx(AuthProvider, { children: _jsxs(AudioPlayerProvider, { children: [_jsx(Navbar, {}), children, _jsx(Footer, {}), _jsx(ModernAudioPlayer, {}), _jsx(MobileNavbar, {}), _jsx(PWAInstallPrompt, {})] }) }) }), _jsx(FloatingComponents, {})] })] }));
}
