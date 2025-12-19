import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../contexts/AuthContext";
import { AudioPlayerProvider } from "../contexts/AudioPlayerContext";
import ModernAudioPlayer from "../components/ModernAudioPlayer";
import PWAInstallPrompt from "../components/PWAInstallPrompt";

export const metadata: Metadata = {
  title: "MuzikaX - Rwanda's Digital Music Ecosystem",
  description: "Connecting Rwandan music creators with fans worldwide",
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
        <link rel="apple-touch-icon" href="/muzikax.png" />
        <link rel="icon" href="/muzikax.png" type="image/png" />
      </head>
      <body>
        <AuthProvider>
          <AudioPlayerProvider>
            <Navbar />
            {children}
            <ModernAudioPlayer />
            <PWAInstallPrompt />
          </AudioPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}