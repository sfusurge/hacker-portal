'use client';

import { useSetAtom, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { Realtime, type InboundMessage } from 'ably';
import {
    announcementsAtom,
    hackathonAtom,
    userInfoAtom,
    type AnnouncementsList,
} from '@/app/(auth)/ClientContext';
import {
    useAdminAnnouncementPreviewQueryInput,
    useEffectiveAnnouncementLocationKey,
} from '@/lib/announcements/useAdminAnnouncementPreview';
import {
    acquireRealtimeClient,
    releaseRealtimeClient,
    subscribeChannelEvent,
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
import { hasAdminAccess } from '@/lib/auth/roles';

const ANNOUNCEMENTS_REALTIME_LIMIT = 10;

export function AnnouncementsAblySubscriber() {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id;
    const viewerLocationKey = useEffectiveAnnouncementLocationKey();
    const isAdmin = hasAdminAccess(useAtomValue(userInfoAtom)?.userRole);
    const adminPreviewInput = useAdminAnnouncementPreviewQueryInput();
    const adminViewAll = adminPreviewInput?.viewAll ?? true;
    const setAnnouncements = useSetAtom(announcementsAtom);
    const utils = trpc.useUtils();
    const utilsRef = useRef(utils);
    utilsRef.current = utils;

    const viewerLocationKeyRef = useRef(viewerLocationKey);
    viewerLocationKeyRef.current = viewerLocationKey;
    const isAdminRef = useRef(isAdmin);
    isAdminRef.current = isAdmin;
    const adminViewAllRef = useRef(adminViewAll);
    adminViewAllRef.current = adminViewAll;
    const adminPreviewInputRef = useRef(adminPreviewInput);
    adminPreviewInputRef.current = adminPreviewInput;

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
            const preview = adminPreviewInputRef.current;
            const admin = isAdminRef.current;
            await u.announcements.getAnnouncements.invalidate();
            try {
                const next = await u.announcements.getAnnouncements.fetch({
                    hackathonId,
                    limit: ANNOUNCEMENTS_REALTIME_LIMIT,
                    ...(admin && preview
                        ? {
                              viewAll: preview.viewAll,
                              previewLocationKey:
                                  'previewLocationKey' in preview
                                      ? preview.previewLocationKey
                                      : undefined,
                          }
                        : {}),
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

            const locationKey = viewerLocationKeyRef.current;
            const skipVisibility =
                isAdminRef.current && adminViewAllRef.current;

            if (
                !skipVisibility &&
                !announcementVisibleToViewer(locationKey, envelope.visibility)
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

        const unsubscribe = subscribeChannelEvent(
            client,
            channel,
            ANNOUNCEMENTS_ABLY_EVENT,
            onMessage
        );

        return () => {
            unsubscribe();
            releaseRealtimeClient(hackathonId);
        };
    }, [hackathonId, setAnnouncements]);

    return null;
}
