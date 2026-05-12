/**
 * Application question id `2` stores which in-person / remote site the applicant
 * selected (`sfu`, `waterloo`, `remote`, …).
 */
export function getApplicationEventLocationKey(
    response: Record<string, unknown> | null | undefined
): string | null {
    if (response == null) {
        return null;
    }
    const v = response['2'];
    if (typeof v !== 'string' || v.trim() === '') {
        return null;
    }
    return v.trim().toLowerCase();
}
