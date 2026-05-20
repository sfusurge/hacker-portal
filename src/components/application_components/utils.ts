import {
    InputFormPageData,
    InputFormQuestion,
} from '@/components/application_components/types.js';
/** autofill targets only these `questionId`s (first / last / email / phone). */
export const APPLICATION_PROFILE_QUESTION_IDS = {
    FIRST_NAME: 5,
    LAST_NAME: 6,
    EMAIL: 8,
    PHONE: 9,
} as const;

/**
 * merge `loadResponseIntoSchema` profile data
 */
export function getApplicationAutofillFromUser(user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
}): Record<number, string> {
    const out: Record<number, string> = {};
    const { FIRST_NAME, LAST_NAME, EMAIL, PHONE } =
        APPLICATION_PROFILE_QUESTION_IDS;

    if (user.firstName) out[FIRST_NAME] = user.firstName;
    if (user.lastName) out[LAST_NAME] = user.lastName;
    if (user.email) out[EMAIL] = user.email;

    if (user.phoneNumber) out[PHONE] = user.phoneNumber;

    return out;
}

/** find questionId in schema / JSON */
export function findQuestionId(questionId: number): number | undefined {
    return questionId;
}

/** payloads use `questionId` as keys (number or string after JSON). */
export function hasResponseForQuestionId(
    data: Record<string, any>,
    questionId: number
): boolean {
    return (
        Object.prototype.hasOwnProperty.call(data, questionId) ||
        Object.prototype.hasOwnProperty.call(data, String(questionId))
    );
}

function getResponseValueByQuestionId(
    data: Record<string, any>,
    questionId: number
): unknown {
    if (Object.prototype.hasOwnProperty.call(data, questionId)) {
        return data[questionId];
    }
    if (Object.prototype.hasOwnProperty.call(data, String(questionId))) {
        return data[String(questionId)];
    }
    return undefined;
}

/** empty values allow profile autofill on next load. */
function isMeaningfulLocalValueForProfileField(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
}

/**
 * merge profile autofill for known profile `questionId`s into the local draft.
 * local draft wins when non-empty value for that id; otherwise profile autofill.
 */
export function mergeProfileDefaultsWithLocalResponse(
    profile: Record<number, string>,
    local: Record<string, any>
): Record<string, any> {
    const merged: Record<string, any> = { ...local };
    for (const qid of Object.values(APPLICATION_PROFILE_QUESTION_IDS)) {
        if (
            isMeaningfulLocalValueForProfileField(
                getResponseValueByQuestionId(merged, qid)
            )
        ) {
            continue;
        }
        const v = profile[qid];
        if (v !== undefined && v !== '') {
            merged[qid] = v;
        }
    }
    return merged;
}

/** normalize `questionId` from schema/JSON (number or numeric string). */
export function toQuestionId(value: unknown): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value);
        if (Number.isFinite(n)) return n;
    }
    return undefined;
}

export function flattenQuestions(pages: InputFormPageData[]) {
    return pages.flatMap((page) => {
        return page.questions;
    });
}

export async function processResponseForServer(
    pages: InputFormPageData[],
    uploadCallback: (filename: string, file: File) => Promise<string>, // returns uploaded url
    // use fileNameCallback to include info such as userId,
    // hackathonId, etc.
    fileNameCallback?: (
        question: InputFormQuestion
    ) => string | null | undefined
) {
    for (const page of pages) {
        for (const question of page.questions) {
            if (question.type === 'file-upload') {
                question.fileLinks = []; // flush previous links if any
                for (const f of question.fileList ?? []) {
                    let filename = f.name;
                    if (question.allowMultiple && question.fileUploadPath) {
                        filename = `${question.fileUploadPath}${filename}`;
                    }
                    if (!question.allowMultiple && question.singleFileName) {
                        filename = `${question.singleFileName}${filename.slice(filename.lastIndexOf('.'))}`;
                    }

                    if (fileNameCallback) {
                        filename = fileNameCallback(question) ?? filename;
                    }

                    const uploadedUrl = await uploadCallback(filename, f);

                    if (uploadedUrl) {
                        question.fileLinks.push(uploadedUrl);
                    }
                }
            }
        }
    }
    return pages;
}

