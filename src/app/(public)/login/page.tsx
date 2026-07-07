import { auth, getSession } from '@/auth/auth';
import { databaseClient } from '@/db/client';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import LoginContainer from '@/components/login/LoginContainer';
import type { OAuthProvider } from '@/components/login/constants';

export default function Login({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    return (
        <Suspense fallback={null}>
            <LoginContent searchParams={searchParams} />
        </Suspense>
    );
}

async function LoginContent({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const redirectTarget = (await searchParams)['from'] as string;
    const session = await getSession();

    if (session) {
        const res = (
            await databaseClient
                .select()
                .from(user)
                .where(eq(user.email, session.user?.email!))
        )[0];

        if (!res) {
            return redirect('/signout');
        }

        if (!res.firstName || !res.lastName || !res.phoneNumber) {
            let target = '/login/userinfo';
            if (redirectTarget) {
                target = `${target}?from=${encodeURIComponent(redirectTarget)}`;
            }
            return redirect(target);
        }

        if (redirectTarget) {
            return redirect(redirectTarget);
        }

        return redirect('/home');
    }

    async function loginWithProvider(provider: OAuthProvider) {
        'use server';
        const redirectPath = `/login${redirectTarget ? '?from=' + encodeURIComponent(redirectTarget) : ''}`;
        const providerId = provider.toLowerCase();
        const requestHeaders = await headers();

        const result = await auth.api.signInSocial({
            body: {
                provider: providerId,
                callbackURL: redirectPath,
                disableRedirect: true,
            },
            headers: requestHeaders,
        });

        if (result.url) {
            redirect(result.url);
        }
    }

    async function loginWithNodeMail(formData: FormData) {
        'use server';
        await auth.api.signInMagicLink({
            body: {
                email: formData.get('email') as string,
                callbackURL: '/login',
            },
            headers: await headers(),
        });
        return { success: true, email: formData.get('email') as string };
    }

    return (
        <div
            id="auth"
            className="relative h-[100dvh] w-[100dvw] overflow-hidden"
        >
            <Image
                src="/dashboard/sparkjamhead26.webp"
                alt="Sparky Studying"
                fill
                className="absolute h-full w-full object-cover"
                priority
            />

            <div className="absolute inset-0 flex h-full items-center justify-center p-0 sm:justify-start sm:p-4">
                <div className="bg-neutral-925 flex h-full w-full flex-col overflow-y-auto p-6 sm:max-h-[95vh] sm:rounded-xl sm:p-24 sm:py-10 lg:max-w-[35rem]">
                    <div className="flex flex-1 items-center">
                        <LoginContainer
                            loginWithNodeMail={loginWithNodeMail}
                            loginWithProvider={loginWithProvider}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
