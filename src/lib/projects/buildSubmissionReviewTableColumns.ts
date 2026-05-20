import type { InputFormPageData } from '@/components/application_components/types';
import {
    flattenSubmissionQuestions,
    getSubmissionReviewTableQuestions,
    hasDisplayRole,
    isVisibleInReviewTable,
} from '@/lib/projects/submissionFormQuestions';

export type SubmissionReviewTableColumn = {
    id: string;
    header: string;
    questionId: string;
};

const CSV_TEAM_COLUMNS: SubmissionReviewTableColumn[] = [
    { id: 'team_id', header: 'Team ID', questionId: '' },
    { id: 'team_name', header: 'Team Name', questionId: '' },
];

export function buildSubmissionReviewTableColumns(
    pages: InputFormPageData[] | undefined
): SubmissionReviewTableColumn[] {
    return getSubmissionReviewTableQuestions(pages).map((q) => ({
        id: String(q.questionId),
        header: q.title,
        questionId: String(q.questionId),
    }));
}

/** CSV export columns: team metadata + questions with `displayRole` including `table`. */
export function buildSubmissionCsvExportColumns(
    pages: InputFormPageData[] | undefined
): SubmissionReviewTableColumn[] {
    return [...CSV_TEAM_COLUMNS, ...buildSubmissionReviewTableColumns(pages)];
}

/** CSV column keys in export order (derived from `displayRole: "table"`). */
export function getSubmissionCsvColumnKeys(
    pages: InputFormPageData[] | undefined
): string[] {
    return buildSubmissionCsvExportColumns(pages).map((col) => col.id);
}

export function buildSubmissionCsvColumnHeaders(
    pages: InputFormPageData[] | undefined
) {
    return buildSubmissionCsvExportColumns(pages).map((col) => ({
        key: col.id,
        displayLabel: col.header,
    }));
}

export function resolveSubmissionReviewTableLocationQuestionId(
    pages: InputFormPageData[] | undefined
): string | undefined {
    const location = flattenSubmissionQuestions(pages).find(
        (q) =>
            q.questionId != null &&
            isVisibleInReviewTable(q) &&
            hasDisplayRole(q, 'location')
    );

    return location?.questionId != null
        ? String(location.questionId)
        : undefined;
}
