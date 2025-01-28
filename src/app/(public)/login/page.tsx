'use server';
import { auth, loginWithProvider, signIn, signOut } from '@/auth/auth';
import { Button } from '@/components/ui/button';
import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import { notFound, redirect, useSearchParams } from 'next/navigation';

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
                .from(users)
                .where(eq(users.email, session.user?.email!))
        )[0];
        if (!res) {
            // somehow this user isnt created, signout/invalidate the sesson
            await notFound();
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

    async function loginWithGoogle() {
        'use server';

        await signIn('google', {
            redirectTo: `/login${redirectTarget !== undefined ? '?from=' + encodeURIComponent(redirectTarget) : ''}`,
        });
    }

    async function loginWithGithub() {
        'use server';
        await signIn('github', {
            redirectTo: `/login${redirectTarget !== undefined ? '?from=' + encodeURIComponent(redirectTarget) : ''}`,
        });
    }

    return (
        <div id="auth" className="md:grid md:grid-cols-2 2xl:grid-cols-3">
            <div className="w-screen max-h-screen bg-neutral-925 h-screen p-6 flex flex-col gap-14 justify-center md:w-full 2xl:col-span-1">
                <div className="flex flex-col gap-8 justify-center">
                    <Image
                        src="/login/sparkcheffrizz.png"
                        width={80}
                        height={80}
                        className="rounded-lg mx-auto"
                        alt="Sparky wearing a chef\'s hat"
                    ></Image>

                    <div className="text-center">
                        <p className="font-semibold text-sm text-brand-400 mb-2">
                            Welcome
                        </p>
                        <h1 className="text-3xl font-semibold text-white text-balance leading-tight">
                            Sign in to the Surge portal
                        </h1>
                    </div>

                    <div className="flex flex-col gap-4 *:max-w-96 items-center w-full">
                        <form action={loginWithGoogle} className="w-full">
                            <Button
                                type="submit"
                                variant="default"
                                hierarchy="secondary"
                                size="cozy"
                                className="w-full"
                                leadingIcon="/icons/google.svg"
                                leadingIconAlt="Google logo"
                            >
                                Continue with Google
                            </Button>
                        </form>

                        <form action={loginWithGithub} className="w-full">
                            <Button
                                variant="default"
                                hierarchy="secondary"
                                size="cozy"
                                className="w-full"
                                leadingIcon="/icons/github.svg"
                                leadingIconAlt="GitHub logo"
                            >
                                Continue with GitHub
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
            <Image
                src="/login/journeyhacks-header-2x.png"
                alt="Stormy and Sparky are cooking."
                width={1920}
                height={1080}
                className="hidden md:block h-full object-cover 2xl:col-span-2"
            ></Image>
        </div>
    );
}
