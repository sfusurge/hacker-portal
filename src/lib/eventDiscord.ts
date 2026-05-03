import type { HackathonEventPagePayload } from '@/db/schema/hackathons';

/** Default / pre-acceptance invite */
export const EVENT_DISCORD_URL = 'https://discord.com/invite/U5q6RkHHtA';

/**
 * resolve the right Discord invite for the active hackathon and user's
 * application status.
 */
export function eventDiscordUrlForStatus(
    applicationStatus: string | undefined,
    payload?: HackathonEventPagePayload | null
): string {
    if (applicationStatus !== 'Accepted') {
        return EVENT_DISCORD_URL;
    }
    const accepted = payload?.acceptedDiscordInviteHref?.trim();
    return accepted && accepted.length > 0 ? accepted : EVENT_DISCORD_URL;
}
