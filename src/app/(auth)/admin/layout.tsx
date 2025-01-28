import { ReactNode } from 'react';
import { getUserData } from '../layout';

export default async function Layout({ children }: { children: ReactNode }) {
    const userData = await getUserData();

    return <> </>;
}
