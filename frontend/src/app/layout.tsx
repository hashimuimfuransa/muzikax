import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../contexts/AuthContext";
import { AudioPlayerProvider } from "../contexts/AudioPlayerContext";

export const metadata: Metadata = {
  title: "MuzikaX - Rwanda's Digital Music Ecosystem",
  description: "Connecting Rwandan music creators with fans worldwide",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AudioPlayerProvider>
            <Navbar />
            {children}
          </AudioPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}