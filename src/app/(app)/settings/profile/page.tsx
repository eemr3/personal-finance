'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, User } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../../lib/format';
import Image from 'next/image';
import { ProfileField } from '../../../../components/ui/profile-field';

function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: user?.displayName ?? '',
    email: user?.email ?? '',
    phone: user?.phoneNumber ?? '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Mock save action
    console.log('Saving profile:', formData);
    router.push('/settings/profile');
  };

  console.log(user);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-linear-to-b from-primary/10 to-transparent px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/settings')}
            className="w-11 h-11 flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="mb-1">Profile</h1>
            <p className="text-muted-foreground">
              {t('settings.profile.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-2 pb-24 bg-linear-to-b from-primary/5 via-background to-background min-h-[50vh]">
        {/* Profile Picture */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 bg-linear-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-shadow duration-200">
              {user?.photoURL ? (
                <Image
                  src={user?.photoURL}
                  alt="Profile Picture"
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              ) : (
                <User size={40} />
              )}
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            {t('settings.profile.personalInformation')}
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 transition-colors duration-200">
            <div className="space-y-5">
              <ProfileField
                label={t('settings.profile.email')}
                value={user?.email ?? ''}
              />
              <ProfileField
                label={t('settings.profile.provider')}
                value={
                  user?.providerData[0]?.providerId === 'google.com'
                    ? t('settings.profile.providerName')
                    : ''
                }
              />
              <ProfileField
                label={t('settings.profile.fullName')}
                value={user?.displayName ?? ''}
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-border/60 mb-10" aria-hidden />

        <section className="mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
            {t('settings.profile.accountInformation')}
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 transition-colors duration-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.profile.memberSince')}
                  </p>
                  <p className="font-medium">
                    {formatDate(
                      user?.metadata?.creationTime ?? new Date(),
                      'dmy',
                    )}
                  </p>
                </div>
              </div>
              <div className="h-px bg-border/60" aria-hidden />
              <div className="flex justify-between items-center py-2">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {t('settings.profile.accountId')}
                  </p>
                  <p className="font-medium font-mono text-sm truncate">
                    {user?.uid ?? ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}

export default ProfilePage;
