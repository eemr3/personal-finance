'use client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  getBiometricTokens,
  isBiometricAvailable,
  isBiometricEnabled,
  loginWithBiometric,
  saveBiometricCredentials,
} from '@/services/auth/biometricAuth';
import { getLastGoogleTokens, signInWithGoogle } from '@/services/auth/googleAuth';
import { Capacitor } from '@capacitor/core';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ uid: string; email: string } | null>(
    null,
  );
  const redirectBlockedRef = useRef(false);

  const checkBiometric = useCallback(async () => {
    const available = await isBiometricAvailable();
    const enabled = await isBiometricEnabled();
    setBiometricAvailable(available);
    setBiometricEnabled(enabled);
  }, []);

  useEffect(() => {
    checkBiometric();
  }, [checkBiometric]);

  // Redirecionar se já logado
  useEffect(() => {
    if (user && !redirectBlockedRef.current) {
      if (Capacitor.isNativePlatform()) {
        window.location.href = '/dashboard.html';
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user]);

  function navigateToDashboard() {
    if (Capacitor.isNativePlatform()) {
      window.location.href = '/dashboard.html';
    } else {
      router.replace('/dashboard');
    }
  }

  async function handleGoogleLogin() {
    try {
      redirectBlockedRef.current = true;
      const result = await signInWithGoogle(); // ✅ sempre UserCredential

      if (biometricAvailable && !biometricEnabled && result?.user) {
        setPendingUser({
          uid: result.user.uid,
          email: result.user.email ?? '',
        });
        setShowBiometricModal(true);
        return;
      }

      redirectBlockedRef.current = false;
      navigateToDashboard();
    } catch (error: any) {
      redirectBlockedRef.current = false;
      if (
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/popup-closed-by-user'
      )
        return;
      console.error('Erro no login:', error);
    }
  }

  async function handleBiometricLogin() {
    try {
      const credentials = await loginWithBiometric();
      // ✅ Recuperar tokens e reautenticar no Firebase
      const tokens = await getBiometricTokens();

      if (tokens?.idToken) {
        const { GoogleAuthProvider, signInWithCredential } = await import(
          'firebase/auth'
        );
        const { auth } = await import('@/lib/firebase/firebase-client');

        const credential = GoogleAuthProvider.credential(
          tokens.idToken,
          tokens.accessToken,
        );
        await signInWithCredential(auth, credential);
      }

      window.location.href = '/dashboard.html';
    } catch (error) {
      console.error('Biometric login failed:', error);
    }
  }

  async function handleModalClose(activate: boolean) {
    if (activate && pendingUser) {
      // ✅ Pegar tokens que foram salvos durante o login Google
      const { idToken, accessToken } = getLastGoogleTokens();

      await saveBiometricCredentials(
        pendingUser.uid,
        pendingUser.email,
        idToken ?? '',
        accessToken ?? '',
      );
    }

    setShowBiometricModal(false);
    setPendingUser(null);
    redirectBlockedRef.current = false;
    await checkBiometric();
    window.location.href = '/dashboard.html';
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card text-card-foreground rounded-2xl shadow-xl p-8 md:p-12 border border-border">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <Image src="/icons/icon-512.png" alt="Logo" width={100} height={100} />
          </motion.div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {t('login.title')}
            </h1>
            <p className="text-muted-foreground">{t('login.subtitle')}</p>
          </div>

          {/* Botão Google */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            className="w-full bg-card border-2 border-border rounded-xl py-4 px-6 flex items-center justify-center gap-3 hover:bg-transparent hover:border-accent-foreground/20 transition-all duration-200"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-foreground font-medium">
              {t('login.continueWithGoogle')}
            </span>
          </motion.button>

          {/* ✅ Botão de digital — só aparece se disponível e ativada */}
          {biometricAvailable && biometricEnabled && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBiometricLogin}
              className="w-full mt-3 bg-primary text-primary-foreground rounded-xl py-4 px-6 flex items-center justify-center gap-3"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
              <span className="font-medium">Entrar com digital</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ✅ Modal de ativação de biometria */}
      <AnimatePresence>
        {showBiometricModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-md border border-border"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold text-center text-foreground mb-2">
                Ativar login por digital?
              </h2>
              <p className="text-muted-foreground text-center text-sm mb-6">
                Nas próximas vezes, entre rapidamente usando sua digital ou reconhecimento
                facial.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleModalClose(true)}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium"
                >
                  Ativar agora
                </button>
                <button
                  onClick={() => handleModalClose(false)}
                  className="w-full text-muted-foreground py-3 font-medium"
                >
                  Agora não
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-[125px] h-[125px] rounded-full bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
