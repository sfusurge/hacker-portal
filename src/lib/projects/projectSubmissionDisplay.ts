import {
    formatSubmissionFieldValue,
    getResponseValue,
} from '@/lib/admin/submissionExport';
import { formFieldContentToPlainText } from '@/lib/markdown/content';

export const PROJECT_SUBMISSION_QUESTION_IDS = {
    TITLE: 5,
    LOCATION: 10,
    TRACK: 15,
    TAGLINE: 30,
    DESCRIPTION: 35,
    PROTOTYPE: 40,
    SLIDE_DECK: 45,
    VIDEO: 50,
    HEADER_IMAGE: 55,
    VISUALS_AI: 60,
    EXTERNAL_RESOURCES: 65,
    AI_TOOLS_CITED: 70,
} as const;

export function getProjectSubmissionField(
    response: Record<string, unknown>,
    questionId: number
): unknown {
    return getResponseValue(response, String(questionId));
}

export function getProjectSubmissionText(
    response: Record<string, unknown>,
    questionId: number
): string {
    return formatSubmissionFieldValue(
        getProjectSubmissionField(response, questionId)
    );
}

export function getProjectHeaderImageUrl(
    response: Record<string, unknown>
): string {
    const raw = getProjectSubmissionField(
        response,
        PROJECT_SUBMISSION_QUESTION_IDS.HEADER_IMAGE
    );
    if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0]) {
        return raw[0];
    }
    if (typeof raw === 'string' && raw) {
        return raw;
    }
    return '/hacker-portal-preview.webp';
}

export function getProjectTaglinePlainText(
    response: Record<string, unknown>
): string {
    const tagline = getProjectSubmissionField(
        response,
        PROJECT_SUBMISSION_QUESTION_IDS.TAGLINE
    );
    const plain = formFieldContentToPlainText(tagline);
    if (plain) return plain;
    return getProjectSubmissionText(
        response,
        PROJECT_SUBMISSION_QUESTION_IDS.TAGLINE
    );
}

export type ProjectListItem = {
    id: number;
    teamName: string;
    displayId: string;
    [PROJECT_SUBMISSION_QUESTION_IDS.TITLE]: string;
    [PROJECT_SUBMISSION_QUESTION_IDS.TRACK]: string;
    [PROJECT_SUBMISSION_QUESTION_IDS.HEADER_IMAGE]: string;
    [PROJECT_SUBMISSION_QUESTION_IDS.TAGLINE]: string;
    fullSubmissionResponse?: Record<string, unknown>;
    status?: string;
};

export function mapSubmissionToProjectListItem(
    submission: {
        teamId: number;
        teamName: string | null;
        response: Record<string, unknown>;
    },
    options?: {
        displayId?: string;
        status?: string;
        includeFullResponse?: boolean;
    }
): ProjectListItem {
    const { response, teamId } = submission;
    const Q = PROJECT_SUBMISSION_QUESTION_IDS;
    const title =
        getProjectSubmissionText(response, Q.TITLE) ||
        submission.teamName ||
        `Team #${teamId}`;

    const item: ProjectListItem = {
        id: teamId,
        teamName: submission.teamName || `Team #${teamId}`,
        displayId: options?.displayId ?? String(teamId),
        [Q.TITLE]: title,
        [Q.TRACK]:
            getProjectSubmissionText(response, Q.TRACK) || 'No track selected',
        [Q.HEADER_IMAGE]: getProjectHeaderImageUrl(response),
        [Q.TAGLINE]:
            getProjectTaglinePlainText(response) || 'No description available',
    };

    if (options?.status) {
        item.status = options.status;
    }
    if (options?.includeFullResponse) {
        item.fullSubmissionResponse = response;
    }

    return item;
}

export function createSkeletonProjectListItem(): ProjectListItem {
    const Q = PROJECT_SUBMISSION_QUESTION_IDS;
    return {
        id: 0,
        teamName: '',
        displayId: '',
        [Q.TITLE]: '',
        [Q.TRACK]: '',
        [Q.HEADER_IMAGE]: '/hacker-portal-preview.webp',
        [Q.TAGLINE]: '',
    };
}
