import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Provider from '@/trpc/Provider';
import NextAuthSessionProvider from './components/auth/NextAuthSessionProvider';
import AuthButton from './components/auth/AuthButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hacker Portal',
  description:
    "The all-in-one hub for SFU Surge's events, including, but not limited to StormHacks, JourneyHacks, and various workshops and events!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <AuthButton />
          <Provider>{children}</Provider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
