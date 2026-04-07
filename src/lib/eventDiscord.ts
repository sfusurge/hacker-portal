/** Default / pre-acceptance invite (portal, general) — fixed in code. */
export const EVENT_DISCORD_URL = 'https://discord.com/invite/U5q6RkHHtA';

/** Accepted-hacker invite — set `NEXT_PUBLIC_EVENT_DISCORD_ACCEPTED_URL` in env. */
export const EVENT_DISCORD_ACCEPTED_URL =
    process.env.NEXT_PUBLIC_EVENT_DISCORD_ACCEPTED_URL ?? '';

export function eventDiscordUrlForStatus(applicationStatus?: string) {
    if (applicationStatus !== 'Accepted') {
        return EVENT_DISCORD_URL;
    }
    const accepted = EVENT_DISCORD_ACCEPTED_URL.trim();
    return accepted || EVENT_DISCORD_URL;
}
