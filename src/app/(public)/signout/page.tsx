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
            document.cookie.split(';').forEach((cookie) => {
                const name = cookie.split('=')[0].trim();
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            });
            signOut()
                .then(() =>
                    fetch('/signout/delete_cookies', {
                        method: 'post',
                    })
                )
                .then(() => {
                    console.log('called signout api');

                    redirect('/login');
                });
        } else {
            router.replace('/login');
        }
    }, [session]);
    return <h1>Signing out...</h1>;
}
