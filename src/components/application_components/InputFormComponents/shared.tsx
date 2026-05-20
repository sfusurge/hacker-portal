'use client';

import { atom } from 'jotai';
import { quillDeltaToPlainText } from '@/lib/markdown/content';
import type { InputFormQuestion } from '../types';
export const submittedAtom = atom(false);

export function collectPageQuestions(
    questions: InputFormQuestion[] | undefined
): InputFormQuestion[] {
    if (!questions?.length) return [];
    const out: InputFormQuestion[] = [];
    for (const question of questions) {
        if (question.type === 'inline') {
            out.push(...(question.content ?? []));
        } else {
            out.push(question);
        }
    }
    return out;
}

export function isQuestionVisibleInForm(
    question: InputFormQuestion,
    siblings: InputFormQuestion[] | undefined
): boolean {
    const { visibleWhen } = question;
    if (!visibleWhen || !siblings?.length) return true;

    const parent = siblings.find(
        (q) => q.questionId === visibleWhen.questionId
    );
    if (!parent) return true;

    const parentValue =
        'value' in parent ? (parent as { value?: unknown }).value : undefined;
    return parentValue === visibleWhen.value;
}

export function hasMissingRequiredVisibleQuestions(
    questions: InputFormQuestion[] | undefined
): boolean {
    return findFirstInvalidPageIndex([{ questions: questions ?? [] }]) >= 0;
}

/** First page index with a missing visible required field, or -1 if valid. */
export function findFirstInvalidPageIndex(
    pages: { questions?: InputFormQuestion[] }[] | undefined
): number {
    if (!pages?.length) return -1;

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
        const siblings = pages[pageIdx].questions ?? [];
        for (const question of collectPageQuestions(siblings)) {
            if (!question.required) continue;
            if (!isQuestionVisibleInForm(question, siblings)) continue;
            if (!isApplicationQuestionFilled(question)) {
                return pageIdx;
            }
        }
    }
    return -1;
}

export function isApplicationQuestionFilled(
    question: InputFormQuestion
): boolean {
    try {
        switch (question.type) {
            case 'text-area':
            case 'text-line':
            case 'title-line':
            case 'date':
            case 'date-ymd':
                return (
                    question.value !== undefined && question.value.length > 0
                );

            case 'number':
                return question.value !== undefined;

            case 'checkbox':
                return question.value ?? false;

            case 'multiple-checkbox':
                return (
                    (Array.isArray(question.choices) &&
                        question.choices.some(
                            (choice) => choice.value === true
                        )) ||
                    (question.allowOther === true &&
                        !!question.otherValue &&
                        question.otherValue.trim() !== '')
                );
            case 'file-upload':
                return (question.fileList ?? []).some((f) => f instanceof File);
            case 'link': {
                const linkValue =
                    typeof question.value === 'string'
                        ? question.value.trim()
                        : '';
                if (!linkValue.length) return false;
                const pattern = question.validator?.pattern;
                if (pattern) {
                    try {
                        return new RegExp(pattern).test(linkValue);
                    } catch {
                        return true;
                    }
                }
                return true;
            }
            case 'rich-text':
                return quillDeltaToPlainText(question.value).length > 0;
            case 'markdown':
                return (
                    question.value !== undefined && question.value.trim() !== ''
                );

            case 'multiple-choice':
                return question.value !== undefined;

            case 'api-dropdown':
                return (
                    question.selection !== undefined &&
                    question.selection.length > 0
                );
            case 'major':
                const majorSelection = (question as any).selection;
                return (
                    Array.isArray(majorSelection) && majorSelection.length > 0
                );
            case 'dropdown':
                if (question.allowMultiple) {
                    return (
                        Array.isArray(question.value) &&
                        question.value.length > 0
                    );
                }
                return (
                    question.value !== undefined &&
                    question.value !== null &&
                    question.value !== ''
                );
            case 'inline':
                // For inline questions, check if all required content questions are filled
                if (!question.content || question.content.length === 0) {
                    return true; // Empty inline is considered filled
                }
                // If the inline question itself is required, all content questions must be filled
                // Otherwise, check if at least one is filled
                if (question.required) {
                    return question.content.every((contentQuestion) =>
                        isApplicationQuestionFilled(contentQuestion)
                    );
                } else {
                    return question.content.some((contentQuestion) =>
                        isApplicationQuestionFilled(contentQuestion)
                    );
                }
            default:
                return false;
        }
    } catch (error) {
        console.error(
            `Error checking if question ${question.questionId ?? 'inline'} is filled:`,
            error
        );
        return false;
    }
}
