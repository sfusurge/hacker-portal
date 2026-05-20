import type { InputFormPageData } from '@/components/application_components/types';
import {
    flattenSubmissionQuestions,
    getAllSubmissionTableQuestions,
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

function mapQuestionsToTableColumns(
    questions: ReturnType<typeof getSubmissionReviewTableQuestions>
): SubmissionReviewTableColumn[] {
    return questions.map((q) => ({
        id: String(q.questionId),
        header: q.title,
        questionId: String(q.questionId),
    }));
}

export function buildSubmissionReviewTableColumns(
    pages: InputFormPageData[] | undefined
): SubmissionReviewTableColumn[] {
    return mapQuestionsToTableColumns(getSubmissionReviewTableQuestions(pages));
}

export function buildAllSubmissionTableColumns(
    pages: InputFormPageData[] | undefined
): SubmissionReviewTableColumn[] {
    return mapQuestionsToTableColumns(getAllSubmissionTableQuestions(pages));
}

export type SubmissionCsvExportOptions = {
    includeAllQuestions?: boolean;
};

// CSV export columns: team metadata + table columns (or all questions).
export function buildSubmissionCsvExportColumns(
    pages: InputFormPageData[] | undefined,
    options: SubmissionCsvExportOptions = {}
): SubmissionReviewTableColumn[] {
    const questionColumns = options.includeAllQuestions
        ? buildAllSubmissionTableColumns(pages)
        : buildSubmissionReviewTableColumns(pages);

    return [...CSV_TEAM_COLUMNS, ...questionColumns];
}

// CSV column keys in export order.
export function getSubmissionCsvColumnKeys(
    pages: InputFormPageData[] | undefined,
    options: SubmissionCsvExportOptions = {}
): string[] {
    return buildSubmissionCsvExportColumns(pages, options).map((col) => col.id);
}

export function buildSubmissionCsvColumnHeaders(
    pages: InputFormPageData[] | undefined,
    options: SubmissionCsvExportOptions = {}
) {
    return buildSubmissionCsvExportColumns(pages, options).map((col) => ({
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
