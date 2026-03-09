import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppearanceProvider } from '@/contexts/AppearanceContext';
import { I18nProvider } from '@/components/I18nProvider';
import { PeriodProvider } from '@/contexts/PeriodContext';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Personal Finance',
  description: 'Personal Finance',
  manifest: '/manifest.json',
  themeColor: '#0d1413',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinWise',
  },
  icons: {
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased font-sans`}
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
