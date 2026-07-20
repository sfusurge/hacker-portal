import { ReactNode, Suspense } from 'react';

import { notFound } from 'next/navigation';
import { getCachedUserData } from '@/server/getCachedUserData';
import { hasAdminAccess } from '@/lib/auth/roles';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={null}>
            <AdminRoleGate>{children}</AdminRoleGate>
        </Suspense>
    );
}

async function AdminRoleGate({ children }: { children: ReactNode }) {
    const userData = await getCachedUserData();
    if (!hasAdminAccess(userData?.userRole)) {
        return notFound();
    }
    return <>{children}</>;
}
