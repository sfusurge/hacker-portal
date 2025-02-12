import MobileBottomNav from '@/components/sidebar/MobileBottomNav';
import MobileTopNav from '@/components/sidebar/MobileTopNav';
import { getSession, signOut, useSession } from 'next-auth/react';
import DesktopNav from '@/components/sidebar/DesktopNav';

import { ReactNode } from 'react';
import { atom, useAtomValue } from 'jotai';
import { atomWithRefresh } from 'jotai/utils';
import { auth } from '@/auth/auth';
import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { userDisplayIds } from '@/db/schema/userDisplayId';
import { CacheClearer } from './CacheClear';
import { redirect } from 'next/navigation';

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
            <div
                className="bg-neutral-950  p-6 sm:flex sm:p-0 sm:pr-5"
                style={{ height: '100dvh' }}
            >
                <CacheClearer initialData={initialUserData}></CacheClearer>
                <MobileTopNav
                    initialData={initialUserData}
                    className="top-0 left-0 fixed z-[100] sm:hidden"
                ></MobileTopNav>
                <MobileBottomNav className="bottom-0 left-0 fixed z-[100] sm:hidden"></MobileBottomNav>
                <DesktopNav
                    initialData={initialUserData}
                    className="hidden sm:block"
                ></DesktopNav>
                <main className="mt-20 sm:mt-20 pb-20 sm:max-h-screen sm:flex-1 sm:bg-neutral-925 sm:my-5 sm:p-10 sm:rounded-2xl sm:border sm:border-neutral-600/30 sm:overflow-y-auto">
                    {children}
                </main>
            </div>
        </>
    );
}
