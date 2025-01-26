import MobileBottomNav from '@/components/sidebar/MobileBottomNav';
import MobileTopNav from '@/components/sidebar/MobileTopNav';
import { ReactNode } from 'react';

export default function Layout({
    children,
    ...props
}: {
    children: ReactNode;
}) {
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
