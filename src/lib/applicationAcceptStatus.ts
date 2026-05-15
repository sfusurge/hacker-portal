import type { ApplicationStatus } from '@/db/schema/applications';

// statuses where the hacker may use the event check-in QR ticket
const TICKET_QR_ELIGIBLE_STATUSES = new Set<string>(['Accepted']);

export function isEligibleForHackathonTicketQr(
    currentStatus: string | undefined | null
): boolean {
    if (currentStatus == null || currentStatus === '') {
        return false;
    }
    return TICKET_QR_ELIGIBLE_STATUSES.has(currentStatus.trim());
}

// short region label for ticket UI (application question `2`: sfu | waterloo | remote).
export function formatTicketRegionShortLabel(
    eventLocationKey: string | undefined | null
): string {
    if (eventLocationKey == null || eventLocationKey === '') {
        return '';
    }
    const key = eventLocationKey.trim().toLowerCase();
    if (key === 'sfu') {
        return 'Vancouver';
    }
    if (key === 'waterloo') {
        return 'Waterloo';
    }
    if (key === 'remote') {
        return 'Virtual';
    }
    return '';
}

/** label for application question `2` (event location choice keys). */
export function formatEventLocationLabel(
    eventLocationKey: string | undefined | null
): string {
    if (eventLocationKey == null || eventLocationKey === '') {
        return '';
    }
    const key = eventLocationKey.trim().toLowerCase();
    if (key === 'sfu') {
        return 'Simon Fraser University, Burnaby';
    }
    if (key === 'waterloo') {
        return 'University of Waterloo, Waterloo';
    }
    if (key === 'remote') {
        return 'Virtual Conference Week Only';
    }
    return eventLocationKey;
}

/**
 * Pending status when an organizer accepts an applicant, based on event location
 * (question id `2`: `sfu`, `waterloo`, or `remote` / virtual).
 */
export function getAcceptPendingStatusForEventLocation(
    eventLocationKey: string | undefined | null
): Extract<
    ApplicationStatus,
    'Accepted' | 'Accepted - Pending Payment' | 'Accepted - RSVP to Confirm'
> {
    const key = eventLocationKey?.trim().toLowerCase();
    if (key === 'waterloo') {
        return 'Accepted - RSVP to Confirm';
    }
    if (key === 'sfu') {
        return 'Accepted - Pending Payment';
    }
    /** Virtual / online-only track: fully accepted */
    if (key === 'remote') {
        return 'Accepted';
    }
    return 'Accepted - RSVP to Confirm';
}
