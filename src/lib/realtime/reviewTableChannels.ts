export const REVIEW_TABLE_ABLY_EVENT = 'applications-review' as const;

export function reviewTableChannelName(hackathonId: number): string {
    return `hackathon:${hackathonId}:applications-review`;
}

export type ReviewTableRealtimePayload = {
    hackathonId: number;
};
