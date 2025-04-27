import { ApplicationPage } from '@/app/(auth)/application/application_components/types.js';

export function flattenQuestions(pages: ApplicationPage[]) {
    return pages.flatMap((page) => {
        return page.questions;
    });
}

export function getResponseMap(pages: ApplicationPage[]) {
    const flattened = flattenQuestions(pages);

    const res: Record<string, any> = {};

    for (const question of flattened) {
        const id = question.questionId;

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

            default:
                res[id] = question.value;
        }
    }

    return res;
}
