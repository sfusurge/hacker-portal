import type { HackathonEventPagePayload } from '@/db/schema/hackathons';

/**
 * Reference snapshots for `event_page_payload` (shape matches DB JSON).
 * Slug lives on `hackathons.event_page_slug`, not in the payload.
 */
export type EventPageBackupEntry = HackathonEventPagePayload;

export const EVENT_PAGE_CONFIG_BACKUP = {
    stormhacks: {
        name: 'StormHacks',
        dates: 'Oct 4 - Oct 5',
        iconSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sh25head.webp',
        tagline: 'Our annual flagship hackathon',
        location: 'SFU Burnaby, In-Person',
        overview:
            "Western Canada's largest hackathon, bringing together over 1000+ builders from across North America to build projects over one intense weekend.",
        recapHref: 'https://www.instagram.com/p/DQ6CcB0ER9n/',
        eventPageLabel: 'StormHacks event page',
        websiteHref: 'https://stormhacks.com',
        websiteLabel: 'StormHacks 2025 Website',
        targetAudience: 'Hackers of all levels',
        mobileBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sh25-banner-mobile.webp',
        desktopBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sh25-Desktop-Deskto.webp',
        hackerPackageHref:
            'https://verbena-oregano-a56.notion.site/StormHacks-2025-Hacker-Package-26a82a4e770680298cd7e708cd39648e',
    },
    journeyhacks: {
        name: 'JourneyHacks',
        dates: 'Jan 10',
        iconSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/jh26head.webp',
        tagline: 'Kick off your locked-in journey',
        location: 'SFU Burnaby, In-Person',
        overview:
            'A beginner-friendly 12-hour hackathon built to kickstart your year and your journey in software development. Learn new skills and meet like-minded peers!',
        recapHref: 'https://www.instagram.com/p/DTuExdzkZ73/',
        eventPageLabel: 'JourneyHacks event page',
        websiteHref: 'https://journeyhacks.sfusurge.com',
        websiteLabel: 'JourneyHacks 2026 Website',
        targetAudience: 'Beginner hackers',
        mobileBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/jh26-banner-mobile.webp',
        desktopBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/jh26-banner-Desktop.webp',
        hackerPackageHref:
            'https://verbena-oregano-a56.notion.site/StormHacks-2025-Hacker-Package-26a82a4e770680298cd7e708cd39648e',
    },
    stormforge: {
        name: 'StormForge',
        dates: 'Jan - Apr',
        iconSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sf26icon.svg',
        tagline: 'Forge your path',
        location: 'SFU Burnaby, In-Person',
        overview:
            'A semester-long incubation program that connects you with industry mentors and passionate peers across disciplines, bringing ideas to life!',
        recapHref: null,
        eventPageLabel: 'StormForge event page',
        websiteHref:
            'https://drive.google.com/file/d/15blKokvy4uZuTuTuD76hVpm3kkBbZlY0/view?usp=sharing',
        websiteLabel: 'StormForge 2026 Package',
        targetAudience: 'Hackers of all levels',
        mobileBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sf26-banner-mobile.webp',
        desktopBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sf26-banner-deskto.webp',
        hackerPackageHref:
            'https://verbena-oregano-a56.notion.site/StormHacks-2025-Hacker-Package-26a82a4e770680298cd7e708cd39648e',
    },
    sillyhacks: {
        name: 'SillyHacks',
        dates: 'Apr 1',
        iconSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sillyhackshead.webp',
        tagline: "Let's get silly",
        location: 'SFU Burnaby, In-Person',
        overview:
            'A 10-hour hackathon for building projects too silly or weird to exist anywhere else. Prioritizing creativity and laughs over technical complexity!',
        recapHref: 'https://www.instagram.com/p/DW0LbpbDShy/',
        eventPageLabel: 'SillyHacks event page',
        websiteHref: 'https://sillyhacks.sfusurge.com',
        websiteLabel: 'SillyHacks 2026 Website',
        targetAudience: 'Silly hackers',
        mobileBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sillyHacks-banner-mobile.webp',
        desktopBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sillyHacks-banner-deskto.webp',
        hackerPackageHref:
            'https://verbena-oregano-a56.notion.site/StormHacks-2025-Hacker-Package-26a82a4e770680298cd7e708cd39648e',
    },
    sparkjam: {
        name: 'SparkJam',
        dates: 'May 11 - May 23',
        iconSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sparkjamhead.webp',
        tagline: 'Our creative design jam',
        location: 'SFU Burnaby & UWaterloo, In-Person',
        overview:
            'A 2-week design jam connecting eastern and western Canada. Spend the first week developing new skills, then dive into a real design challenge brief in week two!',
        recapHref: null,
        eventPageLabel: 'SparkJam event page',
        websiteHref: 'https://sparkjam.design',
        websiteLabel: 'SparkJam 2026 website',
        targetAudience: 'Designers of all levels',
        mobileBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sj26-banner-mobile.webp',
        desktopBannerSrc:
            'https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/hackathons/sj26-banner-Deskto.webp',
        hackerPackageHref:
            'https://verbena-oregano-a56.notion.site/StormHacks-2025-Hacker-Package-26a82a4e770680298cd7e708cd39648e',
    },
} as const satisfies Record<string, EventPageBackupEntry>;
