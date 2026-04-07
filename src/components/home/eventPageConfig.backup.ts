import type { HackathonEventPagePayload } from '@/db/schema/hackathons';

/**
 * Reference snapshots for `event_page_payload` (shape matches DB JSON).
 * Slug lives on `hackathons.event_page_slug`, not in the payload.
 */
export type EventPageBackupEntry = HackathonEventPagePayload;

export const EVENT_PAGE_CONFIG_BACKUP = {
    stormhacks: {
        name: 'StormHacks',
        tagline: 'Our annual flagship hackathon',
        iconSrc: '/dashboard/sh25head.svg',
        desktopBannerSrc: '/dashboard/sh25-Desktop-Desktop.png',
        mobileBannerSrc: '/dashboard/sh25-banner-mobile.png',
        overview:
            "Western Canada's largest hackathon, bringing together over 1000+ builders from across North America to build projects over one intense weekend.",
        location: 'SFU Burnaby, In-Person',
        dates: 'Oct 4 - Oct 5',
        websiteLabel: 'StormHacks event page',
        websiteHref: 'https://stormhacks.com',
        recapHref: 'https://m.youtube.com/watch?v=lzFKBIZsHe4&feature=youtu.be',
    },
    journeyhacks: {
        name: 'JourneyHacks',
        tagline: 'Kick off your locked-in journey',
        iconSrc: '/dashboard/sf26icon.svg',
        desktopBannerSrc: '/dashboard/jh26-banner-Desktop.png',
        mobileBannerSrc: '/dashboard/jh26-banner-mobile.png',
        overview:
            'A beginner-friendly 12-hour hackathon built to kickstart your year and your journey in software development. Learn new skills and meet like-minded peers!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Jan 10',
        websiteLabel: 'JourneyHacks event page',
        websiteHref: 'https://journeyhacks.sfusurge.com',
        recapHref: null,
        hackerPackageHref: null,
    },
    stormforge: {
        name: 'StormForge',
        tagline: 'Forge your path',
        iconSrc: '/dashboard/sf26icon.svg',
        desktopBannerSrc: '/dashboard/sf26-banner-desktop.png',
        mobileBannerSrc: '/dashboard/sf26-banner-mobile.png',
        overview:
            'A semester-long incubation program that connects you with industry mentors and passionate peers across disciplines, bringing ideas to life!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Jan - Apr',
        websiteLabel: 'StormForge Package',
        websiteHref:
            'https://drive.google.com/file/d/15blKokvy4uZuTuTuD76hVpm3kkBbZlY0/view?usp=sharing',
        recapHref: null,
    },
    sillyhacks: {
        name: 'SillyHacks',
        tagline: "Let's get silly",
        iconSrc: '/dashboard/sillyhackshead.svg',
        desktopBannerSrc: '/dashboard/sillyHacks-banner-desktop.png',
        mobileBannerSrc: '/dashboard/sillyHacks-banner-mobile.png',
        overview:
            'A 10-hour hackathon for building projects too silly or weird to exist anywhere else. Prioritizing creativity and laughs over technical complexity!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Oct 4 - Oct 5',
        websiteLabel: 'SillyHacks event page',
        websiteHref: 'https://sillyhacks.sfusurge.com',
        recapHref: null,
    },
    sparkjam: {
        name: 'SparkJam',
        tagline: 'Our creative design jam',
        iconSrc: '/dashboard/sparkjamhead.webp',
        desktopBannerSrc: '/dashboard/sj26-banner-Desktop.png',
        mobileBannerSrc: '/dashboard/sj26-banner-mobile.png',
        overview:
            'SparkJam is a two-week design sprint focused on solving real-world problems with creativity and collaboration.',
        location: 'SFU Burnaby & UWaterloo, In-Person',
        dates: 'May 11 - May 23',
        websiteLabel: 'SparkJam event page',
        websiteHref: 'https://sparkjam.sfusurge.com',
        recapHref: null,
    },
} as const satisfies Record<string, EventPageBackupEntry>;