export function getResponseMap(pages: InputFormPageData[]) {
    const flattened = flattenQuestions(pages);

    const res: Record<number, any> = {};

    for (const question of flattened) {
        if (question.type === 'inline') {
            for (const contentQuestion of question.content) {
                const contentId = toQuestionId(contentQuestion.questionId);
                if (contentId === undefined) continue;
                switch (contentQuestion.type) {
                    case 'multiple-checkbox':
                        res[contentId] = contentQuestion.choices
                            .filter((item) => item.value)
                            .map((item) => item.data);
                        if (contentQuestion.otherValue) {
                            res[contentId].push(contentQuestion.otherValue);
                        }
                        break;
                    case 'name':
                        res[contentId] =
                            `${contentQuestion.firstName} ${contentQuestion.lastName}`;
                        break;
                    case 'file-upload':
                        res[contentId] = contentQuestion.fileLinks ?? [];
                        break;
                    case 'major':
                        res[contentId] = contentQuestion.selection;
                        break;
                    case 'api-dropdown':
                        res[contentId] = contentQuestion.selection;
                        break;
                    default:
                        res[contentId] = (
                            contentQuestion as { value?: unknown }
                        ).value;
                }
            }
            continue;
        }

        const id = toQuestionId(question.questionId);
        if (id === undefined) continue;

        switch (question.type) {
            case 'multiple-checkbox':
                res[id] = question.choices
                    .filter((item) => item.value)
                    .map((item) => item.data);
                if (question.otherValue) {
                    res[id].push(question.otherValue);
                }
                break;

            case 'name':
                res[id] = `${question.firstName} ${question.lastName}`;
                break;
            case 'file-upload':
                res[id] = question.fileLinks ?? [];
                break;
            case 'api-dropdown':
                res[id] = question.selection;
                break;
            case 'major':
                res[id] = question.selection;
                break;
            case 'dropdown':
                res[id] = question.value;
                break;
            default:
                res[id] = question.value;
        }
    }
    return res;
}

export function loadResponseIntoSchema(
    pages: InputFormPageData[],
    dataSource: Record<string, any>
) {
    // load question
    for (const page of pages) {
        for (const question of page.questions) {
            // For inline questions, process content even if inline itself has no questionId
            if (question.type === 'inline') {
                for (const contentQuestion of question.content) {
                    const contentId = toQuestionId(contentQuestion.questionId);
                    if (
                        contentId === undefined ||
                        !hasResponseForQuestionId(dataSource, contentId)
                    ) {
                        continue;
                    }
                    switch (contentQuestion.type) {
                        case 'name':
                            break;
                        case 'multiple-checkbox': {
                            const selected = Array.isArray(
                                dataSource[contentId]
                            )
                                ? dataSource[contentId]
                                : [];
                            const selectedSet = new Set(selected);
                            contentQuestion.choices =
                                contentQuestion.choices.map((choice) => {
                                    const checked = selectedSet.has(
                                        choice.data
                                    );
                                    if (checked)
                                        selectedSet.delete(choice.data);
                                    return {
                                        ...choice,
                                        value: checked,
                                    };
                                });
                            if (
                                contentQuestion.allowOther &&
                                selectedSet.size > 0
                            ) {
                                contentQuestion.otherValue =
                                    Array.from(selectedSet)[0];
                            } else if (contentQuestion.allowOther) {
                                contentQuestion.otherValue = '';
                            }
                            break;
                        }
                        case 'file-upload':
                            contentQuestion.fileLinks = dataSource[
                                contentId
                            ] as string[];
                            break;

                        case 'major':
                            contentQuestion.selection =
                                dataSource[contentId] || [];
                            break;
                        case 'api-dropdown':
                            contentQuestion.selection =
                                typeof dataSource[contentId] === 'string'
                                    ? dataSource[contentId]
                                    : '';
                            break;

                        case 'rich-text':
                            contentQuestion.value = dataSource[contentId];
                            break;
                        case 'markdown':
                            contentQuestion.value =
                                typeof dataSource[contentId] === 'string'
                                    ? dataSource[contentId]
                                    : '';
                            break;
                        default:
                            (contentQuestion as { value?: unknown }).value =
                                dataSource[contentId];
                    }
                }
                continue;
            }

            const id = toQuestionId(question.questionId);
            if (id === undefined || !hasResponseForQuestionId(dataSource, id)) {
                continue;
            }
            switch (question.type) {
                case 'name':
                    break;

                case 'multiple-checkbox': {
                    const selected = Array.isArray(dataSource[id])
                        ? dataSource[id]
                        : [];
                    const selectedSet = new Set(selected);
                    question.choices = question.choices.map((choice) => {
                        const checked = selectedSet.has(choice.data);
                        if (checked) selectedSet.delete(choice.data);
                        return { ...choice, value: checked };
                    });
                    // remaining items in selectedSet are "other" values
                    if (question.allowOther && selectedSet.size > 0) {
                        question.otherValue = Array.from(selectedSet)[0];
                    } else if (question.allowOther) {
                        question.otherValue = '';
                    }
                    break;
                }
                case 'file-upload':
                    question.fileLinks = dataSource[id];
                    break;
                case 'rich-text':
                    question.value = dataSource[id];
                    break;
                case 'markdown':
                    question.value =
                        typeof dataSource[id] === 'string'
                            ? dataSource[id]
                            : '';
                    break;
                case 'api-dropdown':
                    question.selection = dataSource[id];
                    break;
                case 'major':
                    (question as { selection?: string[] }).selection =
                        (dataSource[id] as string[]) || [];
                    break;
                case 'dropdown':
                    question.value = dataSource[id];
                    break;
                default:
                    question.value = dataSource[id];
            }
        }
    }
}
