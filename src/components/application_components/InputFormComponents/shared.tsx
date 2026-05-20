'use client';

import { atom } from 'jotai';
import { quillDeltaToPlainText } from '@/lib/markdown/content';
import type { InputFormQuestion } from '../types';
export const submittedAtom = atom(false);
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
                return (question.fileList?.length ?? 0) > 0;
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
