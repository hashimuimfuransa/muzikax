import type { Metadata, Viewport } from "next";
import Head from 'next/head';
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { AudioPlayerProvider } from "../contexts/AudioPlayerContext";
import { CommunityProvider } from "../contexts/CommunityContext";
import { PaymentProvider } from "../contexts/PaymentContext";
import ModernAudioPlayer from "../components/ModernAudioPlayer";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import ContactFloatingButton from "../components/ContactFloatingButton";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ConditionalNavbar from "../components/ConditionalNavbar";
import PushNotificationInitializer from "../components/PushNotificationInitializer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    template: '%s | MuzikaX - Rwanda & African Artists Music Platform',
    default: "MuzikaX - Rwanda & African Artists Music Platform",
  },
  description: "Connecting Rwandan and African music creators with fans worldwide. Discover, stream, and share the best of Rwandan and African music on MuzikaX. Free music streaming platform with artist resources, industry news, and educational content.",
  keywords: ["Rwandan music", "African music", "Afrobeats", "Music streaming", "Rwandan artists", "Music platform", "Digital music", "Free music", "Online radio", "Music discovery", "Artist resources", "Music education", "African culture", "Music industry news"],
  authors: [{ name: "MuzikaX Team" }],
  creator: "MuzikaX Team",
  publisher: "MuzikaX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Structured data for SEO
  applicationName: "MuzikaX",
  referrer: "origin-when-cross-origin",
  // AdSense optimization metadata
  category: "music",
  classification: "entertainment",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.muzikax.com/",
    siteName: "MuzikaX",
    title: "MuzikaX - Rwanda & African Artists Music Platform",
    description: "Connecting Rwandan and African music creators with fans worldwide. Discover unique African music, artist resources, and industry insights.",
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
    description: "Connecting Rwandan and African music creators with fans worldwide. Free music streaming with artist resources and industry news.",
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
        {/* Essential scripts only - removed ad redirect scripts */}
        <meta name="application-name" content="MuzikaX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="MuzikaX" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="MuzikaX is Rwanda's premier digital music platform connecting African artists with global audiences. Discover unique African music, access artist resources, read industry news, and explore educational content." />
        <meta name="keywords" content="Rwandan music, African music, Afrobeats, Music streaming, Rwandan artists, Music platform, Digital music, Free music, Online radio, Music discovery, Artist resources, Music education, African culture, Music industry news" />
        <meta name="pushsdk" content="dd3dba6d9211c567d19da6eb4f51db7e" />
        <meta name="google-adsense-account" content="ca-pub-5073101063025875" />
        <link rel="manifest" href="/manifest.json" />
        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicGroup",
              "name": "MuzikaX",
              "description": "Rwanda's digital music platform connecting African artists with global audiences",
              "url": "https://www.muzikax.com/",
              "sameAs": [
                "https://twitter.com/muzikax",
                "https://facebook.com/muzikax",
                "https://instagram.com/muzikax"
              ],
              "foundingDate": "2023",
              "location": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Kigali",
                  "addressCountry": "RW"
                }
              },
              "offers": {
                "@type": "Offer",
                "category": "MusicStreamingService",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
        {/* Removed ad scripts to prevent unwanted redirects */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5073101063025875"
          crossOrigin="anonymous"></script>
      </head>
      <body className="pb-20 md:pb-0">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"}>
          <AuthProvider>
            <AudioPlayerProvider>
              <CommunityProvider>
                <PaymentProvider>
                  <ConditionalNavbar />
                  <PushNotificationInitializer />
                  {children}
                  <ModernAudioPlayer />
                  <PWAInstallPrompt />
                  <ContactFloatingButton />
                </PaymentProvider>
              </CommunityProvider>
            </AudioPlayerProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}