import { getCachedUserData } from '@/server/getCachedUserData';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import SponsorConfirmDialog from '@/components/sponsor/SponsorConfirmDialog';

export default async function SponsorPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const userData = await getCachedUserData();

    if (!userData) {
        redirect('/login');
    }

    // determine sponsor type based on bypass code
    let sponsorType: string | null = null;
    let isValidBypass = false;
    let bypassCode: string | null = null;

    if (params['tier']) {
        bypassCode = params['tier'] as string;

        if (process.env.PLATSPONSOR && bypassCode === process.env.PLATSPONSOR) {
            sponsorType = 'plat';
            isValidBypass = true;
        } else if (
            process.env.GOLDSPONSOR &&
            bypassCode === process.env.GOLDSPONSOR
        ) {
            sponsorType = 'gold';
            isValidBypass = true;
        } else if (
            process.env.TITLESPONSOR &&
            bypassCode === process.env.TITLESPONSOR
        ) {
            sponsorType = 'title';
            isValidBypass = true;
        }
    }

    // show error, when wrong bypass
    if (!isValidBypass || !sponsorType || !bypassCode) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-8">
                <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-neutral-600/30 bg-neutral-900 p-8 sm:max-w-[26.5rem]">
                    <div className="bg-danger-900/30 flex h-16 w-16 items-center justify-center rounded-full">
                        <ExclamationCircleIcon className="text-danger-500 h-8 w-8" />
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="text-2xl font-semibold text-white">
                            Invalid Sponsor Link
                        </h1>
                        <p className="text-sm leading-normal text-white/60">
                            This sponsor activation link is invalid or expired.
                            Please check the link or contact an administrator
                            for a new one.
                        </p>
                    </div>
                    <Button
                        variant="brand"
                        size="cozy"
                        hierarchy="primary"
                        className="w-full"
                    >
                        <a href="/home">Return to home</a>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <SponsorConfirmDialog
            sponsorType={sponsorType}
            bypassCode={bypassCode}
            userFirstName={userData.firstName || ''}
            userLastName={userData.lastName || ''}
            isAlreadySponsor={userData.userRole === 'sponsor'}
            userId={userData.id}
        />
    );
}
