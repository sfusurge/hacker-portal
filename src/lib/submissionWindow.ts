import { hasAdminAccess } from '@/lib/auth/roles';

/** Hackathons without a submission open date do not run project submissions. */
export function hackathonHasProjectSubmissions(
    submissionOpen: Date | null | undefined
): boolean {
    return submissionOpen != null;
}

export function isSubmissionWindowOpen(
    nowMs: number,
    submissionOpen: Date | null | undefined,
    submissionDeadline: Date
): boolean {
    if (submissionOpen == null) return false;
    const openMs = submissionOpen.getTime();
    const deadlineMs = submissionDeadline.getTime();
    return nowMs >= openMs && nowMs <= deadlineMs;
}

export function isSubmissionUiHiddenBeforeOpen(
    nowMs: number,
    submissionOpen: Date | null | undefined
): boolean {
    if (submissionOpen == null) return true;
    return nowMs < submissionOpen.getTime();
}

export function getProjectGalleryOpenDate(
    projectGalleryOpen: Date | null | undefined,
    submissionDeadline: Date
): Date {
    return projectGalleryOpen ?? submissionDeadline;
}

export function isProjectsGalleryOpen(
    nowMs: number,
    projectGalleryOpen: Date | null | undefined,
    submissionDeadline: Date
): boolean {
    return (
        nowMs >=
        getProjectGalleryOpenDate(
            projectGalleryOpen,
            submissionDeadline
        ).getTime()
    );
}

/** After submissions close and before the project gallery opens (check-in ticket period). */
export function isPreGalleryCheckInPeriod(
    nowMs: number,
    projectGalleryOpen: Date | null | undefined,
    submissionDeadline: Date
): boolean {
    if (isProjectsGalleryOpen(nowMs, projectGalleryOpen, submissionDeadline)) {
        return false;
    }
    return nowMs >= submissionDeadline.getTime();
}

/**
 * Whether Project Gallery should appear in nav / be browsable.
 * Requires the hackathon to have project submissions (`submissionOpen` set).
 * Judges and admins can browse before the public gallery opens.
 */
export function canAccessProjectGallery(
    nowMs: number,
    projectGalleryOpen: Date | null | undefined,
    submissionDeadline: Date,
    userRole?: string | null,
    submissionOpen?: Date | null
): boolean {
    if (!hackathonHasProjectSubmissions(submissionOpen)) {
        return false;
    }
    if (userRole === 'judge' || hasAdminAccess(userRole)) {
        return true;
    }
    return isProjectsGalleryOpen(nowMs, projectGalleryOpen, submissionDeadline);
}
