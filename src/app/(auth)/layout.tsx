import MobileBottomNav from '@/components/sidebar/MobileBottomNav';
import MobileTopNav from '@/components/sidebar/MobileTopNav';

import DesktopNav from '@/components/sidebar/DesktopNav';

import { ReactNode } from 'react';

import { auth } from '@/auth/auth';
import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { userDisplayIds } from '@/db/schema/userDisplayId';
import { CacheClearer } from '@/app/(auth)/CacheClear';
import { redirect } from 'next/navigation';
import { ClientAuthContext } from './ClientAuthContext';

export async function getUserData() {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
        return undefined;
    }

    const dbUser = (
        await databaseClient
            .select()
            .from(users)
            .limit(1)
            .where(eq(users.email, session.user?.email))
    )[0];

    if (!dbUser) {
        return undefined;
    }

    const displayId = (
        await databaseClient
            .select()
            .from(userDisplayIds)
            .where(eq(userDisplayIds.userId, dbUser.id))
    )[0];

    if (!displayId) {
        return undefined;
    }

    return {
        ...dbUser,
        displayId: displayId.displayId,
        image: session.user.image,
    };
}
export type MergedUserData = Awaited<ReturnType<typeof getUserData>>;

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
                    className="fixed top-0 left-0 z-100 md:hidden"
                ></MobileTopNav>
                <MobileBottomNav
                    initialData={initialUserData}
                    className="fixed bottom-0 left-0 z-100 md:hidden"
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
