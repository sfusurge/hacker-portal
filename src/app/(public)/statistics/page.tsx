import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import PublicStatisticsClient from '@/app/(public)/sponsor/PublicStatisticsClient';

export const metadata = {
    title: 'Application Statistics | SFU Surge',
};

// Public page: reachable while MAINTENANCE=true (see src/lib/maintenance.ts).
export default async function PublicStatisticsPage() {
    const activeHackathon = await getCachedActiveHackathon();

    return (
        <div className="min-h-screen bg-neutral-950 px-6 py-10">
            <div className="mx-auto w-full max-w-6xl">
                {activeHackathon ? (
                    <PublicStatisticsClient
                        hackathonId={activeHackathon.id}
                        hackathonName={activeHackathon.name}
                    />
                ) : (
                    <p className="text-sm text-white/60">
                        No active hackathon found.
                    </p>
                )}
            </div>
        </div>
    );
}
