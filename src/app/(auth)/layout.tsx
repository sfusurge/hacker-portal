import MobileBottomNav from '@/components/sidebar/MobileBottomNav';
import MobileTopNav from '@/components/sidebar/MobileTopNav';

import DesktopNav from '@/components/sidebar/DesktopNav';

import { ReactNode } from 'react';

import { CacheClearer } from '@/app/(auth)/CacheClear';
import { redirect } from 'next/navigation';
import { ClientAuthContext } from './ClientAuthContext';
import { getUserData } from '@/server/routers/usersRouter';

export default async function Layout({ children }: { children: ReactNode }) {
    const initialUserData = await getUserData();

    if (!initialUserData) {
        return redirect('/signout');
    }

    return (
        <>
            <ClientAuthContext userData={initialUserData} />
            <div
                className="bg-neutral-950 p-0 md:flex md:p-5"
                style={{ height: '100dvh' }}
            >
                <CacheClearer initialData={initialUserData} />
                <MobileTopNav
                    initialData={initialUserData}
                    className="fixed top-0 left-0 z-100 md:hidden"
                />
                <MobileBottomNav
                    initialData={initialUserData}
                    className="fixed bottom-0 left-0 z-100 md:hidden"
                />
                <DesktopNav
                    initialData={initialUserData}
                    className="hidden md:block"
                />
                <main className="md:bg-neutral-925 mt-20 max-h-screen flex-1 p-6 md:mt-0 md:overflow-y-auto md:rounded-2xl md:border md:border-neutral-600/30 md:p-10">
                    {children}
                </main>
            </div>
        </>
    );
}
