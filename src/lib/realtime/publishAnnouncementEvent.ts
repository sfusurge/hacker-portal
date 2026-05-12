import Ably from 'ably';
import {
    announcementsChannelName,
    ANNOUNCEMENTS_ABLY_EVENT,
    type AnnouncementRealtimePayload,
} from './announcementChannels';

function getServerAblyKey(): string | undefined {
    return process.env.ABLY_API_KEY ?? process.env.NEXT_PUBLIC_ABLY_API_KEY;
}

let restClient: Ably.Rest | null = null;

function getRest(): Ably.Rest | null {
    const key = getServerAblyKey();
    if (!key) return null;
    if (!restClient) {
        restClient = new Ably.Rest({ key });
    }
    return restClient;
}

// publish after DB commits
export async function publishAnnouncementEvent(
    payload: AnnouncementRealtimePayload
): Promise<void> {
    const rest = getRest();
    if (!rest) {
        return;
    }
    try {
        const channel = rest.channels.get(
            announcementsChannelName(payload.hackathonId)
        );
        await channel.publish(ANNOUNCEMENTS_ABLY_EVENT, payload);
    } catch (err) {
        console.error('[announcements][ably] publish failed', err);
    }
}
