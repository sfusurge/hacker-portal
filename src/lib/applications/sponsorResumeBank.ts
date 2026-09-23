import type {
    DisplayRole,
    InputFormPageData,
} from '@/components/application_components/types';
import {
    resolveApplicationLinkUrl,
    resolveApplicationQuestionIdByRole,
} from '@/lib/applications/applicationReviewExport';
import {
    formatSubmissionFieldValue,
    getResponseValue,
} from '@/lib/admin/submissionExport';

export const SPONSOR_RESUME_BANK_ROLES = [
    'firstName',
    'lastName',
    'email',
    'school',
    'resume',
    'github',
    'linkedin',
] as const satisfies readonly DisplayRole[];

export type SponsorResumeBankRole = (typeof SPONSOR_RESUME_BANK_ROLES)[number];

export function resolveSponsorResumeBankQuestionIds(
    pages: InputFormPageData[] | undefined
): Partial<Record<SponsorResumeBankRole, string>> {
    const out: Partial<Record<SponsorResumeBankRole, string>> = {};
    for (const role of SPONSOR_RESUME_BANK_ROLES) {
        const questionId = resolveApplicationQuestionIdByRole(pages, role);
        if (questionId) out[role] = questionId;
    }
    return out;
}

export function getSponsorResumeBankFieldKeys(
    pages: InputFormPageData[] | undefined
): Set<string> {
    return new Set(Object.values(resolveSponsorResumeBankQuestionIds(pages)));
}

function hasResumeValue(value: unknown): boolean {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
}

/** Keep only sponsor-safe response keys; drop applicants with no resume. */
export function toSponsorResumeBankResponse(
    response: Record<string, unknown>,
    pages: InputFormPageData[] | undefined
): Record<string, unknown> | null {
    const ids = resolveSponsorResumeBankQuestionIds(pages);
    const resumeQuestionId = ids.resume;
    if (!resumeQuestionId) return null;

    const resume = getResponseValue(response, resumeQuestionId);
    if (!hasResumeValue(resume)) return null;

    const allowed = new Set(Object.values(ids));
    return Object.fromEntries(
        Object.entries(response).filter(([key]) => allowed.has(key))
    );
}

export type SponsorResumeBankRow = {
    firstName: string;
    lastName: string;
    email: string;
    school: string;
    github: string;
    linkedin: string;
    resumeUrl: string | null;
};

function responseString(
    response: Record<string, unknown>,
    questionId: string | undefined
): string {
    if (!questionId) return 'N/A';
    const formatted = formatSubmissionFieldValue(
        getResponseValue(response, questionId)
    ).trim();
    return formatted || 'N/A';
}

export function mapSponsorResumeBankRow(
    response: Record<string, unknown>,
    pages: InputFormPageData[] | undefined
): SponsorResumeBankRow {
    const ids = resolveSponsorResumeBankQuestionIds(pages);
    const resumeUrl =
        ids.resume != null
            ? (resolveApplicationLinkUrl(
                  getResponseValue(response, ids.resume)
              ) ?? null)
            : null;

    return {
        firstName: responseString(response, ids.firstName),
        lastName: responseString(response, ids.lastName),
        email: responseString(response, ids.email),
        school: responseString(response, ids.school),
        github: responseString(response, ids.github),
        linkedin: responseString(response, ids.linkedin),
        resumeUrl,
    };
}
