'use client';

import type { InputFormQuestion } from '../types';

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

            case 'multiple-choice':
                return question.value !== undefined;
        }
    } catch (error) {
        console.error(
            `Error checking if question ${question.questionId} is filled:`,
            error
        );
        return false;
    }
}
