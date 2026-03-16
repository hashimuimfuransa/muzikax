'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SidebarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <>{children}</>;
  }
  
  const isPlayerPage = pathname === '/player';
  const isAdminPage = pathname?.startsWith('/admin');
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  
  const hideSidebar = isPlayerPage || isAdminPage || isLoginPage || isRegisterPage;
  
  return (
    <div className={hideSidebar ? 'w-full' : 'w-full md:pl-20 transition-all duration-300'}>
      {children}
    </div>
  );
}
