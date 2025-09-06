'use client';

import { atom } from 'jotai';
import type { InputFormQuestion } from '../types';
export const submittedAtom = atom(false);
export function isApplicationQuestionFilled(question: InputFormQuestion) {
    try {
        switch (question.type) {
            case 'text-area':
            case 'text-line':
            case 'date':
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
                return question.fileList && question.fileList.length > 0;
            case 'rich-text':
                return question.value;

            case 'multiple-choice':
                return question.value !== undefined;

            case 'school-name':
                return (
                    question.selection !== undefined &&
                    question.selection.length > 0
                );
        }
    } catch (error) {
        console.error(
            `Error checking if question ${question.questionId} is filled:`,
            error
        );
        return false;
    }
}
