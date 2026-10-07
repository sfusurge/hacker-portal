import type {
    DisplayRole,
    InputFormPageData,
    InputFormQuestion,
} from '@/components/application_components/types';
import {
    resolveApplicationLinkUrl,
    resolveApplicationQuestionIdByRole,
} from '@/lib/applications/applicationReviewExport';
import {
    formatSubmissionFieldValue,
    getResponseValue,
} from '@/lib/admin/submissionExport';
import { flattenSubmissionQuestions } from '@/lib/projects/submissionFormQuestions';

export const SPONSOR_RESUME_BANK_ROLES = [
    'firstName',
    'lastName',
    'email',
    'school',
    'education',
    'resume',
    'github',
    'linkedin',
] as const satisfies readonly DisplayRole[];

export const SECONDARY_SCHOOL_LABEL = 'Secondary / High School';
export const OTHER_SCHOOL_LABEL = 'Other';
export const MIN_SCHOOL_COUNT_FOR_LABEL = 7;

const SECONDARY_EDUCATION_VALUES = new Set([
    'secondary',
    'less_than_secondary',
]);

export function isSecondaryEducationLevel(value: string | undefined): boolean {
    if (!value) return false;
    const normalized = value.trim().toLowerCase();
    if (SECONDARY_EDUCATION_VALUES.has(normalized)) return true;
    // Also match readable labels like "High School".
    return (
        normalized.includes('secondary') ||
        normalized.includes('high school') ||
        normalized.includes('less than secondary')
    );
}

export type SponsorResumeBankRole = (typeof SPONSOR_RESUME_BANK_ROLES)[number];

function questionTitle(q: InputFormQuestion): string {
    return String(q.title ?? '')
        .trim()
        .toLowerCase();
}

// Fallback: match question title when displayRole is missing/hidden.
function resolveQuestionIdByTitleHints(
    pages: InputFormPageData[] | undefined,
    hints: string[]
): string | undefined {
    const match = flattenSubmissionQuestions(pages).find((q) => {
        if (q.questionId == null) return false;
        const title = questionTitle(q);
        return hints.some((hint) => title.includes(hint));
    });
    return match?.questionId != null ? String(match.questionId) : undefined;
}

export function resolveSponsorResumeBankQuestionIds(
    pages: InputFormPageData[] | undefined
): Partial<Record<SponsorResumeBankRole, string>> {
    const out: Partial<Record<SponsorResumeBankRole, string>> = {};
    for (const role of SPONSOR_RESUME_BANK_ROLES) {
        const questionId = resolveApplicationQuestionIdByRole(pages, role);
        if (questionId) out[role] = questionId;
    }

    // Title fallback when displayRole is hidden (e.g. LinkedIn).
    if (!out.linkedin) {
        const byTitle = resolveQuestionIdByTitleHints(pages, ['linkedin']);
        if (byTitle) out.linkedin = byTitle;
    }
    if (!out.github) {
        const byTitle = resolveQuestionIdByTitleHints(pages, ['github']);
        if (byTitle) out.github = byTitle;
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

// Keep sponsor-safe fields only; skip applicants with no resume.
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
    education: string;
    github: string;
    linkedin: string;
    resumeUrl: string | null;
};

// Bucket schools: secondary together; rare schools → Other.
export function assignSponsorSchoolLabels<
    T extends { school: string; education?: string },
>(rows: T[]): (T & { schoolLabel: string })[] {
    const provisional = rows.map((row) => {
        if (isSecondaryEducationLevel(row.education)) {
            return { ...row, schoolLabel: SECONDARY_SCHOOL_LABEL };
        }
        const school = row.school.trim();
        return {
            ...row,
            schoolLabel:
                school && school !== 'N/A' ? school : OTHER_SCHOOL_LABEL,
        };
    });

    const counts = new Map<string, number>();
    for (const row of provisional) {
        counts.set(row.schoolLabel, (counts.get(row.schoolLabel) ?? 0) + 1);
    }

    return provisional.map((row) => {
        if (row.schoolLabel === SECONDARY_SCHOOL_LABEL) return row;
        if ((counts.get(row.schoolLabel) ?? 0) < MIN_SCHOOL_COUNT_FOR_LABEL) {
            return { ...row, schoolLabel: OTHER_SCHOOL_LABEL };
        }
        return row;
    });
}

// Show real school name when bucket is Other (filter still uses Other).
export function displaySponsorSchool(row: {
    school: string;
    schoolLabel: string;
}): string {
    if (row.schoolLabel === OTHER_SCHOOL_LABEL) {
        const school = row.school.trim();
        if (school && school !== 'N/A') return school;
    }
    return row.schoolLabel;
}

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
        education: responseString(response, ids.education),
        github: responseString(response, ids.github),
        linkedin: responseString(response, ids.linkedin),
        resumeUrl,
    };
}
