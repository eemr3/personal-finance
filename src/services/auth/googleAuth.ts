import { Capacitor } from '@capacitor/core';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from '@/lib/firebase/firebase-client';

export async function signInWithGoogle() {
  if (typeof window === 'undefined') return;

  // No Capacitor (Android/iOS): usar auth nativa
  // useCredentialManager: false evita Chrome Custom Tab que fica preso no Firebase auth handler
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithGoogle({
      useCredentialManager: false,
    });
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error('Falha ao obter token do Google');
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
    return;
  }

  // Web: usar popup normalmente
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function logout() {
  if (Capacitor.isNativePlatform()) {
    await FirebaseAuthentication.signOut();
  }
  await signOut(auth);
}
