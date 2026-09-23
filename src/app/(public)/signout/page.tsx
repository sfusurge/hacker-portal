import { safePortalReturnTarget } from '@/auth/returnTarget';
import SignOutContent from './SignOutContent';

export default async function SignOutPage({
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
