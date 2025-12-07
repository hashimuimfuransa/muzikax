import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "MuzikaX - Rwanda's Digital Music Ecosystem",
  description: "Connecting Rwandan music creators with fans worldwide",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}