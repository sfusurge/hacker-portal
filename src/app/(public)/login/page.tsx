'use server';
// Import signOut along with auth and signIn
import { auth, signIn, signOut } from '@/auth/auth';
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

    if (session && session.user?.email) {
        const normalizedEmail = session.user.email.toLowerCase();

        try {
            const res = (
                await databaseClient
                    .select()
                    .from(user)
                    .where(eq(user.email, normalizedEmail))
            )[0];

            if (!res) {
                console.error(
                    `User ${normalizedEmail} exists in session but not in database - forcing signout`
                );
                await signOut({ redirect: true, redirectTo: '/login' });
                return null;
            }

            if (res.email.toLowerCase() !== normalizedEmail) {
                console.error(
                    `Session email (${normalizedEmail}) doesn't match database email (${res.email.toLowerCase()}) - forcing signout`
                );
                await signOut({ redirect: true, redirectTo: '/login' });
                return null;
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
        } catch (error) {
            if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
                throw error;
            }

            console.error('Error checking user in database:', error);
            await signOut({
                redirect: true,
                redirectTo: '/login?error=DatabaseError',
            });
            return null;
        }
    }

    async function loginWithProvider(provider: OAuthProvider) {
        'use server';
        const redirectPath = `/login${redirectTarget ? '?from=' + encodeURIComponent(redirectTarget) : ''}`;
        await signIn(provider.toLowerCase(), { redirectTo: redirectPath });
    }

    async function loginWithNodeMail(formData: FormData) {
        'use server';
        // Normalize email to lowercase
        const email = (formData.get('email') as string)?.toLowerCase();

        if (!email) {
            return { success: false, email: '', error: 'Email is required' };
        }

        try {
            await signIn('nodemailer', {
                email: email,
                redirect: false,
            });
            return { success: true, email: email };
        } catch (error) {
            console.error('Error sending login email:', error);
            return {
                success: false,
                email: email,
                error: 'Failed to send login email. Please try again.',
            };
        }
    }

    return (
        <div
            id="auth"
            className="relative h-[100dvh] w-[100dvw] overflow-hidden"
        >
            <Image
                src="/login/SparkJamOtterTableHeader.png"
                alt="Stormy and Sparky in B&W drawings."
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
