import Ably from 'ably';
import { announcementsChannelName } from '@/lib/realtime/announcementChannels';
import { reviewTableChannelName } from '@/lib/realtime/reviewTableChannels';

export type AblyAuthContext = {
    userId: number;
    hackathonId: number;
    isAdmin: boolean;
    hasApplicationForHackathon: boolean;
};

function buildCapability(
    ctx: AblyAuthContext
): Record<string, string[]> | null {
    const caps: Record<string, string[]> = {};
    if (ctx.isAdmin || ctx.hasApplicationForHackathon) {
        caps[announcementsChannelName(ctx.hackathonId)] = ['subscribe'];
    }
    if (ctx.isAdmin) {
        caps[reviewTableChannelName(ctx.hackathonId)] = ['subscribe'];
    }
    return Object.keys(caps).length > 0 ? caps : null;
}

// create token request for real-time client
export async function createAblyTokenRequest(ctx: AblyAuthContext) {
    const capabilityMap = buildCapability(ctx);
    if (!capabilityMap) {
        return null;
    }

    const key =
        process.env.ABLY_API_KEY ?? process.env.NEXT_PUBLIC_ABLY_API_KEY;
    if (!key) {
        return null;
    }

    const rest = new Ably.Rest({ key });
    return rest.auth.createTokenRequest({
        capability: JSON.stringify(capabilityMap),
        clientId: `portal-user-${ctx.userId}`,
    });
}
