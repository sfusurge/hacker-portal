import { connection } from 'next/server';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { createCaller } from '@/server/appRouter';
import { requireSponsorPublicToken } from '@/lib/sponsor/publicSponsorAccess';
import PublicSponsorShell from '@/components/sponsor/PublicSponsorShell';
import PublicHomeClient from './PublicHomeClient';

export default async function PublicSponsorHomePage({
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

    const trpc = createCaller({});
    const events = await trpc.events.getPublicSponsorEvents({
        hackathonId: activeHackathon.id,
        token,
    });

    return (
        <PublicSponsorShell token={token} hackathonData={activeHackathon}>
            <PublicHomeClient
                token={token}
                hackathon={activeHackathon}
                events={events}
            />
        </PublicSponsorShell>
    );
}
