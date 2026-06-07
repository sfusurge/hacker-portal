import { ReactNode, Suspense } from 'react';

import { notFound } from 'next/navigation';
import { getCachedUserData } from '@/server/getCachedUserData';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={null}>
            <SponsorRoleGate>{children}</SponsorRoleGate>
        </Suspense>
    );
}

async function SponsorRoleGate({ children }: { children: ReactNode }) {
    const userData = await getCachedUserData();
    if (userData?.userRole !== 'sponsor' && userData?.userRole !== 'admin') {
        return notFound();
    }
    return <>{children}</>;
}
