'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ArrowLeft, User, Camera } from 'lucide-react';
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

      <div className="px-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-linear-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground">
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
            {/* <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
              <Camera size={16} />
            </button> */}
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <h3 className="mb-4">{t('settings.profile.personalInformation')}</h3>
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
        </Card>

        {/* Account Information */}
        <Card>
          <h3 className="mb-4">{t('settings.profile.accountInformation')}</h3>
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
            <div className="h-px bg-border"></div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.profile.accountId')}
                </p>
                <p className="font-medium font-mono text-sm">
                  {user?.uid ?? ''}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        {/* <div className="space-y-3 pb-6">
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push('/settings')}
          >
            {t('common.return')}
          </Button>
        </div> */}
      </div>

      <BottomNav />
    </div>
  );
}

export default ProfilePage;
