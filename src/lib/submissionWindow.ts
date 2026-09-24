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
    submissionDeadline: Date | null | undefined
): boolean {
    if (submissionOpen == null || submissionDeadline == null) return false;
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
    submissionDeadline: Date | null | undefined
): Date | null {
    return projectGalleryOpen ?? submissionDeadline ?? null;
}

export function isProjectsGalleryOpen(
    nowMs: number,
    projectGalleryOpen: Date | null | undefined,
    submissionDeadline: Date | null | undefined
): boolean {
    const openAt = getProjectGalleryOpenDate(
        projectGalleryOpen,
        submissionDeadline
    );
    if (openAt == null) return false;
    return nowMs >= openAt.getTime();
}

/** After submissions close and before the project gallery opens (check-in ticket period). */
export function isPreGalleryCheckInPeriod(
    nowMs: number,
    projectGalleryOpen: Date | null | undefined,
    submissionDeadline: Date | null | undefined
): boolean {
    if (submissionDeadline == null) return false;
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
    submissionDeadline: Date | null | undefined,
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
