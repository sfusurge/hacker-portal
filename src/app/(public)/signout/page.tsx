'use client';

import { signOut, useSession } from 'next-auth/react';

// this page is to force out signout client side (and delete cookie)
// such as when there is a live session that doesn't refer to a valid user in db.
export default function SignOutPage() {
    const session = useSession();

    if (session) {
        signOut({
            redirectTo: '/login',
        });
    }
    return <h1>Signing out...</h1>;
}
