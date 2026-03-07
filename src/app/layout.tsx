import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppearanceProvider } from '@/contexts/AppearanceContext';
import { I18nProvider } from '@/components/I18nProvider';
import { PeriodProvider } from '@/contexts/PeriodContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Personal Finance',
  description: 'Personal Finance',
  manifest: '/manifest.json',
  themeColor: '##10b981',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AppearanceProvider>
            <I18nProvider>
              <PeriodProvider>{children}</PeriodProvider>
            </I18nProvider>
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
