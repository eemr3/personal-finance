'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

const STORAGE_KEY = 'personal-finance-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey={STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
