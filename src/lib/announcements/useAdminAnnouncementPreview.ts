'use client';

import {
    adminAnnouncementsPreviewLocationKeyAtom,
    adminAnnouncementsViewAllAtom,
    userInfoAtom,
    viewerAnnouncementLocationKeyAtom,
} from '@/app/(auth)/ClientContext';
import { useAtomValue } from 'jotai';

// used for visibility filtering (Ably + preview mode)
export function useEffectiveAnnouncementLocationKey(): string | null {
    const isAdmin = useAtomValue(userInfoAtom)?.userRole === 'admin';
    const viewAllChannels = useAtomValue(adminAnnouncementsViewAllAtom);
    const previewLocationKey = useAtomValue(
        adminAnnouncementsPreviewLocationKeyAtom
    );
    const viewerLocationKey = useAtomValue(viewerAnnouncementLocationKeyAtom);

    if (isAdmin && !viewAllChannels) {
        return previewLocationKey !== undefined
            ? previewLocationKey
            : viewerLocationKey;
    }
    return viewerLocationKey;
}

// passed to `getAnnouncements` when an admin is previewing a specific audience.
export function useAdminAnnouncementPreviewQueryInput():
    | { viewAll: false; previewLocationKey: string | null }
    | { viewAll: true }
    | undefined {
    const isAdmin = useAtomValue(userInfoAtom)?.userRole === 'admin';
    const viewAllChannels = useAtomValue(adminAnnouncementsViewAllAtom);
    const previewLocationKey = useAtomValue(
        adminAnnouncementsPreviewLocationKeyAtom
    );
    const viewerLocationKey = useAtomValue(viewerAnnouncementLocationKeyAtom);

    if (!isAdmin) return undefined;
    if (viewAllChannels) return { viewAll: true };
    const key =
        previewLocationKey !== undefined
            ? previewLocationKey
            : viewerLocationKey;
    return { viewAll: false, previewLocationKey: key ?? null };
}
