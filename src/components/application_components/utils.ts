import { InputFormPageData } from '@/components/application_components/types.js';

export function flattenQuestions(pages: InputFormPageData[]) {
    return pages.flatMap((page) => {
        return page.questions;
    });
}

export async function processResponseForServer(
    pages: InputFormPageData[],
    uploadCallback: (filename: string, file: File) => Promise<string> // returns uploaded url
) {
    for (const page of pages) {
        for (const question of page.questions) {
            if (question.type === 'file-upload') {
                for (const f of question.fileList ?? []) {
                    let filename = f.name;
                    if (question.allowMultiple && question.fileUploadPath) {
                        filename = `${question.fileUploadPath}${filename}`;
                    }

                    if (!question.allowMultiple && question.singleFileName) {
                        filename = `${question.singleFileName}${filename.slice(filename.lastIndexOf('.'))}`;
                    }
                    const uploadedUrl = uploadCallback(filename, f);

                    if (uploadedUrl) {
                        if (!question.fileLinks) {
                            question.fileLinks = [];
                        }
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
            case 'file-upload':
                res[id] = question.fileLinks ?? [];
                break;
            default:
                res[id] = question.value;
        }
    }

    console.log('??', res);

    return res;
}

export function loadResponseIntoSchema(
    pages: InputFormPageData[],
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
                    case 'file-upload':
                        question.fileLinks = dataSource[id];
                        break;
                    case 'rich-text':
                        question.value = dataSource[id];
                        console.log(
                            'in rich text',
                            dataSource,
                            id,
                            dataSource[id]
                        );

                        break;
                    default:
                        question.value = dataSource[id];
                }
            }
        }
    }

    console.log('done', pages);
}
