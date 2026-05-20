import type {
    InputFormPageData,
    InputFormQuestion,
} from '@/components/application_components/types';
import {
    flattenSubmissionQuestions,
    getSelectedEligibleTrackNames,
    hasDisplayRole,
    isVisibleForUserRole,
    satisfiesSubmissionVisibleWhen,
} from '@/lib/projects/submissionFormQuestions';

export type ProjectPageSection = {
    type:
        | 'title'
        | 'badge'
        | 'text'
        | 'markdown'
        | 'embed'
        | 'video'
        | 'eligible-tracks';
    title: string;
    field: number;
    eligibleTrackNames?: string[];
};

const TEAM_SECTION: ProjectPageSection = {
    type: 'text',
    title: 'Team',
    field: 0,
};

const TRACK_TITLE_PATTERN = /project track|which project track/i;

function mapSubmissionQuestionToSection(
    question: InputFormQuestion
): ProjectPageSection | null {
    if (question.questionId == null) return null;

    const questionId = question.questionId;
    const title = question.title ?? '';

    if (
        question.type === 'checkbox' &&
        hasDisplayRole(question, 'eligibleTrack')
    ) {
        return null;
    }

    switch (question.type) {
        case 'title-line':
            return {
                type: 'title',
                title,
                field: questionId,
            };
        case 'text-line':
            return {
                type: 'text',
                title,
                field: questionId,
            };
        case 'markdown':
            return {
                type: 'markdown',
                title,
                field: questionId,
            };
        case 'multiple-choice': {
            const isBadge =
                /participating from|where is your team/i.test(title) ||
                TRACK_TITLE_PATTERN.test(title);
            return {
                type: isBadge ? 'badge' : 'text',
                title,
                field: questionId,
            };
        }
        case 'link': {
            const isVideo = /video|youtube/i.test(title);
            return {
                type: isVideo ? 'video' : 'embed',
                title,
                field: questionId,
            };
        }
        default:
            return null;
    }
}

export function buildProjectPageSections(
    pages: InputFormPageData[] | undefined,
    options: {
        userRole?: string;
        response?: Record<string, unknown>;
    } = {}
): ProjectPageSection[] {
    const questions = flattenSubmissionQuestions(pages);
    if (!questions.length) {
        return [TEAM_SECTION];
    }

    const eligibleTrackNames = getSelectedEligibleTrackNames(
        pages,
        options.response,
        { userRole: options.userRole }
    );

    const sections: ProjectPageSection[] = [];
    let teamInserted = false;

    for (const question of questions) {
        if (question.questionId == null) continue;

        if (!isVisibleForUserRole(question, options.userRole)) {
            continue;
        }

        if (!satisfiesSubmissionVisibleWhen(question, options.response)) {
            continue;
        }

        const section = mapSubmissionQuestionToSection(question);
        if (!section) continue;

        sections.push(section);

        if (
            !teamInserted &&
            question.type === 'multiple-choice' &&
            TRACK_TITLE_PATTERN.test(question.title ?? '')
        ) {
            if (eligibleTrackNames.length > 0) {
                sections.push({
                    type: 'eligible-tracks',
                    title: 'Tracks',
                    field: -1,
                    eligibleTrackNames,
                });
            }
            sections.push(TEAM_SECTION);
            teamInserted = true;
        }
    }

    if (!teamInserted) {
        const trackIndex = sections.findIndex(
            (s) => s.type === 'badge' && TRACK_TITLE_PATTERN.test(s.title)
        );
        const insertAt = trackIndex >= 0 ? trackIndex + 1 : 1;
        if (eligibleTrackNames.length > 0) {
            sections.splice(insertAt, 0, {
                type: 'eligible-tracks',
                title: 'Tracks',
                field: -1,
                eligibleTrackNames,
            });
        }
        sections.splice(
            eligibleTrackNames.length > 0 ? insertAt + 1 : insertAt,
            0,
            TEAM_SECTION
        );
    }

    return sections;
}
