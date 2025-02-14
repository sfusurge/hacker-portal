import { ReactNode } from 'react';
import { getUserData } from '../home/layout';
import { notFound } from 'next/navigation';

export default async function Layout({ children }: { children: ReactNode }) {
    const userData = await getUserData();
    if (userData?.userRole !== 'admin') {
        return notFound();
    }
    return <>{children}</>;
}
