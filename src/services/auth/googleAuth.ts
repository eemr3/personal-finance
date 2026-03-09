import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase-client';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  if (typeof window !== 'undefined') {
    await signInWithPopup(auth, provider);
  } else {
    await signInWithRedirect(auth, provider);
  }
}

export async function logout() {
  await signOut(auth);
}
