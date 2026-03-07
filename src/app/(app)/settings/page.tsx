'use client';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import {
  User,
  Calculator,
  Bell,
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
    // Mock logout
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

      <div className="px-6 pt-4 space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              {section.title}
            </h3>
            <div className="space-y-3">
              {section.items.map((item) => (
                <Card key={item.label} onClick={item.onClick}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate">{item.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <Card onClick={handleLogout}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center text-danger">
              <LogOut size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-danger">Log Out</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        </Card>

        <div className="text-center py-6">
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
