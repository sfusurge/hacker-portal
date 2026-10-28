import { cacheLife, cacheTag } from 'next/cache';
import { asc } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import { hackathons } from '@/db/schema/hackathons';

export type PublicHackathonOption = {
    id: number;
    name: string;
    startDate: string;
};

async function loadPublicHackathonOptions(): Promise<PublicHackathonOption[]> {
    'use cache';
    cacheTag('active-hackathon');
    cacheLife('minutes');

    return databaseClient
        .select({
            id: hackathons.id,
            name: hackathons.name,
            startDate: hackathons.startDate,
        })
        .from(hackathons)
        .orderBy(asc(hackathons.startDate));
}

/** Public, unauthenticated hackathon list used by /statistics/range. */
export async function getPublicHackathonOptions() {
    return loadPublicHackathonOptions();
}
