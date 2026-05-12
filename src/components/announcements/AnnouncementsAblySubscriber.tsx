'use client';

import { useSetAtom, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { Realtime, type InboundMessage } from 'ably';
import {
    announcementsAtom,
    hackathonAtom,
    viewerAnnouncementLocationKeyAtom,
    type AnnouncementsList,
} from '@/app/(auth)/ClientContext';
import {
    acquireRealtimeClient,
    releaseRealtimeClient,
} from '@/lib/realtime/realtimeClient';
import {
    ANNOUNCEMENTS_ABLY_EVENT,
    announcementsChannelName,
} from '@/lib/realtime/announcementChannels';
import { parseAnnouncementAblyEnvelope } from '@/lib/realtime/parseAnnouncementAblyEnvelope';
import { parseAnnouncementRealtimeWire } from '@/lib/announcements/parseAnnouncementRealtimeWire';
import { announcementVisibleToViewer } from '@/lib/announcements/announcementRealtimeVisibility';
import { upsertAnnouncementsTopN } from '@/lib/announcements/upsertAnnouncementsTopN';
import { trpc } from '@/trpc/client';

const ANNOUNCEMENTS_REALTIME_LIMIT = 10;

export function AnnouncementsAblySubscriber() {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id;
    const viewerLocationKey = useAtomValue(viewerAnnouncementLocationKeyAtom);
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

        const refetchAnnouncements = async () => {
            const u = utilsRef.current;
            await u.announcements.getAnnouncements.invalidate();
            try {
                const next = await u.announcements.getAnnouncements.fetch({
                    hackathonId,
                    limit: ANNOUNCEMENTS_REALTIME_LIMIT,
                });
                setAnnouncements(next.items as unknown as AnnouncementsList);
            } catch {
                /* invalidate still lets mounted queries refetch */
            }
        };

        const channel = client.channels.get(
            announcementsChannelName(hackathonId)
        );

        const onMessage = (message: InboundMessage) => {
            const envelope = parseAnnouncementAblyEnvelope(message.data);
            if (!envelope || envelope.hackathonId !== hackathonId) {
                return;
            }

            if (envelope.kind === 'archived') {
                setAnnouncements((prev) =>
                    prev.filter((a) => a.id !== envelope.announcementId)
                );
                return;
            }

            if (!envelope.announcement || !envelope.visibility) {
                void refetchAnnouncements();
                return;
            }

            const announcement = parseAnnouncementRealtimeWire(
                envelope.announcement
            );
            if (!announcement) {
                void refetchAnnouncements();
                return;
            }

            if (announcement.id !== envelope.announcementId) {
                void refetchAnnouncements();
                return;
            }

            if (
                !announcementVisibleToViewer(
                    viewerLocationKey,
                    envelope.visibility
                )
            ) {
                setAnnouncements((prev) =>
                    prev.filter((a) => a.id !== envelope.announcementId)
                );
                return;
            }

            setAnnouncements((prev) =>
                upsertAnnouncementsTopN(
                    prev,
                    announcement,
                    ANNOUNCEMENTS_REALTIME_LIMIT
                )
            );
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
    }, [hackathonId, viewerLocationKey, setAnnouncements]);

    return null;
}
