import { ReactNode } from 'react';
import { CacheClearer } from '@/app/(auth)/CacheClear';
import { redirect } from 'next/navigation';
import { ClientContext } from './ClientContext';
import { getUserData } from '@/server/routers/usersRouter';
import { createCaller } from '@/server/appRouter';

import ClientLayoutWrapper from './ClientLayoutWrapper';
import MobileTopNav from '@/components/sidebar/MobileTopNav';
import SideBar from '@/components/sidebar/SideBar';

export default async function Layout({ children }: { children: ReactNode }) {
    const trpcClient = createCaller({});
    const [hackathon, userData] = await Promise.all([
        trpcClient.hackathons.getActiveHackathon(),
        getUserData(),
    ]);

    if (!userData) {
        return redirect('/signout');
    }

    return (
        <ClientContext userData={userData} hackathonData={hackathon}>
            <ClientLayoutWrapper>
                <CacheClearer initialData={userData} />
                <MobileTopNav
                    initialData={userData}
                    className="fixed top-0 left-0 z-100 md:hidden"
                >
                    <SideBar initialData={userData} className="h-full" />
                </MobileTopNav>
                <main className="md:bg-neutral-925 mt-20 max-h-screen flex-1 p-6 md:mt-0 md:overflow-y-auto md:rounded-2xl md:border md:border-neutral-600/30 md:p-10">
                    {children}
                </main>
            </ClientLayoutWrapper>
        </ClientContext>
    );
}
