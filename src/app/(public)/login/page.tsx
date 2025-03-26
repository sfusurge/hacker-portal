'use server';
import { auth, signIn, signOut } from '@/auth/auth';
import { Button } from '@/components/ui/button';
import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users/users';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';

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
            <div className="bg-neutral-925 flex h-screen max-h-screen w-screen flex-col justify-center gap-14 p-6 md:w-full 2xl:col-span-1">
                <div className="flex flex-col justify-center gap-8">
                    <Image
                        src="/login/sparkcheffrizz.webp"
                        width={80}
                        height={80}
                        className="mx-auto rounded-lg"
                        alt="Sparky wearing a chef\'s hat"
                    ></Image>

                    <div className="flex w-full flex-col items-center gap-4 text-center *:max-w-96">
                        <p className="text-brand-400 mb-2 text-center text-sm font-semibold">
                            Welcome
                        </p>
                        <h1 className="text-balance text-center text-3xl font-semibold leading-tight text-white">
                            Sign in to the Surge Portal to apply to our events
                        </h1>
                    </div>

                    <div className="flex w-full flex-col items-center gap-4 *:max-w-96">
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
                src="/login/journeyhacks-header-2x.webp"
                alt="Stormy and Sparky are cooking."
                width={1920}
                height={1080}
                className="hidden h-full object-cover md:block 2xl:col-span-2"
            ></Image>
        </div>
    );
}
