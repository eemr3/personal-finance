'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CreditCard, Home, ListFilter, Plus, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <nav className="w-full max-w-md glass-panel border-t border-white/10 px-2 sm:px-4 py-3 grid grid-cols-5 items-end shadow-2xl">
        <Link
          href="/dashboard"
          scroll={false}
          className={clsx(
            'flex flex-col items-center justify-end gap-1 min-h-[44px] py-1 transition-all duration-300 touch-manipulation',
            (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Home
            strokeWidth={pathname === '/dashboard' || pathname.startsWith('/dashboard/') ? 2.5 : 2}
            className={clsx(
              'w-6 h-6 shrink-0',
              (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) && '-translate-y-1'
            )}
          />
          <span className={clsx(
            'text-[10px] font-medium truncate',
            (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) ? 'opacity-100' : 'opacity-0 absolute'
          )}>
            {t('bottomNav.home')}
          </span>
        </Link>

        <Link
          href="/transactions"
          scroll={false}
          className={clsx(
            'flex flex-col items-center justify-end gap-1 min-h-[44px] py-1 transition-all duration-300 touch-manipulation',
            (pathname === '/transactions' || pathname.startsWith('/transactions/'))
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ListFilter
            strokeWidth={pathname === '/transactions' || pathname.startsWith('/transactions/') ? 2.5 : 2}
            className={clsx(
              'w-6 h-6 shrink-0',
              (pathname === '/transactions' || pathname.startsWith('/transactions/')) && '-translate-y-1'
            )}
          />
          <span className={clsx(
            'text-[10px] font-medium truncate',
            (pathname === '/transactions' || pathname.startsWith('/transactions/')) ? 'opacity-100' : 'opacity-0 absolute'
          )}>
            {t('bottomNav.transactions')}
          </span>
        </Link>

        <div className="relative z-10 flex items-center justify-center -mt-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.push('/transactions/new');
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_8px_30px_hsl(173_80%_40%/0.5)] hover:scale-105 active:scale-95 transition-all touch-manipulation"
            aria-label={t('transactions.newTransaction')}
          >
            <Plus className="w-6 h-6 pointer-events-none" strokeWidth={3} />
          </button>
        </div>

        <Link
          href="/cards"
          scroll={false}
          className={clsx(
            'flex flex-col items-center justify-end gap-1 min-h-[44px] py-1 transition-all duration-300 touch-manipulation',
            (pathname === '/cards' || pathname.startsWith('/cards/'))
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <CreditCard
            strokeWidth={pathname === '/cards' || pathname.startsWith('/cards/') ? 2.5 : 2}
            className={clsx(
              'w-6 h-6 shrink-0',
              (pathname === '/cards' || pathname.startsWith('/cards/')) && '-translate-y-1'
            )}
          />
          <span className={clsx(
            'text-[10px] font-medium truncate',
            (pathname === '/cards' || pathname.startsWith('/cards/')) ? 'opacity-100' : 'opacity-0 absolute'
          )}>
            {t('bottomNav.cards')}
          </span>
        </Link>

        <Link
          href="/settings"
          scroll={false}
          className={clsx(
            'flex flex-col items-center justify-end gap-1 min-h-[44px] py-1 transition-all duration-300 touch-manipulation',
            (pathname === '/settings' || pathname.startsWith('/settings/'))
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings
            strokeWidth={pathname === '/settings' || pathname.startsWith('/settings/') ? 2.5 : 2}
            className={clsx(
              'w-6 h-6 shrink-0',
              (pathname === '/settings' || pathname.startsWith('/settings/')) && '-translate-y-1'
            )}
          />
          <span className={clsx(
            'text-[10px] font-medium truncate',
            (pathname === '/settings' || pathname.startsWith('/settings/')) ? 'opacity-100' : 'opacity-0 absolute'
          )}>
            {t('bottomNav.settings')}
          </span>
        </Link>
      </nav>
    </div>
  );
}
