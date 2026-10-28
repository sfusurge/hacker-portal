import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { getPublicHackathonOptions } from '@/server/statistics/getPublicHackathonOptions';
import StatisticsRangeClient from './StatisticsRangeClient';

export const metadata = {
    title: 'Statistics Range | SFU Surge',
};

// Public page: reachable while MAINTENANCE=true (see src/lib/maintenance.ts).
export default async function PublicStatisticsRangePage() {
    const [activeHackathon, hackathons] = await Promise.all([
        getCachedActiveHackathon(),
        getPublicHackathonOptions(),
    ]);

    return (
        <div className="min-h-screen bg-neutral-950 px-6 py-10">
            <div className="mx-auto w-full max-w-6xl">
                <StatisticsRangeClient
                    hackathons={hackathons}
                    defaultHackathonId={activeHackathon?.id ?? null}
                />
            </div>
        </div>
    );
}
