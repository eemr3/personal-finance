'use client';
import { useRouter } from 'next/navigation';
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

function SettingsPage() {
  const router = useRouter();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={24} />,
          label: 'Profile',
          description: 'Manage your personal information',
          onClick: () => console.log('Profile'),
        },
      ],
    },
    {
      title: 'Financial',
      items: [
        {
          icon: <Calculator size={24} />,
          label: 'Fixed Expense Rules',
          description: 'Configure automatic expense rules',
          onClick: () => router.push('/settings/fixed-expenses'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell size={24} />,
          label: 'Notifications',
          description: 'Manage notification preferences',
          onClick: () => console.log('Notifications'),
        },
        {
          icon: <Palette size={24} />,
          label: 'Appearance',
          description: 'Customize app theme and display',
          onClick: () => console.log('Appearance'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    // Mock logout
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6">
        <h1 className="mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      <div className="px-6 space-y-6">
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
