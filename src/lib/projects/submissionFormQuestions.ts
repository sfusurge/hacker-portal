import type {
    InputFormPageData,
    InputFormQuestion,
    QuestionCheckBoxInput,
    QuestionInline,
    DisplayRole,
    DisplayRoles,
} from '@/components/application_components/types';

export type SubmissionReviewTableQuestion = {
    questionId: number;
    title: string;
    type: string;
};

// flatten the questions into a single array
// this is used to get the questions needed for the project page and review table
export function flattenSubmissionQuestions(
    pages: InputFormPageData[] | undefined
): InputFormQuestion[] {
    if (!pages?.length) return [];
    const out: InputFormQuestion[] = [];

    for (const page of pages) {
        for (const q of page.questions ?? []) {
            if (q.type === 'inline') {
                for (const c of (q as QuestionInline).content ?? []) {
                    if (c.questionId != null) {
                        out.push(c);
                    }
                }
            } else if (q.questionId != null) {
                out.push(q);
            }
        }
    }

    return out;
}

// normalize the display roles to a list of flags
export function normalizeDisplayRoles(
    displayRole: DisplayRoles | undefined
): DisplayRole[] {
    if (displayRole == null) return ['all'];
    if (Array.isArray(displayRole)) return displayRole;
    return [displayRole];
}

export function hasDisplayRole(
    question: Pick<InputFormQuestion, 'displayRole'>,
    role: DisplayRole
): boolean {
    return normalizeDisplayRoles(question.displayRole).includes(role);
}

// whether a question should appear on the project page for this viewer
export function isVisibleForUserRole(
    question: Pick<InputFormQuestion, 'displayRole'>,
    userRole: string | undefined
): boolean {
    const roles = normalizeDisplayRoles(question.displayRole);
    if (roles.includes('hidden')) return false;
    if (roles.includes('all')) return true;
    if (roles.includes('judge')) {
        return userRole === 'judge' || userRole === 'admin';
    }
    return false;
}

// whether a submission question should appear as a column in the admin review/export table
export function isVisibleInReviewTable(
    question: Pick<InputFormQuestion, 'displayRole'>
): boolean {
    return hasDisplayRole(question, 'table');
}

// whether a question appears on the team "Preview Submission" screen
export function isVisibleInPreview(
    question: Pick<InputFormQuestion, 'displayRole' | 'type'>
): boolean {
    const roles = normalizeDisplayRoles(question.displayRole);
    if (question.type === 'file-upload' && roles.includes('banner'))
        return true;

    if (roles.includes('hidden')) return false;
    return roles.includes('all');
}

export function buildResponseFromFormQuestions(
    questions: InputFormQuestion[]
): Record<string, unknown> {
    const response: Record<string, unknown> = {};

    for (const question of questions) {
        if (question.questionId == null) continue;
        if ('value' in question && question.value !== undefined) {
            response[String(question.questionId)] = question.value;
        }
    }

    return response;
}

export function getSubmissionPreviewQuestions(
    pages: InputFormPageData[] | undefined
): InputFormQuestion[] {
    const questions = flattenSubmissionQuestions(pages);
    const response = buildResponseFromFormQuestions(questions);

    return questions.filter(
        (question) =>
            isVisibleInPreview(question) &&
            satisfiesSubmissionVisibleWhen(question, response)
    );
}

export function getSubmissionReviewTableQuestions(
    pages: InputFormPageData[] | undefined
): SubmissionReviewTableQuestion[] {
    return flattenSubmissionQuestions(pages)
        .filter(
            (q): q is InputFormQuestion & { questionId: number } =>
                q.questionId != null && isVisibleInReviewTable(q)
        )
        .map((q) => ({
            questionId: q.questionId,
            title: q.title ?? '',
            type: q.type,
        }));
}

export function satisfiesSubmissionVisibleWhen(
    question: InputFormQuestion,
    response: Record<string, unknown> | undefined
): boolean {
    const visibleWhen = question.visibleWhen;
    if (!visibleWhen || !response) return true;

    const parentValue =
        response[String(visibleWhen.questionId)] ??
        response[visibleWhen.questionId as unknown as string];

    return parentValue === visibleWhen.value;
}

