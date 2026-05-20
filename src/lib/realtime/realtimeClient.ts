import { Realtime, type InboundMessage, type RealtimeChannel } from 'ably';

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

// subscribe to a channel event once the connection is up, and re-subscribe after
export function subscribeChannelEvent(
    client: Realtime,
    channel: RealtimeChannel,
    eventName: string,
    listener: (message: InboundMessage) => void
): () => void {
    let disposed = false;
    let attached = false;

    const subscribe = () => {
        if (disposed) return;
        const state = client.connection.state;
        if (state === 'closed' || state === 'failed') return;

        void channel.subscribe(eventName, listener).catch((err: unknown) => {
            if (disposed) return;
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes('Connection closed')) return;
            console.error('[ably] subscribe failed', err);
        });
    };

    const onConnected = () => {
        if (disposed) return;
        if (attached) {
            channel.unsubscribe(eventName, listener);
        }
        attached = true;
        subscribe();
    };

    client.connection.on('connected', onConnected);
    if (client.connection.state === 'connected') {
        onConnected();
    }

    return () => {
        disposed = true;
        client.connection.off('connected', onConnected);
        if (attached) {
            channel.unsubscribe(eventName, listener);
        }
    };
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
