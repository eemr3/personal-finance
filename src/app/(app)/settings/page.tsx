'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import {
  User,
  Calculator,
  Palette,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';

function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={24} />,
          label: 'Profile',
          description: `${t('settings.profile.description')}`,
          onClick: () => router.push('/settings/profile'),
        },
      ],
    },
    {
      title: 'Financial',
      items: [
        {
          icon: <Calculator size={24} />,
          label: 'Fixed Expense Rules',
          description: `${t('settings.fixedExpenseRules.description')}`,
          onClick: () => router.push('/settings/fixed-expenses'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Palette size={24} />,
          label: 'Appearance',
          description: `${t('settings.appearance.description')}`,
          onClick: () => router.push('/settings/appearance'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pb-4">
        <AppHeader
          title={t('header.settings')}
          subtitle={t('settings.subtitle')}
        />
      </div>

      <div className="px-6 pt-2 pb-24 bg-linear-to-b from-primary/5 via-background to-background min-h-[50vh]">
        {settingsSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {sectionIndex > 0 && (
              <div className="h-px bg-border/60 mb-10" aria-hidden />
            )}
            <section className="mb-10">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
                {section.title}
              </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-border bg-card hover:bg-accent/80 hover:border-border transition-all duration-200 ease-out text-left"
                >
                  <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {item.label}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-muted-foreground shrink-0"
                  />
                </button>
              ))}
            </div>
            </section>
          </React.Fragment>
        ))}

        <div className="h-px bg-border/60 mb-10" aria-hidden />

        <section className="mb-10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-border bg-card hover:bg-danger/10 hover:border-danger/30 transition-all duration-200 ease-out text-left"
          >
            <div className="w-12 h-12 shrink-0 bg-danger/10 rounded-full flex items-center justify-center text-danger">
              <LogOut size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-danger">Log Out</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Sign out of your account
              </p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground shrink-0" />
          </button>
        </section>

        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Personal Finance v1.0.0
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default SettingsPage;
