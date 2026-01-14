import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { AudioPlayerProvider } from "../contexts/AudioPlayerContext";
import ModernAudioPlayer from "../components/ModernAudioPlayer";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ConditionalNavbar from "../components/ConditionalNavbar";

export const metadata: Metadata = {
  title: {
    template: '%s | MuzikaX - Rwanda\'s Digital Music Ecosystem',
    default: "MuzikaX - Rwanda's Digital Music Ecosystem",
  },
  description: "Connecting Rwandan music creators with fans worldwide. Discover, stream, and share the best of Rwandan music on MuzikaX.",
  keywords: ["Rwandan music", "African music", "Afrobeats", "Music streaming", "Rwandan artists", "Music platform", "Digital music"],
  authors: [{ name: "MuzikaX Team" }],
  creator: "MuzikaX Team",
  publisher: "MuzikaX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.muzikax.com/",
    siteName: "MuzikaX",
    title: "MuzikaX - Rwanda's Digital Music Ecosystem",
    description: "Connecting Rwandan music creators with fans worldwide",
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
    title: "MuzikaX - Rwanda's Digital Music Ecosystem",
    description: "Connecting Rwandan music creators with fans worldwide",
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="MuzikaX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="MuzikaX" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="pb-24 md:pb-0">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"}>
          <AuthProvider>
            <AudioPlayerProvider>
              <ConditionalNavbar />
              {children}
              <ModernAudioPlayer />
              <PWAInstallPrompt />
            </AudioPlayerProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
