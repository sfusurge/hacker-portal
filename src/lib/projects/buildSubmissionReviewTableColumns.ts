import type {
    InputFormPageData,
    InputFormQuestion,
} from '@/components/application_components/types';
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

// all submission table columns (including questions with `displayRole` including `table`)
export function buildAllSubmissionTableColumns(
    pages: InputFormPageData[] | undefined
): SubmissionReviewTableColumn[] {
    return flattenSubmissionQuestions(pages)
        .filter(
            (q): q is InputFormQuestion & { questionId: number } =>
                q.questionId != null
        )
        .map((q) => ({
            id: String(q.questionId),
            header: q.title?.trim() || `Question ${q.questionId}`,
            questionId: String(q.questionId),
        }));
}

// CSV export columns: team metadata + questions with `displayRole` including `table`
export function buildSubmissionCsvExportColumns(
    pages: InputFormPageData[] | undefined
): SubmissionReviewTableColumn[] {
    return [...CSV_TEAM_COLUMNS, ...buildSubmissionReviewTableColumns(pages)];
}

// CSV export columns: team metadata + every submission question
export function buildAllSubmissionCsvExportColumns(
    pages: InputFormPageData[] | undefined
): SubmissionReviewTableColumn[] {
    return [...CSV_TEAM_COLUMNS, ...buildAllSubmissionTableColumns(pages)];
}

// CSV column keys in export order (derived from `displayRole: "table"`)
export function getSubmissionCsvColumnKeys(
    pages: InputFormPageData[] | undefined
): string[] {
    return buildSubmissionCsvExportColumns(pages).map((col) => col.id);
}

export function buildSubmissionCsvColumnHeaders(
    pages: InputFormPageData[] | undefined,
    includeAllColumns = false
) {
    const columns = includeAllColumns
        ? buildAllSubmissionCsvExportColumns(pages)
        : buildSubmissionCsvExportColumns(pages);
    return columns.map((col) => ({
        key: col.id,
        displayLabel: col.header,
    }));
}

// resolve the location question ID for the review table
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
