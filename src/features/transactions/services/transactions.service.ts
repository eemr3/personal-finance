import { db } from '@/lib/firebase/firebase-client';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  deleteDoc,
  where,
} from 'firebase/firestore';
import type { Period } from '@/lib/period';
import { isTransactionInPeriod } from '@/lib/period';

export async function createTransaction(
  data: Record<string, unknown>,
  userId: string,
): Promise<string> {
  const docRef = await addDoc(collection(db, 'transactions'), {
    ...data,
    userId,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getTransactions(
  userId: string | null,
  period?: Period | null,
) {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);

    let results = querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    if (period) {
      results = results.filter((t) =>
        isTransactionInPeriod(
          t as { date?: string; createdAt?: { toDate?: () => Date } },
          period,
        ),
      );
    }

    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateTransaction(
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const docRef = doc(db, 'transactions', id);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
}

export async function deleteTransaction(id: string): Promise<void> {
  const docRef = doc(db, 'transactions', id);
  await deleteDoc(docRef);
}
