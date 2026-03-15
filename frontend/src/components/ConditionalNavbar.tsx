'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import MobileNavbar from './MobileNavbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Return null until mounted to avoid hydration mismatches
  // with auth and language states in the navbar subcomponents
  if (!mounted) {
    return null;
  }
  
  // Hide navbar on player page
  const isPlayerPage = pathname === '/player';
  
  if (isPlayerPage) {
    return null;
  }
  
  return (
    <>
      <Navbar />
      <MobileNavbar />
    </>
  );
}