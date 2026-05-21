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

export function isProjectsGalleryOpen(
    nowMs: number,
    submissionDeadline: Date
): boolean {
    return nowMs >= submissionDeadline.getTime();
}

/** Judges and admins can browse submissions before the public gallery opens. */
export function canAccessProjectGallery(
    nowMs: number,
    submissionDeadline: Date,
    userRole?: string | null
): boolean {
    if (userRole === 'judge' || userRole === 'admin') {
        return true;
    }
    return isProjectsGalleryOpen(nowMs, submissionDeadline);
}
