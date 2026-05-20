import type {
    InputFormPageData,
    QuestionInline,
    QuestionMultipleChoice,
} from '@/components/application_components/types';
import {
    formFieldContentToPlainText,
    isQuillDelta,
} from '@/lib/markdown/content';

export type SubmissionExportRow = {
    teamId: number;
    teamName: string;
    submittedAt: string;
    status: string;
    response: Record<string, unknown>;
};

/** Fixed CSV column order matching the admin export template. */
export const SUBMISSION_CSV_COLUMN_KEYS = [
    'team_id',
    'team_name',
    'project_name',
    'track',
    'used_prot',
    'visuals_ai',
    'external_r',
    'ai_tools_c',
] as const;

export type SubmissionCsvColumnKey =
    (typeof SUBMISSION_CSV_COLUMN_KEYS)[number];

export type ResolvedSubmissionQuestionIds = {
    projectName?: string;
    track?: string;
    location?: string;
    usedProt?: string;
    visualsAi?: string;
    externalResources?: string;
    aiToolsCited?: string;
};

export type SubmissionLocationFilterKey = 'all' | 'waterloo' | 'sfu';

export type SubmissionLocationOption = {
    key: 'waterloo' | 'sfu';
    label: string;
};

const DEFAULT_LOCATION_OPTIONS: SubmissionLocationOption[] = [
    { key: 'sfu', label: 'Vancouver (SFU)' },
    { key: 'waterloo', label: 'Waterloo' },
];

type FlatQuestion = {
    questionId: number;
    type: string;
    title: string;
};

function flattenFormQuestions(
    pages: InputFormPageData[] | undefined
): FlatQuestion[] {
    if (!pages?.length) return [];
    const out: FlatQuestion[] = [];

    for (const page of pages) {
        for (const q of page.questions ?? []) {
            if (q.type === 'inline') {
                for (const c of (q as QuestionInline).content ?? []) {
                    if (c.questionId != null) {
                        out.push({
                            questionId: c.questionId,
                            type: c.type,
                            title: c.title ?? '',
                        });
                    }
                }
            } else if (q.questionId != null) {
                out.push({
                    questionId: q.questionId,
                    type: q.type,
                    title: q.title ?? '',
                });
            }
        }
    }

    return out;
}

function titleMatches(title: string, pattern: RegExp): boolean {
    return pattern.test(title);
}

function findQuestionId(
    questions: FlatQuestion[],
    predicate: (q: FlatQuestion) => boolean
): string | undefined {
    const match = questions.find(predicate);
    return match ? String(match.questionId) : undefined;
}

/**
 * Map submission form questions to CSV fields by title (test.json / red.json).
 */
export function resolveSubmissionExportQuestionIds(
    pages: InputFormPageData[] | undefined
): ResolvedSubmissionQuestionIds {
    const questions = flattenFormQuestions(pages);

    const projectName =
        findQuestionId(
            questions,
            (q) =>
                (q.type === 'title-line' || q.type === 'text-line') &&
                titleMatches(q.title, /^title$/i)
        ) ??
        findQuestionId(questions, (q) =>
            titleMatches(q.title, /project.*title|^title$/i)
        );

    const track = findQuestionId(questions, (q) =>
        titleMatches(q.title, /project track|which project track/i)
    );

    const location = findQuestionId(questions, (q) =>
        titleMatches(q.title, /participating from|where is your team/i)
    );

    const usedProtProtopie = findQuestionId(questions, (q) =>
        titleMatches(q.title, /protopie/i)
    );
    const usedProtLink = findQuestionId(questions, (q) =>
        titleMatches(q.title, /prototype link|link to prototype/i)
    );

    const visualsAi = findQuestionId(questions, (q) =>
        titleMatches(q.title, /ai to generate any visuals/i)
    );

    const externalResources = findQuestionId(questions, (q) =>
        titleMatches(q.title, /external resources/i)
    );

    const aiToolsCited = findQuestionId(questions, (q) =>
        titleMatches(q.title, /ai tools or services/i)
    );

    return {
        projectName,
        track,
        location,
        usedProt: usedProtProtopie ?? usedProtLink,
        visualsAi,
        externalResources,
        aiToolsCited,
    };
}

/** Normalize submission location answers to `sfu` or `waterloo`. */
export function normalizeSubmissionLocationKey(
    value: unknown
): 'waterloo' | 'sfu' | null {
    const text = formatSubmissionFieldValue(value).trim().toLowerCase();
    if (!text) return null;
    if (text.includes('waterloo')) return 'waterloo';
    if (text.includes('vancouver') || text === 'sfu') return 'sfu';
    return null;
}

export function getSubmissionLocationKey(
    response: Record<string, unknown>,
    locationQuestionId: string | undefined
): 'waterloo' | 'sfu' | null {
    if (!locationQuestionId) return null;
    return normalizeSubmissionLocationKey(
        getResponseValue(response, locationQuestionId)
    );
}

