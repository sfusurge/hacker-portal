type EventPageConfigShape = {
    slug: string;
    name: string;
    tagline: string;
    iconSrc: string;
    bannerClassName: string;
    overview: string;
    location: string;
    dates: string;
    admission: string;
    websiteLabel: string;
    websiteHref: string;
    discordHref: string;
    acceptedDiscordHref?: string | null;
    recapHref: string | null;
    recapTitle: string;
    recapDescription: string;
};

const DEFAULT_BANNER_CONFIG: Pick<
    EventPageConfigShape,
    | 'tagline'
    | 'overview'
    | 'location'
    | 'dates'
    | 'admission'
    | 'websiteLabel'
    | 'websiteHref'
> = {
    tagline: 'Build, learn, and ship with the community.',
    overview:
        'Join us for our latest hacker event. Apply to participate, collaborate, and build meaningful projects with other attendees.',
    location: 'TBA',
    dates: 'TBA',
    admission: 'Free',
    websiteLabel: 'Event website',
    websiteHref: '/home',
};

export const EVENT_PAGE_CONFIG = {
    stormhacks: {
        slug: 'stormhacks',
        name: 'StormHacks',
        tagline: 'Our annual flagship hackathon',
        iconSrc: '/dashboard/sh25head.svg',
        bannerClassName:
            'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900',
        overview:
            "Western Canada's largest hackathon, bringing together over 1000+ builders from across North America to build projects over one intense weekend.",
        location: 'SFU Burnaby, In-Person',
        dates: 'Oct 4 - Oct 5',
        admission: 'Free',
        websiteLabel: 'StormHacks event page',
        websiteHref: '/stormhacks',
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
        bannerClassName:
            'bg-gradient-to-r from-cyan-900 via-sky-900 to-indigo-900',
        overview:
            'A beginner-friendly 12-hour hackathon built to kickstart your year and your journey in software development. Learn new skills and meet like-minded peers!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Jan 10 - Feb 5',
        admission: 'Free',
        websiteLabel: 'JourneyHacks event page',
        websiteHref: '/journeyhacks',
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
        bannerClassName:
            'bg-gradient-to-r from-violet-900 via-fuchsia-900 to-slate-900',
        overview:
            'A semester-long incubation program that connects you with industry mentors and passionate peers across disciplines, bringing ideas to life!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Jan - Apr',
        admission: 'Free',
        websiteLabel: 'StormForge event page',
        websiteHref: '/stormforge',
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
        bannerClassName:
            'bg-gradient-to-r from-rose-900 via-pink-900 to-purple-900',
        overview:
            'A 10-hour hackathon for building projects too silly or weird to exist anywhere else. Prioritizing creativity and laughs over technical complexity!',
        location: 'SFU Burnaby, In-Person',
        dates: 'Oct 4 - Oct 5',
        admission: 'Free',
        websiteLabel: 'SillyHacks event page',
        websiteHref: '/sillyhacks',
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
        iconSrc: '/dashboard/sh25head.svg',
        bannerClassName:
            'bg-gradient-to-r from-amber-900 via-orange-900 to-rose-900',
        overview:
            'SparkJam is a two-week design sprint focused on solving real-world problems with creativity and collaboration.',
        location: 'SFU Burnaby & UWaterloo, In-Person',
        dates: 'May 11 - May 23',
        admission: 'Paid (CA$15)',
        websiteLabel: 'SparkJam event page',
        websiteHref: '/sparkjam',
        discordHref: 'https://discord.com/invite/U5q6RkHHtA/login',
        acceptedDiscordHref: null,
        recapHref: null,
        recapTitle: "Watch last year's Recap!",
        recapDescription: 'See the highlights from our last event.',
    },
} as const satisfies Record<string, EventPageConfigShape>;

export type EventPageSlug = keyof typeof EVENT_PAGE_CONFIG;
export type EventPageConfig = (typeof EVENT_PAGE_CONFIG)[EventPageSlug];
export type EventBannerConfig = Pick<
    EventPageConfigShape,
    | 'tagline'
    | 'overview'
    | 'location'
    | 'dates'
    | 'admission'
    | 'websiteLabel'
    | 'websiteHref'
>;

function normalizeEventName(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function getEventPageConfig(slug: EventPageSlug): EventPageConfig {
    return EVENT_PAGE_CONFIG[slug];
}

export function getEventBannerConfigByName(
    eventName: string
): EventBannerConfig {
    const normalizedName = normalizeEventName(eventName);

    const directMatch = Object.values(EVENT_PAGE_CONFIG).find(
        (config) => normalizeEventName(config.slug) === normalizedName
    );
    if (directMatch) {
        return {
            tagline: directMatch.tagline,
            overview: directMatch.overview,
            location: directMatch.location,
            dates: directMatch.dates,
            admission: directMatch.admission,
            websiteLabel: directMatch.websiteLabel,
            websiteHref: directMatch.websiteHref,
        };
    }

    const fuzzyMatch = Object.values(EVENT_PAGE_CONFIG).find((config) => {
        const normalizedSlug = normalizeEventName(config.slug);
        const normalizedConfigName = normalizeEventName(config.name);
        return (
            normalizedName.includes(normalizedSlug) ||
            normalizedSlug.includes(normalizedName) ||
            normalizedName.includes(normalizedConfigName)
        );
    });
    if (fuzzyMatch) {
        return {
            tagline: fuzzyMatch.tagline,
            overview: fuzzyMatch.overview,
            location: fuzzyMatch.location,
            dates: fuzzyMatch.dates,
            admission: fuzzyMatch.admission,
            websiteLabel: fuzzyMatch.websiteLabel,
            websiteHref: fuzzyMatch.websiteHref,
        };
    }

    return {
        ...DEFAULT_BANNER_CONFIG,
        websiteLabel: `${eventName} event page`,
    };
}
