'use client';

import type { ApplicationQuestion } from '../types';

export function isApplicationQuestionFilled(question: ApplicationQuestion) {
    // Add debug logging to help identify issues

    if (!question.required) {
        return true; // no need to check if the question is not required
    }

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
                let checkedCounts = 0;
                for (const choice of question.choices) {
                    if (choice.value) {
                        checkedCounts += 1;
                    }
                }

                if (question.allowOther && question.otherValue) {
                    checkedCounts += 1;
                }

                const result =
                    checkedCounts >= (question.min ?? 0) &&
                    checkedCounts <= (question.max ?? 99);

                console.log(`Multiple checkbox result for ${question.title}:`, {
                    checkedCounts,
                    min: question.min ?? 0,
                    max: question.max ?? 99,
                    result,
                });

                return result;

            case 'multiple-choice':
                return question.value !== undefined;

            case 'name':
                // Handle name type if it exists in your application
                return (
                    (question.firstName && question.firstName.length > 0) ||
                    (question.lastName && question.lastName.length > 0)
                );

            case 'school-name':
                // Handle school-name type if it exists
                return (
                    question.value !== undefined && question.value.length > 0
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