function getSiblingQuestionValue(
    siblings: InputFormQuestion[],
    questionId: number
): unknown {
    const sibling = siblings.find((q) => q.questionId === questionId);
    if (!sibling || !('value' in sibling)) return undefined;
    return (sibling as { value?: unknown }).value;
}

export function isSubmissionQuestionDisabled(
    question: InputFormQuestion,
    siblings: InputFormQuestion[] = []
): boolean {
    if (question.disabled === true) return true;

    const disabledWhen = question.disabledWhen;
    if (!disabledWhen) return false;

    return (
        getSiblingQuestionValue(siblings, disabledWhen.questionId) ===
        disabledWhen.value
    );
}

export function isQuestionVisibleOnForm(
    question: InputFormQuestion,
    siblings: InputFormQuestion[] = []
): boolean {
    const visibleWhen = question.visibleWhen;
    if (!visibleWhen) return true;

    return (
        getSiblingQuestionValue(siblings, visibleWhen.questionId) ===
        visibleWhen.value
    );
}

export function isQuestionApplicableOnForm(
    question: InputFormQuestion,
    siblings: InputFormQuestion[] = []
): boolean {
    return (
        isQuestionVisibleOnForm(question, siblings) &&
        !isSubmissionQuestionDisabled(question, siblings)
    );
}

// question IDs needed outside the project page (gallery cards, page title)
export type ResolvedGallerySubmissionIds = {
    title?: number;
    track?: number;
    tagline?: number;
    headerImage?: number;
};

function findSubmissionQuestionId(
    questions: InputFormQuestion[],
    predicate: (q: InputFormQuestion) => boolean
): number | undefined {
    const match = questions.find(predicate);
    return match?.questionId ?? undefined;
}

export function resolveGallerySubmissionQuestionIds(
    pages: InputFormPageData[] | undefined
): ResolvedGallerySubmissionIds {
    const questions = flattenSubmissionQuestions(pages);
    if (!questions.length) return {};

    return {
        title: findSubmissionQuestionId(questions, (q) =>
            hasDisplayRole(q, 'title')
        ),
        track: findSubmissionQuestionId(questions, (q) =>
            hasDisplayRole(q, 'track')
        ),
        tagline: findSubmissionQuestionId(questions, (q) =>
            hasDisplayRole(q, 'tagline')
        ),
        headerImage: findSubmissionQuestionId(questions, (q) =>
            hasDisplayRole(q, 'banner')
        ),
    };
}

function isSubmissionCheckboxSelected(value: unknown): boolean {
    return value === true || value === 'true';
}

function getEligibleTrackDisplayName(question: QuestionCheckBoxInput): string {
    if (question.trackName?.trim()) {
        return question.trackName.trim();
    }

    const fromTitle = question.title?.match(/\(([^)]+)\)/)?.[1];
    if (fromTitle) {
        return fromTitle.replace(/\s+track$/i, '').trim();
    }

    return question.title?.trim() || 'Track';
}

export function getSelectedEligibleTrackNames(
    pages: InputFormPageData[] | undefined,
    response: Record<string, unknown> | undefined,
    options: { userRole?: string } = {}
): string[] {
    const names: string[] = [];

    for (const question of flattenSubmissionQuestions(pages)) {
        if (
            question.questionId == null ||
            question.type !== 'checkbox' ||
            !hasDisplayRole(question, 'eligibleTrack')
        ) {
            continue;
        }

        if (!isVisibleForUserRole(question, options.userRole)) {
            continue;
        }

        if (!satisfiesSubmissionVisibleWhen(question, response)) {
            continue;
        }

        if (
            !isSubmissionCheckboxSelected(
                response?.[String(question.questionId)]
            )
        ) {
            continue;
        }

        names.push(
            getEligibleTrackDisplayName(question as QuestionCheckBoxInput)
        );
    }

    return names;
}
