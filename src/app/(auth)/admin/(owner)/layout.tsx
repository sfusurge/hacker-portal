import { ReactNode, Suspense } from 'react';

import { notFound } from 'next/navigation';
import { getCachedUserData } from '@/server/getCachedUserData';
import { isOwner } from '@/lib/auth/roles';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={null}>
            <OwnerRoleGate>{children}</OwnerRoleGate>
        </Suspense>
    );
}

async function OwnerRoleGate({ children }: { children: ReactNode }) {
    const userData = await getCachedUserData();
    if (!isOwner(userData?.userRole)) {
        return notFound();
    }
    return <>{children}</>;
}
