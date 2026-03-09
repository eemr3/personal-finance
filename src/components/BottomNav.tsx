'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CreditCard, Home, ListFilter, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', icon: Home, labelKey: 'bottomNav.home' as const },
    { path: '/transactions', icon: ListFilter, labelKey: 'bottomNav.transactions' as const },
    { path: '/cards', icon: CreditCard, labelKey: 'bottomNav.cards' as const },
    { path: '/settings', icon: Settings, labelKey: 'bottomNav.settings' as const },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <nav className="w-full max-w-md glass-panel border-t border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={clsx(
                'flex flex-col items-center gap-1.5 transition-all duration-300',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                strokeWidth={isActive ? 2.5 : 2}
                className={clsx(
                  'w-6 h-6 transition-transform duration-300',
                  isActive && '-translate-y-1'
                )}
              />
              <span
                className={clsx(
                  'text-[10px] font-medium transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-0 absolute'
                )}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
