import type { HackathonData } from '@/components/application_components/types';
import dayjs, { type Dayjs } from 'dayjs';

/** When enabled, show vote UI in the project sidebar column instead of sticky footers. */
export const AUDIENCE_VOTING_UI_IN_SIDEBAR_COLUMN = true;

export function isAudienceVotingEnabled(
    hackathon: Pick<HackathonData, 'audienceVotingEnabled'>
): boolean {
    return hackathon.audienceVotingEnabled === true;
}

export function isAudienceVotingWindowOpen(
    nowMs: number,
    open: Date | Dayjs | null | undefined,
    closes: Date | Dayjs | null | undefined
): boolean {
    if (open == null || closes == null) return false;
    const openMs = dayjs(open).valueOf();
    const closesMs = dayjs(closes).valueOf();
    return nowMs >= openMs && nowMs <= closesMs;
}

export function isAudienceVotingPastDeadline(
    nowMs: number,
    closes: Date | Dayjs | null | undefined
): boolean {
    if (closes == null) return false;
    return nowMs > dayjs(closes).valueOf();
}

export function isAudienceVotingUiActive(
    nowMs: number,
    hackathon: Pick<
        HackathonData,
        'audienceVotingEnabled' | 'audienceVotingOpen' | 'audienceVotingCloses'
    >
): boolean {
    if (!isAudienceVotingEnabled(hackathon)) return false;
    return (
        isAudienceVotingWindowOpen(
            nowMs,
            hackathon.audienceVotingOpen,
            hackathon.audienceVotingCloses
        ) ||
        isAudienceVotingPastDeadline(nowMs, hackathon.audienceVotingCloses) ||
        (hackathon.audienceVotingOpen != null &&
            nowMs < dayjs(hackathon.audienceVotingOpen).valueOf())
    );
}

export function isAudienceVotingPeriodForTeamDashboard(
    nowMs: number,
    hackathon: Pick<
        HackathonData,
        | 'audienceVotingEnabled'
        | 'submissionDeadline'
        | 'audienceVotingOpen'
        | 'audienceVotingCloses'
    >
): boolean {
    if (!isAudienceVotingEnabled(hackathon)) return false;
    if (nowMs < hackathon.submissionDeadline.valueOf()) return false;
    if (
        hackathon.audienceVotingOpen == null ||
        hackathon.audienceVotingCloses == null
    ) {
        return false;
    }
    return (
        isAudienceVotingWindowOpen(
            nowMs,
            hackathon.audienceVotingOpen,
            hackathon.audienceVotingCloses
        ) || isAudienceVotingPastDeadline(nowMs, hackathon.audienceVotingCloses)
    );
}
