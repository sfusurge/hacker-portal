import type { HackathonEventPagePayload } from '@/db/schema/hackathons';

/** static snapshot of event payloads (reference / seeding). */

export type EventPageConfigShape = {
    name: string;
    tagline: string;
    iconSrc: string;
    desktopBannerSrc?: string;
    mobileBannerSrc?: string;
    overview: string;
    location: string;
    dates: string;
    eventPageLabel: string;
    websiteLabel: string;
    websiteHref: string;
    recapHref: string | null;
    hackerPackageHref?: string | null;
    targetAudience?: string;
};

const DEFAULT_BANNER_CONFIG: Pick<
    EventPageConfigShape,
    | 'tagline'
    | 'overview'
    | 'location'
    | 'dates'
    | 'websiteLabel'
    | 'websiteHref'
> = {
    tagline: 'Build, learn, and ship with the community.',
    overview:
        'Join us for our latest hacker event. Apply to participate, collaborate, and build meaningful projects with other attendees.',
    location: 'TBA',
    dates: 'TBA',
    websiteLabel: 'Event website',
    websiteHref: '/home',
};

/** banner copy + links when `event_page_payload` is missing (home card / buttons). */
export function defaultEventBannerFallback(
    eventName: string
): EventBannerConfig {
    return {
        ...DEFAULT_BANNER_CONFIG,
        websiteLabel: `${eventName} event page`,
    };
}

/** full default `event_page_payload` shape when the DB row has no JSON yet. */
export function defaultEventPagePayload(
    hackathonName: string
): HackathonEventPagePayload {
    return {
        name: hackathonName,
        tagline: DEFAULT_BANNER_CONFIG.tagline,
        iconSrc: '/dashboard/sh25head.svg',
        overview: DEFAULT_BANNER_CONFIG.overview,
        location: DEFAULT_BANNER_CONFIG.location,
        dates: DEFAULT_BANNER_CONFIG.dates,
        websiteLabel: `${hackathonName} event page`,
        websiteHref: DEFAULT_BANNER_CONFIG.websiteHref,
        recapHref: null,
        hackerPackageHref: null,
<<<<<<< development
        acceptedDiscordInviteHref: null,
=======
>>>>>>> production
        eventPageLabel: `${hackathonName} event page`,
    };
}

/** URL for the Hacker Package link; uses DB payload when set, otherwise default copy for this hackathon name. */
export function resolveHackerPackageHref(
    payload: HackathonEventPagePayload | null | undefined,
    hackathonName: string
): string | null {
    const raw = payload?.hackerPackageHref;
    if (typeof raw === 'string' && raw.trim() !== '') {
        return raw.trim();
    }
    return defaultEventPagePayload(hackathonName).hackerPackageHref ?? null;
}

/** Sidebar display order for “Our Events”. */
export const EVENT_PAGE_NAV_SLUG_ORDER = [
    'stormhacks',
    'journeyhacks',
    'stormforge',
    'sillyhacks',
    'sparkjam',
] as const;

export type EventPageSlug = (typeof EVENT_PAGE_NAV_SLUG_ORDER)[number];

export type EventBannerConfig = Pick<
    EventPageConfigShape,
    | 'tagline'
    | 'overview'
    | 'location'
    | 'dates'
    | 'websiteLabel'
    | 'websiteHref'
>;

export type EventPageNavLink = {
    href: string;
    label: string;
    icon: string;
    iconAlt: string;
};

/** sidebar “Our Events” links (labels/icons; page content comes from the DB). */
export const EVENT_PAGE_NAV_LINKS: EventPageNavLink[] = [
    {
        href: '/stormhacks',
        label: 'StormHacks',
        icon: '/dashboard/sh25head.svg',
        iconAlt: 'StormHacks logo',
    },
    {
        href: '/journeyhacks',
        label: 'JourneyHacks',
        icon: '/dashboard/jh26head.png',
        iconAlt: 'JourneyHacks logo',
    },
    {
        href: '/stormforge',
        label: 'StormForge',
        icon: '/dashboard/sf26icon.svg',
        iconAlt: 'StormForge logo',
    },
    {
        href: '/sillyhacks',
        label: 'SillyHacks',
        icon: '/dashboard/sillyhackshead.svg',
        iconAlt: 'SillyHacks logo',
    },
    {
        href: '/sparkjam',
        label: 'SparkJam',
        icon: '/dashboard/sparkjamhead.webp',
        iconAlt: 'SparkJam logo',
    },
];

function pickEventBannerFields(c: EventPageConfigShape): EventBannerConfig {
    return {
        tagline: c.tagline,
        overview: c.overview,
        location: c.location,
        dates: c.dates,
        websiteLabel: c.websiteLabel,
        websiteHref: c.websiteHref,
    };
}

export function eventBannerFieldsFromPayload(
    payload: HackathonEventPagePayload
): EventBannerConfig {
    return pickEventBannerFields(payload);
}

export function isKnownNavEventSlug(value: string): value is EventPageSlug {
    return (EVENT_PAGE_NAV_SLUG_ORDER as readonly string[]).includes(value);
}
