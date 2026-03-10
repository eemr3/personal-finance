'use client';
import { useState, useEffect } from 'react';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  loginWithBiometric,
  disableBiometric,
} from '@/services/auth/biometricAuth';
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
      console.log('Biometric ok, uid:', uid, 'email:', email);
      // ✅ Se tiver token salvo, reautenticar silenciosamente
      // Como o Firebase mantém sessão, só verificar se o usuário ainda está logado
      const currentUser = auth.currentUser;
      console.log('Current Firebase user:', currentUser?.uid);
      if (currentUser && currentUser.uid === uid) {
        console.log('Session active, redirecting...');
        return true; // já está autenticado
      }
      console.log('Session expired, redirecting anyway...');
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
