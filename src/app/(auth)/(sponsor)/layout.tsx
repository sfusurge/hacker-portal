import { ReactNode } from 'react';

import { notFound } from 'next/navigation';
import { getCachedUserData } from '@/server/getCachedUserData';

export default async function Layout({ children }: { children: ReactNode }) {
    const userData = await getCachedUserData();
    if (userData?.userRole !== 'sponsor' && userData?.userRole !== 'admin') {
        return notFound();
    }
    return <>{children}</>;
}
