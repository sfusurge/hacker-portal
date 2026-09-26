import type { HackathonEventPagePayload } from '@/db/schema/hackathons';

/** Default / pre-acceptance invite */
export const EVENT_DISCORD_URL = 'https://discord.com/invite/U5q6RkHHtA';

/**
 * Hackathon Discord invite when the user is Accepted and an invite is configured.
 * Returns null otherwise.
 */
export function hackathonDiscordInviteHref(
    applicationStatus: string | undefined,
    payload?: HackathonEventPagePayload | null
): string | null {
    if (applicationStatus !== 'Accepted') {
        return null;
    }
    const accepted = payload?.acceptedDiscordInviteHref?.trim();
    return accepted && accepted.length > 0 ? accepted : null;
}

export function hasHackathonDiscordInvite(
    applicationStatus: string | undefined,
    payload?: HackathonEventPagePayload | null
): boolean {
    return hackathonDiscordInviteHref(applicationStatus, payload) != null;
}

/**
 * Resolve the Discord invite for the active hackathon and user's
 * application status. Falls back to the global Surge invite when the
 * hackathon invite is not available.
 */
export function eventDiscordUrlForStatus(
    applicationStatus: string | undefined,
    payload?: HackathonEventPagePayload | null
): string {
    return (
        hackathonDiscordInviteHref(applicationStatus, payload) ??
        EVENT_DISCORD_URL
    );
}
