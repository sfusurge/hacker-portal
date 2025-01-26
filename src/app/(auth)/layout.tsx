import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <h1>TODO REPLACE WITH HEADER FOOT NAVBARS ETC</h1>
            <main>{children}</main>
        </>
    );
}
