'use client';

import { ApplicationQuestion } from '../types';

export function isApplicationQuestionFilled(question: ApplicationQuestion) {
    if (!question.required) {
        return true; // no need to check if the question is not required
    }
    switch (question.type) {
        case 'text-area':
        case 'text-line':
        case 'date':
            return question.value !== undefined && question.value.length > 0;

        case 'number':
            return question.value !== undefined;

        case 'checkbox':
            return question.value ?? false;

        case 'multiple-checkbox':
            return question.choices.length > 0;

        case 'multiple-choice':
            return question.value !== undefined;

        default:
            throw 'Unexpected question while checking if empty';
    }
}
