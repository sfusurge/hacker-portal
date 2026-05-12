'use client';

import { useSetAtom, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { Realtime, type InboundMessage } from 'ably';
import {
    announcementsAtom,
    hackathonAtom,
    type AnnouncementsList,
} from '@/app/(auth)/ClientContext';
import {
    acquireRealtimeClient,
    releaseRealtimeClient,
} from '@/lib/realtime/realtimeClient';
import {
    ANNOUNCEMENTS_ABLY_EVENT,
    announcementsChannelName,
    type AnnouncementRealtimePayload,
} from '@/lib/realtime/announcementChannels';
import { trpc } from '@/trpc/client';

function parsePayload(data: unknown): AnnouncementRealtimePayload | null {
    if (!data || typeof data !== 'object') return null;
    const o = data as Record<string, unknown>;
    const kind = o.kind;
    const hackathonId = o.hackathonId;
    const announcementId = o.announcementId;
    if (kind !== 'created' && kind !== 'updated' && kind !== 'archived') {
        return null;
    }
    if (typeof hackathonId !== 'number' || typeof announcementId !== 'number') {
        return null;
    }
    return { kind, hackathonId, announcementId };
}

export function AnnouncementsAblySubscriber() {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id;
    const setAnnouncements = useSetAtom(announcementsAtom);
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
            announcementsChannelName(hackathonId)
        );

        const onMessage = (message: InboundMessage) => {
            const payload = parsePayload(message.data);
            if (!payload || payload.hackathonId !== hackathonId) {
                return;
            }

            void (async () => {
                const u = utilsRef.current;
                await u.announcements.getAnnouncements.invalidate();
                try {
                    const next = await u.announcements.getAnnouncements.fetch({
                        hackathonId,
                        limit: 10,
                    });
                    setAnnouncements(
                        next.items as unknown as AnnouncementsList
                    );
                } catch {
                    /* invalidate still lets mounted queries refetch */
                }
            })();
        };

        void channel
            .subscribe(ANNOUNCEMENTS_ABLY_EVENT, onMessage)
            .catch((err) =>
                console.error('[announcements][ably] subscribe failed', err)
            );

        return () => {
            channel.unsubscribe(ANNOUNCEMENTS_ABLY_EVENT, onMessage);
            releaseRealtimeClient(hackathonId);
        };
    }, [hackathonId, setAnnouncements]);

    return null;
}
