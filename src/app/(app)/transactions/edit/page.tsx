'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EditTransactionPage } from './EditTransactionPage';

/**
 * Rota estática /transactions/edit?id=xxx para compatibilidade com output: 'export'.
 * IDs vêm do Firebase em runtime, então não podem ser pré-gerados em generateStaticParams.
 */
export default function EditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  useEffect(() => {
    if (!id) {
      router.replace('/transactions');
    }
  }, [id, router]);

  if (!id) {
    return null;
  }

  return <EditTransactionPage id={id} />;
}
