import MobileBottomNav from '@/components/sidebar/MobileBottomNav';
import MobileTopNav from '@/components/sidebar/MobileTopNav';
import { getSession, useSession } from 'next-auth/react';
import DesktopNav from '@/components/sidebar/DesktopNav';

import { ReactNode } from 'react';

export default function Layout({
    children,
    ...props
}: {
    children: ReactNode;
}) {
    return (
        <div className="bg-neutral-950 h-screen p-6 md:flex md:p-0 md:pr-5 overflow-hidden">
            <div className="min-w-72">
                <MobileTopNav className="top-0 left-0 fixed z-[999] md:hidden"></MobileTopNav>
                <MobileBottomNav className="bottom-0 left-0 fixed z-[999] md:hidden"></MobileBottomNav>
                <DesktopNav className="hidden md:block"></DesktopNav>
            </div>

            <main className="mt-20 pb-20 md:max-h-screen md:max-w-full md:bg-neutral-925 md:my-5 md:p-10 md:rounded-2xl md:border md:border-neutral-600/30 overflow-auto">
                {children}
            </main>
        </div>
    );
}
