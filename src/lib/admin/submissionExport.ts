import type {
    InputFormPageData,
    InputFormQuestion,
    QuestionMultipleChoice,
} from '@/components/application_components/types';
import {
    buildSubmissionCsvExportColumns,
    type SubmissionCsvExportOptions,
} from '@/lib/projects/buildSubmissionReviewTableColumns';
import {
    flattenSubmissionQuestions,
    hasDisplayRole,
} from '@/lib/projects/submissionFormQuestions';
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

export type SubmissionLocationFilterKey = 'all' | 'waterloo' | 'sfu';

export type SubmissionLocationOption = {
    key: 'waterloo' | 'sfu';
    label: string;
};

const DEFAULT_LOCATION_OPTIONS: SubmissionLocationOption[] = [
    { key: 'sfu', label: 'Vancouver (SFU)' },
    { key: 'waterloo', label: 'Waterloo' },
];

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

    for (const q of flattenSubmissionQuestions(pages)) {
        if (q.type === 'multiple-choice' && hasDisplayRole(q, 'location')) {
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

function toBinaryString(value: boolean): string {
    return value ? '1' : '0';
}

function findSubmissionQuestionById(
    pages: InputFormPageData[] | undefined,
    questionId: string | undefined
): InputFormQuestion | undefined {
    if (!questionId || !pages?.length) return undefined;
    return flattenSubmissionQuestions(pages).find(
        (q) => q.questionId != null && String(q.questionId) === questionId
    );
}

function formatCheckboxExportValue(value: unknown): string {
    return toBinaryString(value === true || value === 'true');
}

/** Judge compliance multiple-choice → `1` / `0` for CSV export only. */
function formatJudgeMultipleChoiceExportValue(
    value: unknown,
    title: string
): string {
    const text = formatSubmissionFieldValue(value).trim();
    if (!text) return '0';

    if (
        /external resources/i.test(title) ||
        /ai tools or services/i.test(title)
    ) {
        return toBinaryString(/^yes,\s*all/i.test(text));
    }

    return toBinaryString(/^yes/i.test(text));
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

/** Build one CSV row (table columns, or all questions when `includeAllQuestions`). */
export function submissionToCsvRecord(
    submission: SubmissionExportRow,
    pages?: InputFormPageData[],
    options: SubmissionCsvExportOptions = {}
): Record<string, string> {
    const columns = buildSubmissionCsvExportColumns(pages, options);
    const record: Record<string, string> = {};

    for (const col of columns) {
        if (col.id === 'team_id') {
            record[col.id] = String(submission.teamId);
            continue;
        }
        if (col.id === 'team_name') {
            record[col.id] = submission.teamName;
            continue;
        }
        record[col.id] = getSubmissionCsvExportField(
            submission.response,
            col.questionId,
            pages
        );
    }

    return record;
}

export function formatSubmissionDate(createdDate: Date | string): string {
    return new Date(createdDate).toISOString();
}

/** Human-readable value for the admin review table UI. */
export function getSubmissionExportField(
    response: Record<string, unknown>,
    questionId: string | undefined
): string {
    return formatSubmissionFieldValue(getResponseValue(response, questionId));
}

/** `0` / `1` values for CSV download only. */
export function getSubmissionCsvExportField(
    response: Record<string, unknown>,
    questionId: string | undefined,
    pages?: InputFormPageData[]
): string {
    const raw = getResponseValue(response, questionId);
    const question = findSubmissionQuestionById(pages, questionId);

    if (!question) {
        return formatSubmissionFieldValue(raw);
    }

    if (question.type === 'checkbox') {
        return formatCheckboxExportValue(raw);
    }

    if (
        question.type === 'multiple-choice' &&
        hasDisplayRole(question, 'judge')
    ) {
        return formatJudgeMultipleChoiceExportValue(raw, question.title ?? '');
    }

    if (question.type === 'link') {
        return toBinaryString(
            formatSubmissionFieldValue(raw).trim().length > 0
        );
    }

    return formatSubmissionFieldValue(raw);
}