export function getSubmissionLocationFilterOptions(
    pages: InputFormPageData[] | undefined
): SubmissionLocationOption[] {
    if (!pages?.length) return DEFAULT_LOCATION_OPTIONS;

    for (const page of pages) {
        for (const q of page.questions ?? []) {
            if (
                q.type === 'multiple-choice' &&
                titleMatches(
                    q.title ?? '',
                    /participating from|where is your team/i
                )
            ) {
                const choices = (q as QuestionMultipleChoice).choices ?? [];
                const options = choices
                    .map((choice) => {
                        const key = normalizeSubmissionLocationKey(choice.data);
                        if (key !== 'waterloo' && key !== 'sfu') return null;
                        return {
                            key,
                            label: choice.name?.trim() || choice.data,
                        };
                    })
                    .filter(
                        (option): option is SubmissionLocationOption =>
                            option !== null
                    );

                if (options.length > 0) {
                    return options;
                }
            }
        }
    }

    return DEFAULT_LOCATION_OPTIONS;
}

export function filterSubmissionsByLocation<
    T extends { response: Record<string, unknown> },
>(
    rows: T[],
    locationQuestionId: string | undefined,
    filter: SubmissionLocationFilterKey
): T[] {
    if (filter === 'all' || !locationQuestionId) {
        return rows;
    }

    return rows.filter(
        (row) =>
            getSubmissionLocationKey(row.response, locationQuestionId) ===
            filter
    );
}

export function getResponseValue(
    response: Record<string, unknown>,
    questionId: string | undefined
): unknown {
    if (!questionId) return undefined;
    if (Object.prototype.hasOwnProperty.call(response, questionId)) {
        return response[questionId];
    }
    const numericId = Number(questionId);
    if (
        Number.isFinite(numericId) &&
        Object.prototype.hasOwnProperty.call(response, numericId)
    ) {
        return response[numericId as unknown as string];
    }
    return undefined;
}

export function formatSubmissionFieldValue(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (isQuillDelta(value)) {
        return formFieldContentToPlainText(value);
    }
    if (Array.isArray(value)) {
        return value
            .map((item) =>
                typeof item === 'string' ? item : JSON.stringify(item)
            )
            .join(', ');
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

function toCsvBoolean(value: boolean): string {
    return value ? '1' : '0';
}

/** 1 when a multiple-choice answer starts with "Yes". */
function multipleChoiceStartsWithYes(value: unknown): string {
    const text = formatSubmissionFieldValue(value).trim();
    if (!text) return '0';
    return toCsvBoolean(/^yes/i.test(text));
}

/** 1 only for fully affirmative answers ("Yes, all …"). */
function multipleChoiceYesAll(value: unknown): string {
    const text = formatSubmissionFieldValue(value).trim();
    if (!text) return '0';
    return toCsvBoolean(/^yes,\s*all/i.test(text));
}

function hasNonEmptyValue(value: unknown): string {
    return toCsvBoolean(formatSubmissionFieldValue(value).trim().length > 0);
}

function resolveUsedProt(
    response: Record<string, unknown>,
    questionIds: ResolvedSubmissionQuestionIds,
    questions: FlatQuestion[]
): string {
    const protopieId = findQuestionId(questions, (q) =>
        titleMatches(q.title, /protopie/i)
    );
    if (protopieId) {
        return multipleChoiceStartsWithYes(
            getResponseValue(response, protopieId)
        );
    }

    const linkId = findQuestionId(questions, (q) =>
        titleMatches(q.title, /prototype link|link to prototype/i)
    );
    if (linkId) {
        return hasNonEmptyValue(getResponseValue(response, linkId));
    }

    if (questionIds.usedProt) {
        const q = questions.find(
            (item) => String(item.questionId) === questionIds.usedProt
        );
        if (q?.type === 'checkbox') {
            const raw = getResponseValue(response, questionIds.usedProt);
            return toCsvBoolean(raw === true || raw === 'true');
        }
        if (q?.type === 'link') {
            return hasNonEmptyValue(
                getResponseValue(response, questionIds.usedProt)
            );
        }
        return multipleChoiceStartsWithYes(
            getResponseValue(response, questionIds.usedProt)
        );
    }

    return '0';
}

export function submissionToCsvRecord(
    submission: SubmissionExportRow,
    questionIds: ResolvedSubmissionQuestionIds,
    pages?: InputFormPageData[]
): Record<SubmissionCsvColumnKey, string> {
    const questions = flattenFormQuestions(pages);
    const { response } = submission;

    return {
        team_id: String(submission.teamId),
        team_name: submission.teamName,
        project_name: formatSubmissionFieldValue(
            getResponseValue(response, questionIds.projectName)
        ),
        track: formatSubmissionFieldValue(
            getResponseValue(response, questionIds.track)
        ),
        used_prot: resolveUsedProt(response, questionIds, questions),
        visuals_ai: multipleChoiceStartsWithYes(
            getResponseValue(response, questionIds.visualsAi)
        ),
        external_r: multipleChoiceYesAll(
            getResponseValue(response, questionIds.externalResources)
        ),
        ai_tools_c: multipleChoiceYesAll(
            getResponseValue(response, questionIds.aiToolsCited)
        ),
    };
}

export function formatSubmissionDate(createdDate: Date | string): string {
    return new Date(createdDate).toISOString();
}

export function getSubmissionExportField(
    response: Record<string, unknown>,
    questionId: string | undefined
): string {
    return formatSubmissionFieldValue(getResponseValue(response, questionId));
}
