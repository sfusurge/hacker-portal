import MobileBottomNav from '@/components/sidebar/MobileBottomNav';
import MobileTopNav from '@/components/sidebar/MobileTopNav';
import { getSession, useSession } from 'next-auth/react';
import { ReactNode } from 'react';

export default function Layout({
    children,
    ...props
}: {
    children: ReactNode;
}) {
    const session = useSession();
    console.log(session);

    return (
        <>
            <div className="bg-neutral-950 h-screen w-screen p-5">
                <MobileTopNav className="top-0 left-0 fixed z-[999]"></MobileTopNav>
                <MobileBottomNav className="bottom-0 left-0 fixed z-[999]"></MobileBottomNav>

                <main>{children}</main>
            </div>
        </>
    );
}
