import { Realtime } from 'ably';

type PoolEntry = { client: Realtime; count: number };

const clientsByHackathonId = new Map<number, PoolEntry>();

function authUrlFor(hackathonId: number): string {
    return `/api/ably/auth?hackathonId=${encodeURIComponent(String(hackathonId))}`;
}

/**
 * Real-time client for hackathon-scoped announcements and review table
 */
export function acquireRealtimeClient(hackathonId: number): Realtime {
    if (!hackathonId || Number.isNaN(hackathonId)) {
        throw new Error('acquireRealtimeClient requires a valid hackathonId');
    }

    let entry = clientsByHackathonId.get(hackathonId);
    if (!entry) {
        entry = {
            client: new Realtime({ authUrl: authUrlFor(hackathonId) }),
            count: 0,
        };
        clientsByHackathonId.set(hackathonId, entry);
    }

    entry.count += 1;
    return entry.client;
}

// release when component unmounts
export function releaseRealtimeClient(hackathonId: number): void {
    if (!hackathonId || Number.isNaN(hackathonId)) {
        return;
    }

    const entry = clientsByHackathonId.get(hackathonId);
    if (!entry) {
        return;
    }

    entry.count -= 1;
    if (entry.count <= 0) {
        entry.client.close();
        clientsByHackathonId.delete(hackathonId);
    }
}
