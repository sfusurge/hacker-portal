import type {
    InputFormPageData,
    InputFormQuestion,
} from '@/components/application_components/types';
import { resolveApplicationQuestionIdByRole } from '@/lib/applications/applicationReviewExport';
import {
    flattenSubmissionQuestions,
    getSubmissionReviewTableQuestions,
    hasDisplayRole,
    isVisibleInReviewTable,
} from '@/lib/projects/submissionFormQuestions';

export type ApplicationReviewTableColumn = {
    id: string;
    header: string;
    questionId: string;
    type: string;
};

function applicationQuestionHeader(
    question: InputFormQuestion & { questionId: number }
): string {
    const title =
        'title' in question && question.title?.trim()
            ? question.title.trim()
            : '';
    if (title) return title;

    const label =
        'label' in question && typeof question.label === 'string'
            ? question.label.replace(/<[^>]*>/g, '').trim()
            : '';
    if (label) {
        return label.length > 120 ? `${label.slice(0, 120)}…` : label;
    }

    return `Question ${question.questionId}`;
}

// buildApplicationReviewTableColumns builds the columns for the application review table.
export function buildApplicationReviewTableColumns(
    pages: InputFormPageData[] | undefined
): ApplicationReviewTableColumn[] {
    return getSubmissionReviewTableQuestions(pages).map((q) => ({
        id: String(q.questionId),
        header: q.title,
        questionId: String(q.questionId),
        type: q.type,
    }));
}

// buildAllApplicationTableColumns builds the columns for the application review table.
export function buildAllApplicationTableColumns(
    pages: InputFormPageData[] | undefined
): ApplicationReviewTableColumn[] {
    return flattenSubmissionQuestions(pages)
        .filter(
            (q): q is InputFormQuestion & { questionId: number } =>
                q.questionId != null
        )
        .map((q) => ({
            id: String(q.questionId),
            header: applicationQuestionHeader(q),
            questionId: String(q.questionId),
            type: q.type,
        }));
}

// resolveApplicationLocationQuestionId resolves the question ID for the event location question.
export function resolveApplicationLocationQuestionId(
    pages: InputFormPageData[] | undefined
): string | undefined {
    return resolveApplicationQuestionIdByRole(pages, 'location');
}

// resolveApplicationReviewTableLocationQuestionId resolves the question ID for the location column in the review table.
export function resolveApplicationReviewTableLocationQuestionId(
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
