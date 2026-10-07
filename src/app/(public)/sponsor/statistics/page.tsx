import { connection } from 'next/server';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { requireSponsorPublicToken } from '@/lib/sponsor/publicSponsorAccess';
import PublicSponsorShell from '@/components/sponsor/PublicSponsorShell';
import PublicStatisticsClient from '../PublicStatisticsClient';

export default async function PublicSponsorStatisticsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    await connection();
    const params = await searchParams;
    const token = requireSponsorPublicToken(params);

    const activeHackathon = await getCachedActiveHackathon();
    if (!activeHackathon) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
                <p className="text-white/60">No active hackathon found.</p>
            </div>
        );
    }

    return (
        <PublicSponsorShell token={token} hackathonData={activeHackathon}>
            <PublicStatisticsClient
                hackathonId={activeHackathon.id}
                hackathonName={activeHackathon.name}
                token={token}
            />
        </PublicSponsorShell>
    );
}
