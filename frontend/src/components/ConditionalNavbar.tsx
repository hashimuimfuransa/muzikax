'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import MobileNavbar from './MobileNavbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
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