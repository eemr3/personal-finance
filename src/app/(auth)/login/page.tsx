'use client';
import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { signInWithGoogle } from '../../../services/auth/googleAuth';
import Image from 'next/image';

const DEFAULT_REDIRECT = '/dashboard';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const redirect = searchParams.get('redirect') ?? DEFAULT_REDIRECT;
  const redirectTo = redirect.startsWith('/') ? redirect : DEFAULT_REDIRECT;

  useEffect(() => {
    if (user) {
      router.replace(redirectTo);
    }
  }, [user, router, redirectTo]);

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
      router.replace(redirectTo);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card principal */}
        <div className="bg-card text-card-foreground rounded-3xl shadow-xl p-8 md:p-12 border border-border">
          {/* Logo/Ícone */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-[150px] h-[150px] flex items-center justify-center shadow-lg">
              <Image
                src="/icons/icon-512.png"
                alt="Logo"
                width={100}
                height={100}
              />
            </div>
          </motion.div>

          {/* Título e Subtítulo */}
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
            className="w-full bg-card border-2 border-border rounded-xl py-4 px-6 flex items-center justify-center gap-3 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 group"
          >
            {/* Ícone do Google */}
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

          {/* Texto de segurança */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('login.secureLogin')}
          </p>

          {/* Indicador de segurança */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>{t('login.secureConnection')}</span>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>
            {t('login.termsPrefix')}{' '}
            <a href="#" className="text-primary hover:opacity-90 underline">
              {t('login.termsOfUse')}
            </a>{' '}
            {t('login.and')}{' '}
            <a href="#" className="text-primary hover:opacity-90 underline">
              {t('login.privacyPolicy')}
            </a>
          </p>
        </motion.div>
      </motion.div>
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
