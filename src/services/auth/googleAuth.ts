import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase-client';

let initialized = false;
let lastIdToken: string | null = null; // ✅ guardar para biometria
let lastAccessToken: string | null = null; // ✅ guardar para biometria

async function ensureInitialized() {
  if (!initialized && Capacitor.isNativePlatform()) {
    await SocialLogin.initialize({
      google: {
        webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      },
    });
    initialized = true;
  }
}

// ✅ Exportar para uso na tela de login ao salvar biometria
export function getLastGoogleTokens() {
  return { idToken: lastIdToken, accessToken: lastAccessToken };
}

export async function signInWithGoogle(): Promise<UserCredential> {
  if (Capacitor.isNativePlatform()) {
    await ensureInitialized();

    const response = await SocialLogin.login({
      provider: 'google',
      options: {},
    });

    const googleResult = response.result;
    if (!googleResult) throw new Error('Google Sign-In falhou: resultado ausente');
    if (googleResult.responseType !== 'online')
      throw new Error('responseType não é online');

    const idToken = googleResult.idToken;
    const accessToken = googleResult.accessToken?.token ?? null;
    if (!idToken) throw new Error('Google Sign-In falhou: idToken ausente');

    // ✅ Guardar tokens para uso posterior na biometria
    lastIdToken = idToken;
    lastAccessToken = accessToken;

    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    return signInWithCredential(auth, credential);
  }

  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function logout() {
  if (Capacitor.isNativePlatform()) {
    try {
      await SocialLogin.logout({ provider: 'google' });
    } catch (_) {}
  }
  lastIdToken = null;
  lastAccessToken = null;
  await signOut(auth);
}
