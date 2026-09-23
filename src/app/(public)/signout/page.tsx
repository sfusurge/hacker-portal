import { Suspense } from 'react';
import { safePortalReturnTarget } from '@/auth/returnTarget';
import SignOutContent from './SignOutContent';

async function SignOutPageContent({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    return (
        <SignOutContent
            redirectTo={safePortalReturnTarget(params.from) ?? '/login'}
        />
    );
}

export default function SignOutPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    return (
        <Suspense fallback={<p>Signing out...</p>}>
            <SignOutPageContent searchParams={searchParams} />
        </Suspense>
    );
}
