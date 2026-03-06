'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/firebase-client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useFixedExpenseRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const collectionRef = collection(db, 'fixedExpenseRules');

  async function fetchRules() {
    if (!user?.uid) {
      setRules([]);
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collectionRef,
        where('userId', '==', user.uid),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setRules(data);
    } finally {
      setLoading(false);
    }
  }

  async function addRule(rule: Record<string, unknown>) {
    if (!user?.uid) return;
    await addDoc(collectionRef, {
      ...rule,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    await fetchRules();
  }

  async function updateRule(id: string, rule: Record<string, unknown>) {
    const docRef = doc(db, 'fixedExpenseRules', id);
    const { userId: _uid, ...rest } = rule as Record<string, unknown>;
    await updateDoc(docRef, rest);
    await fetchRules();
  }

  async function deleteRule(id: string) {
    const docRef = doc(db, 'fixedExpenseRules', id);
    await deleteDoc(docRef);
    await fetchRules();
  }

  useEffect(() => {
    fetchRules();
  }, [user?.uid]);

  return {
    rules,
    loading,
    fetchRules,
    addRule,
    updateRule,
    deleteRule,
  };
}
