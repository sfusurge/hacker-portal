import { connection } from 'next/server';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { requireSponsorPublicAccessForPath } from '@/lib/sponsor/publicSponsorAccess';
import PublicSponsorShell from '@/components/sponsor/PublicSponsorShell';
import PublicStatisticsClient from '../PublicStatisticsClient';

// Allow blocking render (token/cookie gated).
export const instant = false;

export default async function PublicSponsorStatisticsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    await connection();
    const params = await searchParams;
    const session = await requireSponsorPublicAccessForPath(
        params,
        '/sponsor/statistics'
    );

    const activeHackathon = await getCachedActiveHackathon();
    if (!activeHackathon) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
                <p className="text-white/60">No active hackathon found.</p>
            </div>
        );
    }

    return (
        <PublicSponsorShell
            sponsorName={session.name}
            hackathonData={activeHackathon}
        >
            <PublicStatisticsClient
                hackathonId={activeHackathon.id}
                hackathonName={activeHackathon.name}
            />
        </PublicSponsorShell>
    );
}
