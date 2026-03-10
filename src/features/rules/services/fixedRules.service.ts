import { db } from '@/lib/firebase/firebase-client';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';

export async function createFixedExpenseRule(rule: any) {
  try {
    const docRef = await addDoc(collection(db, 'fixedExpenseRules'), {
      ...rule,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving rule', error);
    throw error;
  }
}

export async function getFixedExpenseRules() {
  const snapshot = await getDocs(collection(db, 'fixedExpenseRules'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
