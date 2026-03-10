'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function MobileLayout({ children, hideNav = false }: MobileLayoutProps) {
  const pathname = usePathname();
  const isEditPage = pathname === '/transactions/edit';
  const shouldHideNav = hideNav || pathname === '/transactions/new' || isEditPage;

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <main className="w-full max-w-md relative min-h-screen flex flex-col shadow-2xl bg-background/50 border-x border-white/5 pb-24">
        {children}
        {!shouldHideNav && <BottomNav />}
      </main>
    </div>
  );
}
