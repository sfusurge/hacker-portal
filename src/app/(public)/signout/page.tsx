'use client';

import { signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';

import { useEffect } from 'react';

// this page is to force out signout client side (and delete cookie)
// such as when there is a live session that doesn't refer to a valid user in db.
export default function SignOutPage() {
    const session = useSession();
    const router = useRouter();
    useEffect(() => {
        if (session.status === 'authenticated') {
            signOut().then(() => {
                redirect('/login');
            });
        } else {
            router.replace('/login');
        }
    }, [session]);
    return <h1>Signing out...</h1>;
}
