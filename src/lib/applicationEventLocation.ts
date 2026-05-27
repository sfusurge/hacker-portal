import type { InputFormPageData } from '@/components/application_components/types';
import { getApplicationResponseField } from '@/lib/applications/applicationReviewExport';

/**
 * Reads the applicant's event-location choice from their application response.
 * Resolves the answer via `displayRole: "location"`
 * Returns a normalized key (e.g. `sfu`, `waterloo`, `remote`) for announcement filtering and check-in labels.
 */
export function getApplicationEventLocationKey(
    response: Record<string, unknown> | null | undefined,
    applicationQuestionPages?: InputFormPageData[] | undefined
): string | null {
    if (response == null) {
        return null;
    }

    const raw = getApplicationResponseField(
        response,
        applicationQuestionPages,
        'location'
    );

    if (typeof raw !== 'string') {
        return null;
    }

    const trimmed = raw.trim();
    return trimmed ? trimmed.toLowerCase() : null;
}
