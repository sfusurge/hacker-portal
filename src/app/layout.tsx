import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Provider from '@/trpc/Provider';
import { SessionProvider } from 'next-auth/react';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'SFU Surge Portal',
    description:
        "The all-in-one hub for SFU Surge's events, including, but not limited to StormHacks, JourneyHacks, and various workshops and events!",
    openGraph: {
        images: [
            {
                url: 'https://portal.sfusurge.com/hacker-portal-preview.webp', // Must be an absolute URL
                width: 500,
                height: 262,
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <link rel="icon" href="/favicon.png" sizes="any" />
            <body className={inter.className}>
                <SessionProvider>
                    <Provider>{children}</Provider>
                </SessionProvider>
            </body>
            <GoogleAnalytics gaId="G-99DQSJDLRK" />
        </html>
    );
}
