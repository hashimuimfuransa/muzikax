'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';

export default function ConditionalSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  const isAdminPage = pathname?.startsWith('/admin');
  const isPlayerPage = pathname === '/player';
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  
  if (isAdminPage) {
    return <AdminSidebar />;
  }
  
  if (isPlayerPage || isLoginPage || isRegisterPage) {
    return null;
  }
  
  return <Sidebar />;
}
