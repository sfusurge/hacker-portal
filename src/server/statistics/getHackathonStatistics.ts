import { cacheLife, cacheTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import { applications } from '@/db/schema/applications';
import { hackathons } from '@/db/schema/hackathons';
import {
    buildDemographicPieCharts,
    type ApplicationForStats,
    type DemographicPieCharts,
} from '@/lib/statistics/buildDemographicStats';

export type HackathonStatistics = {
    hackathonId: number;
    generatedAt: string;
    counts: {
        all: number;
        accepted: number;
    };
    datasets: {
        all: DemographicPieCharts;
        accepted: DemographicPieCharts;
    };
};

export function hackathonStatisticsTag(hackathonId: number) {
    return `hackathon-stats-${hackathonId}`;
}

async function loadHackathonStatistics(
    hackathonId: number
): Promise<HackathonStatistics | null> {
    const [hackathon] = await databaseClient
        .select({
            id: hackathons.id,
            applicationQuestions: hackathons.applicationQuestions,
        })
        .from(hackathons)
        .where(eq(hackathons.id, hackathonId));

    if (!hackathon) return null;

    const applicationsResult = await databaseClient
        .select({
            response: applications.response,
            currentStatus: applications.currentStatus,
        })
        .from(applications)
        .where(eq(applications.hackathonId, hackathonId));

    const allApps: ApplicationForStats[] = applicationsResult.map((app) => ({
        currentStatus: app.currentStatus,
        response:
            app.response && typeof app.response === 'object'
                ? (app.response as Record<string, unknown>)
                : {},
    }));

    const acceptedApps = allApps.filter(
        (app) => app.currentStatus === 'Accepted'
    );

    return {
        hackathonId,
        generatedAt: new Date().toISOString(),
        counts: {
            all: allApps.length,
            accepted: acceptedApps.length,
        },
        datasets: {
            all: buildDemographicPieCharts(
                hackathon.applicationQuestions,
                allApps
            ),
            accepted: buildDemographicPieCharts(
                hackathon.applicationQuestions,
                acceptedApps
            ),
        },
    };
}

export async function getHackathonStatistics(hackathonId: number) {
    'use cache';
    cacheTag(hackathonStatisticsTag(hackathonId));
    cacheLife({ stale: 900, revalidate: 900, expire: 3600 });
    return loadHackathonStatistics(hackathonId);
}
