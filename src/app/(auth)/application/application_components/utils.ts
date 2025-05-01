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

export function loadResponseIntoSchema(
    pages: ApplicationPage[],
    dataSource: Record<string, any>
) {
    // load question
    for (const page of pages) {
        for (const question of page.questions) {
            if (question.questionId in dataSource) {
                const id = question.questionId;
                switch (question.type) {
                    case 'name':
                        // pass, name not used yet
                        break;

                    case 'multiple-checkbox':
                        const choices = new Map<string, number>();
                        for (let i = 0; i < question.choices.length; i++) {
                            choices.set(question.choices[i].data, i);
                        }
                        for (const item of dataSource[id]) {
                            if (choices.has(item)) {
                                question.choices[choices.get(item)!].value =
                                    true;
                            } else if (question.allowOther) {
                                question.otherValue = item;
                            }
                        }
                        break;

                    default:
                        question.value = dataSource[id];
                }
            }
        }
    }
}
