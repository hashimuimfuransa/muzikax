import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function AppLayout({
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
      <body className="pb-24 md:pb-0 flex flex-col min-h-screen overflow-hidden">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"}>
          <AuthProvider>
            <AudioPlayerProvider>
              <Navbar />
              {children}
              <Footer />
              <ModernAudioPlayer />
              <MobileNavbar />
              <PWAInstallPrompt />
            </AudioPlayerProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
        <FloatingComponents />
      </body>
    </html>
  );
}
