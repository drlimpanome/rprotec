import * as React from 'react';
import type { Viewport, Metadata } from 'next';

import '@/styles/global.css';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: 'JMFC Dashboard',
  description: 'Dashboard de calibração e análise de compras',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/assets/img/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/img/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/assets/img/apple-touch-icon.png',
  },
};

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/assets/img/site.webmanifest" />
        <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
        <meta name="theme-color" content="#0B0427" />
      </head>
      <body>
        <LocalizationProvider>
          <UserProvider>
            <ThemeProvider>{children}</ThemeProvider>
            <ToastContainer />
          </UserProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
