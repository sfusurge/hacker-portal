import MobileBottomNav from '@/components/sidebar/MobileBottomNav';
import MobileTopNav from '@/components/sidebar/MobileTopNav';

import DesktopNav from '@/components/sidebar/DesktopNav';

import { ReactNode } from 'react';

import { auth } from '@/auth/auth';
import { databaseClient } from '@/db/client';
import { getUserData, users } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';

import { CacheClearer } from '@/app/(auth)/CacheClear';
import { redirect } from 'next/navigation';
import { ClientAuthContext } from './ClientAuthContext';

export default async function Layout({ children }: { children: ReactNode }) {
    const initialUserData = await getUserData();

    if (!initialUserData) {
        return await redirect('/signout');
    }

    return (
        <>
            <ClientAuthContext userData={initialUserData}></ClientAuthContext>
            <div
                className="bg-neutral-950 p-6 md:flex md:p-0 md:pr-5"
                style={{ height: '100dvh' }}
            >
                <CacheClearer initialData={initialUserData}></CacheClearer>
                <MobileTopNav
                    initialData={initialUserData}
                    className="z-100 fixed left-0 top-0 md:hidden"
                ></MobileTopNav>
                <MobileBottomNav
                    initialData={initialUserData}
                    className="z-100 fixed bottom-0 left-0 md:hidden"
                ></MobileBottomNav>
                <DesktopNav
                    initialData={initialUserData}
                    className="hidden md:block"
                ></DesktopNav>
                <main
                    style={{
                        marginTop: 'var(--paddingTop)',
                        height: 'calc(100% - var(--paddingTop))',
                    }}
                    className="md:bg-neutral-925 mt-20 pb-20 md:my-5 md:max-h-screen md:flex-1 md:overflow-y-auto md:rounded-2xl md:border md:border-neutral-600/30 md:p-10"
                >
                    {children}
                </main>
            </div>
        </>
    );
}
