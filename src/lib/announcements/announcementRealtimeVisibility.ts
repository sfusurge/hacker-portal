export type AnnouncementRealtimeVisibility = {
    mappingJoined: boolean;
    mappingEventLocationKey: string | null;
};

export function announcementVisibleToViewer(
    viewerLocationKey: string | null,
    visibility: AnnouncementRealtimeVisibility
): boolean {
    const { mappingJoined, mappingEventLocationKey } = visibility;
    const unrestricted =
        !mappingJoined ||
        mappingEventLocationKey == null ||
        mappingEventLocationKey.trim() === '';

    if (viewerLocationKey != null && viewerLocationKey.trim() !== '') {
        const k = viewerLocationKey.trim().toLowerCase();
        if (unrestricted) return true;
        return mappingEventLocationKey!.trim().toLowerCase() === k;
    }

    return unrestricted;
}
