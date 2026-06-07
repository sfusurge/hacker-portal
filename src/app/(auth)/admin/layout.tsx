import { ReactNode, Suspense } from 'react';

import { notFound } from 'next/navigation';
import { getCachedUserData } from '@/server/getCachedUserData';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={null}>
            <AdminRoleGate>{children}</AdminRoleGate>
        </Suspense>
    );
}

async function AdminRoleGate({ children }: { children: ReactNode }) {
    const userData = await getCachedUserData();
    if (userData?.userRole !== 'admin') {
        return notFound();
    }
    return <>{children}</>;
}
