import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { AudioPlayerProvider } from "../contexts/AudioPlayerContext";
import { CommunityProvider } from "../contexts/CommunityContext";
import ModernAudioPlayer from "../components/ModernAudioPlayer";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ConditionalNavbar from "../components/ConditionalNavbar";
export const metadata = {
    title: {
        template: '%s | MuzikaX - Rwanda & African Artists Music Platform',
        default: "MuzikaX - Rwanda & African Artists Music Platform",
    },
    description: "Connecting Rwandan and African music creators with fans worldwide. Discover, stream, and share the best of Rwandan and African music on MuzikaX. Free music streaming platform.",
    keywords: ["Rwandan music", "African music", "Afrobeats", "Music streaming", "Rwandan artists", "Music platform", "Digital music", "Free music", "Online radio", "Music discovery"],
    authors: [{ name: "MuzikaX Team" }],
    creator: "MuzikaX Team",
    publisher: "MuzikaX",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    // AdSense optimization metadata
    category: "music",
    classification: "entertainment",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://www.muzikax.com/",
        siteName: "MuzikaX",
        title: "MuzikaX - Rwanda & African Artists Music Platform",
        description: "Connecting Rwandan and African music creators with fans worldwide",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "MuzikaX - Rwanda's Digital Music Ecosystem",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "MuzikaX - Rwanda & African Artists Music Platform",
        description: "Connecting Rwandan and African music creators with fans worldwide",
        images: ["/og-image.jpg"],
        creator: "@muzikax",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "https://www.muzikax.com/",
    },
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
export default function RootLayout({ children, }) {
    return (_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsx("meta", { name: "application-name", content: "MuzikaX" }), _jsx("meta", { name: "mobile-web-app-capable", content: "yes" }), _jsx("meta", { name: "apple-mobile-web-app-title", content: "MuzikaX" }), _jsx("meta", { name: "theme-color", content: "#000000" }), _jsx("link", { rel: "manifest", href: "/manifest.json" }), _jsx("script", { async: true, src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5073101063025875", crossOrigin: "anonymous" })] }), _jsx("body", { className: "pb-24 md:pb-0", children: _jsx(GoogleOAuthProvider, { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", children: _jsx(AuthProvider, { children: _jsx(AudioPlayerProvider, { children: _jsxs(CommunityProvider, { children: [_jsx(ConditionalNavbar, {}), children, _jsx(ModernAudioPlayer, {}), _jsx(PWAInstallPrompt, {})] }) }) }) }) })] }));
}
