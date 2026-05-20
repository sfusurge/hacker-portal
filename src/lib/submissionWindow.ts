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
