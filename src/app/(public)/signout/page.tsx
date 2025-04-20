'use client';

import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

// this page is to force out signout client side (and delete cookie)
// such as when there is a live session that doesn't refer to a valid user in db.
// aggressive cookie clear
export default function SignOutPage() {
    const [error, setError] = useState(false);

    useEffect(() => {
        const performSignOut = async () => {
            try {
                try {
                    // logout in server side
                    await fetch('/api/auth/signout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ callbackUrl: '/login' }),
                    });
                } catch (e) {
                    console.log('Direct API call failed, trying client method');
                }

                // client log out if server fails
                await signOut({
                    redirect: false,
                    callbackUrl: '/login',
                });

                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();

                    // Clear cookies aggressively
                    const cookies = document.cookie.split(';');

                    for (const cookie of cookies) {
                        const [name] = cookie.split('=');
                        const trimmedName = name.trim();

                        // Try multiple path and domain combinations to ensure cookies are cleared
                        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
                        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
                        document.cookie = `${trimmedName}=; max-age=0; path=/`;
                    }

                    // Try to clear next-auth specific cookies directly
                    [
                        'next-auth.session-token',
                        'next-auth.callback-url',
                        'next-auth.csrf-token',
                        '__Secure-next-auth.session-token',
                    ].forEach((cookieName) => {
                        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
                    });
                }

                window.location.replace(`/login`);
            } catch (err) {
                console.error('Error during sign out:', err);
                setError(true);
                // Still redirect even on error
                window.location.replace('/login');
            }
        };

        performSignOut();
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="mb-4 text-xl font-semibold">Signing out...</h1>
            {error && (
                <p className="text-red-500">
                    There was an issue signing out. Redirecting to login...
                </p>
            )}
        </div>
    );
}
