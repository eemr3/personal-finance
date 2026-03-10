'use client';
import { useState, useEffect } from 'react';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  loginWithBiometric,
  disableBiometric,
} from '@/features/auth/services/biometricAuth';
import { auth } from '@/lib/firebase/firebase-client';
import { signInWithCustomToken } from 'firebase/auth';

export function useBiometric() {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    async function check() {
      const available = await isBiometricAvailable();
      const enabled = await isBiometricEnabled();
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
    }
    check();
  }, []);

  async function handleBiometricLogin(): Promise<boolean> {
    try {
      const { uid, email } = await loginWithBiometric();
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        return true;
      }
      return true;
    } catch (error) {
      console.error('Biometric login failed:', error);
      return false;
    }
  }

  async function handleDisableBiometric() {
    await disableBiometric();
    setBiometricEnabled(false);
  }

  return {
    biometricAvailable,
    biometricEnabled,
    handleBiometricLogin,
    handleDisableBiometric,
  };
}
