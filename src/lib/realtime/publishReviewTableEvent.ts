import Ably from 'ably';
import {
    reviewTableChannelName,
    REVIEW_TABLE_ABLY_EVENT,
    type ReviewTableRealtimePayload,
} from './reviewTableChannels';

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

export async function publishReviewTableEvent(
    payload: ReviewTableRealtimePayload
): Promise<void> {
    const rest = getRest();
    if (!rest) {
        return;
    }
    try {
        const channel = rest.channels.get(
            reviewTableChannelName(payload.hackathonId)
        );
        await channel.publish(REVIEW_TABLE_ABLY_EVENT, payload);
    } catch (err) {
        console.error('[review-table][ably] publish failed', err);
    }
}
