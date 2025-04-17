'use server';
import { auth, signIn } from '@/auth/auth';
import { databaseClient } from '@/db/client';
import { user } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import LoginContainer from '@/components/login/LoginContainer';
import type { OAuthProvider } from '@/components/login/constants';

export default async function Login({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const redirectTarget = (await searchParams)['from'] as string;
    const session = await auth();

    if (session) {
        // user already logged in

        // check if user needs to input personal info still
        const res = (
            await databaseClient
                .select()
                .from(user)
                .where(eq(user.email, session.user?.email!))
        )[0];

        if (!res) {
            // somehow this user isnt created, signout/invalidate the sesson
            // await notFound();
            return redirect('/signout');
        }

        if (!res.firstName || !res.lastName || !res.phoneNumber) {
            // user info isn't filled out, redirect to userinfo
            let target = '/login/userinfo';
            if (redirectTarget) {
                target = `${target}?from=${encodeURIComponent(redirectTarget)}`;
            }
            return redirect(target);
        }

        // user info is all filled
        if (redirectTarget) {
            return redirect(redirectTarget);
        }

        // no target specified = default home
        return redirect('/home');
    }
    async function loginWithProvider(provider: OAuthProvider) {
        'use server';
        const redirectPath = `/login${redirectTarget ? '?from=' + encodeURIComponent(redirectTarget) : ''}`;

        await signIn(provider.toLowerCase(), { redirectTo: redirectPath });
    }

    async function loginWithNodeMail(formData: FormData) {
        'use server';
        await signIn('nodemailer', {
            email: formData.get('email'),
            redirect: false,
        });
        return { success: true, email: formData.get('email') as string };
    }

    return (
        <div
            id="auth"
            className="relative h-[100dvh] w-[100dvw] overflow-hidden"
        >
            <div className="block h-full w-full bg-[#C4D086] lg:hidden"></div>
            <Image
                src="/login/journeyhacks-header-2x.webp"
                alt="Stormy and Sparky are cooking."
                fill
                className="absolute hidden h-full w-full object-cover lg:block"
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
