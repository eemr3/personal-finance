'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, getRedirectResult, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase-client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase user:', firebaseUser);
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function logout() {
    await signOut(auth);
  }
  // useEffect(() => {
  //   async function initAuth() {
  //     try {
  //       const result = await getRedirectResult(auth);

  //       if (result?.user) {
  //         console.log('Redirect login success:', result.user);
  //       }
  //     } catch (error) {
  //       console.error('Redirect error:', error);
  //     }

  //     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
  //       console.log('Firebase user:', firebaseUser);
  //       setUser(firebaseUser);
  //       setLoading(false);
  //     });

  //     return unsubscribe;
  //   }

  //   initAuth();
  // }, []);

  return { user, loading, logout };
}
