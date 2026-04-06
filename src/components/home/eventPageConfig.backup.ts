import type { HackathonEventPagePayload } from '@/db/schema/hackathons';

/**
 * keep this file in sync when you change defaults or need a quick reference / seed.
 */
export type EventPageBackupEntry = HackathonEventPagePayload & {
    slug: string;
    bannerClassName: string;
    admission: string;
    discordHref: string;
    acceptedDiscordHref: string | null;
    recapTitle: string;
    recapDescription: string;
};

export const EVENT_PAGE_CONFIG_BACKUP = {
    stormhacks: {
        slug: 'stormhacks',
        name: 'StormHacks',
        tagline: 'Our annual flagship hackathon',
        iconSrc: '/dashboard/sh25head.svg',
        desktopBannerSrc: '/dashboard/sh25-Desktop-Desktop.png',
        mobileBannerSrc: '/dashboard/sh25-banner-mobile.png',
        bannerClassName:
            'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900',
        overview:
            "Western Canada's largest hackathon, bringing together over 1000+ builders from across North America to build projects over one intense weekend.",
        location: 'SFU Burnaby, In-Person',
        dates: 'Oct 4 - Oct 5',
        admission: 'Free',
        websiteLabel: 'StormHacks event page',
        websiteHref: 'https://stormhacks.com',
        discordHref: 'https://discord.com/invite/U5q6RkHHtA/login',
        acceptedDiscordHref: 'https://discord.gg/mfn8YkPCnp',
        recapHref: 'https://m.youtube.com/watch?v=lzFKBIZsHe4&feature=youtu.be',
        recapTitle: "Watch last year's Recap!",
        recapDescription: 'See the highlights of StormHacks 2025.',
    },
    journeyhacks: {
        slug: 'journeyhacks',
        name: 'JourneyHacks',
        tagline: 'Kick off your locked-in journey',
        iconSrc: '/dashboard/sf26icon.svg',
        desktopBannerSrc: '/dashboard/jh26-banner-Desktop.png',
        mobileBannerSrc: '/dashboard/jh26-banner-mobile.png',
        bannerClassName:
            'bg-gradient-to-r from-cyan-900 via-sky-900 to-indigo-900',
        overview:
            'A beginner-friendly 12-hour hackathon built to kickstart your year and your journey in software development. Learn new skills and meet like-minded peers!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Jan 10',
        admission: 'Free',
        websiteLabel: 'JourneyHacks event page',
        websiteHref: 'https://journeyhacks.sfusurge.com',
        discordHref: 'https://discord.com/invite/U5q6RkHHtA/login',
        acceptedDiscordHref: null,
        recapHref: null,
        recapTitle: "Watch last year's Recap!",
        recapDescription: 'See the highlights from our last event.',
    },
    stormforge: {
        slug: 'stormforge',
        name: 'StormForge',
        tagline: 'Forge your path',
        iconSrc: '/dashboard/sf26icon.svg',
        desktopBannerSrc: '/dashboard/sf26-banner-desktop.png',
        mobileBannerSrc: '/dashboard/sf26-banner-mobile.png',
        bannerClassName:
            'bg-gradient-to-r from-violet-900 via-fuchsia-900 to-slate-900',
        overview:
            'A semester-long incubation program that connects you with industry mentors and passionate peers across disciplines, bringing ideas to life!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Jan - Apr',
        admission: 'Free',
        websiteLabel: 'StormForge Package',
        websiteHref:
            'https://drive.google.com/file/d/15blKokvy4uZuTuTuD76hVpm3kkBbZlY0/view?usp=sharing',
        discordHref: 'https://discord.com/invite/U5q6RkHHtA/login',
        acceptedDiscordHref: null,
        recapHref: null,
        recapTitle: "Watch last year's Recap!",
        recapDescription: 'See the highlights from our last event.',
    },
    sillyhacks: {
        slug: 'sillyhacks',
        name: 'SillyHacks',
        tagline: "Let's get silly",
        iconSrc: '/dashboard/sillyhackshead.svg',
        desktopBannerSrc: '/dashboard/sillyHacks-banner-desktop.png',
        mobileBannerSrc: '/dashboard/sillyHacks-banner-mobile.png',
        bannerClassName:
            'bg-gradient-to-r from-rose-900 via-pink-900 to-purple-900',
        overview:
            'A 10-hour hackathon for building projects too silly or weird to exist anywhere else. Prioritizing creativity and laughs over technical complexity!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Oct 4 - Oct 5',
        admission: 'Free',
        websiteLabel: 'SillyHacks event page',
        websiteHref: 'https://sillyhacks.sfusurge.com',
        discordHref: 'https://discord.com/invite/U5q6RkHHtA/login',
        acceptedDiscordHref: null,
        recapHref: null,
        recapTitle: "Watch last year's Recap!",
        recapDescription: 'See the highlights from our last event.',
    },
    sparkjam: {
        slug: 'sparkjam',
        name: 'SparkJam',
        tagline: 'Our creative design jam',
        iconSrc: '/dashboard/sj26head.png',
        desktopBannerSrc: '/dashboard/sj26-banner-Desktop.png',
        mobileBannerSrc: '/dashboard/sj26-banner-mobile.png',
        bannerClassName:
            'bg-gradient-to-r from-amber-900 via-orange-900 to-rose-900',
        overview:
            'SparkJam is a two-week design sprint focused on solving real-world problems with creativity and collaboration.',
        location: 'SFU Burnaby & UWaterloo, In-Person',
        dates: 'May 11 - May 23',
        admission: 'Paid (CA$15)',
        websiteLabel: 'SparkJam event page',
        websiteHref: 'https://sparkjam.sfusurge.com',
        discordHref: 'https://discord.com/invite/U5q6RkHHtA/login',
        acceptedDiscordHref: null,
        recapHref: null,
        recapTitle: "Watch last year's Recap!",
        recapDescription: 'See the highlights from our last event.',
    },
} as const satisfies Record<string, EventPageBackupEntry>;
