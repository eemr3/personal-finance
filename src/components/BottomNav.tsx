'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Home, Receipt, Settings } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', icon: Home, labelKey: 'bottomNav.home' as const },
    { path: '/transactions', icon: Receipt, labelKey: 'bottomNav.transactions' as const },
    { path: '/settings', icon: Settings, labelKey: 'bottomNav.settings' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 min-w-[70px] py-2 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
