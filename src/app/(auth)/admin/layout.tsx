import { ReactNode } from 'react';

import { notFound } from 'next/navigation';
import { getUserData } from '../layout';

export default async function Layout({ children }: { children: ReactNode }) {
    const userData = await getUserData();
    if (userData?.userRole !== 'admin') {
        return notFound();
    }
    return <>{children}</>;
}
