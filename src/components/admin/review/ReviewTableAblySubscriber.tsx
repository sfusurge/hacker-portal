'use client';

import { useEffect, useRef } from 'react';
import { Realtime, type InboundMessage } from 'ably';
import {
    acquireRealtimeClient,
    releaseRealtimeClient,
    subscribeChannelEvent,
} from '@/lib/realtime/realtimeClient';
import {
    REVIEW_TABLE_ABLY_EVENT,
    reviewTableChannelName,
    type ReviewTableRealtimePayload,
} from '@/lib/realtime/reviewTableChannels';
import { trpc } from '@/trpc/client';

function parsePayload(data: unknown): ReviewTableRealtimePayload | null {
    if (!data || typeof data !== 'object') return null;
    const o = data as Record<string, unknown>;
    if (typeof o.hackathonId !== 'number') return null;
    return { hackathonId: o.hackathonId };
}

// subscribe only while this component is mounted
export function ReviewTableAblySubscriber({
    hackathonId,
}: {
    hackathonId: number;
}) {
    const utils = trpc.useUtils();
    const utilsRef = useRef(utils);
    utilsRef.current = utils;

    useEffect(() => {
        if (!hackathonId) {
            return;
        }

        let client: Realtime;
        try {
            client = acquireRealtimeClient(hackathonId);
        } catch {
            return;
        }

        const channel = client.channels.get(
            reviewTableChannelName(hackathonId)
        );

        const onMessage = (message: InboundMessage) => {
            const payload = parsePayload(message.data);
            if (!payload || payload.hackathonId !== hackathonId) {
                return;
            }

            void (async () => {
                const u = utilsRef.current;
                await Promise.all([
                    u.applications.getApplications.invalidate(),
                    u.applications.getApplicationCount.invalidate(),
                ]);
            })();
        };

        const unsubscribe = subscribeChannelEvent(
            client,
            channel,
            REVIEW_TABLE_ABLY_EVENT,
            onMessage
        );

        return () => {
            unsubscribe();
            releaseRealtimeClient(hackathonId);
        };
    }, [hackathonId]);

    return null;
}
