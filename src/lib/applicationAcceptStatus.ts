import type { ApplicationStatus } from '@/db/schema/applications';

/**
 * Pending status when an organizer accepts an applicant, based on event location
 * (question id `2`: `sfu` vs `waterloo`). Falls back to hackathon `isPaid` when unknown.
 */
export function getAcceptPendingStatusForEventLocation(
    eventLocationKey: string | undefined | null,
    isPaidFallback: boolean
): Extract<
    ApplicationStatus,
    'Accepted - Pending Payment' | 'Accepted - RSVP to Confirm'
> {
    if (eventLocationKey === 'waterloo') {
        return 'Accepted - RSVP to Confirm';
    }
    if (eventLocationKey === 'sfu') {
        return 'Accepted - Pending Payment';
    }
    return isPaidFallback
        ? 'Accepted - Pending Payment'
        : 'Accepted - RSVP to Confirm';
}
