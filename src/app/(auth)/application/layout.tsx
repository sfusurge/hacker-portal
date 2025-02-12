import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
    // FIXME: manually prevent applications for now

    return redirect('/home');

    return <>{children}</>;
}
