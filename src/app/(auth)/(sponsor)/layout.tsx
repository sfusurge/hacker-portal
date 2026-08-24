import { ReactNode, Suspense } from 'react';

import { notFound } from 'next/navigation';
import { getCachedUserData } from '@/server/getCachedUserData';
import { hasAdminAccess } from '@/lib/auth/roles';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={null}>
            <SponsorRoleGate>{children}</SponsorRoleGate>
        </Suspense>
    );
}

async function SponsorRoleGate({ children }: { children: ReactNode }) {
    const userData = await getCachedUserData();
    if (
        userData?.userRole !== 'sponsor' &&
        !hasAdminAccess(userData?.userRole)
    ) {
        return notFound();
    }
    return <>{children}</>;
}
