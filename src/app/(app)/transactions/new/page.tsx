'use client';

import { Suspense } from 'react';
import { NewTransactionPage } from './NewTransactionPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>}>
      <NewTransactionPage />
    </Suspense>
  );
}
