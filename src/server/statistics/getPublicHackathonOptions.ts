import { unstable_cache } from 'next/cache';
import { asc } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import { hackathons } from '@/db/schema/hackathons';

export type PublicHackathonOption = {
    id: number;
    name: string;
    startDate: string;
};

async function loadPublicHackathonOptions(): Promise<PublicHackathonOption[]> {
    return databaseClient
        .select({
            id: hackathons.id,
            name: hackathons.name,
            startDate: hackathons.startDate,
        })
        .from(hackathons)
        .orderBy(asc(hackathons.startDate));
}

// TODO: replace unstable_cache with 'use cache' (opennextjs/opennextjs-cloudflare#1450)
const loadPublicHackathonOptionsCached = unstable_cache(
    loadPublicHackathonOptions,
    ['public-hackathon-options'],
    { tags: ['active-hackathon'], revalidate: 60 }
);

/** Public, unauthenticated hackathon list used by /statistics/range. */
export async function getPublicHackathonOptions() {
    return loadPublicHackathonOptionsCached();
}
