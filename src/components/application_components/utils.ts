import {
    InputFormPageData,
    InputFormQuestion,
} from '@/components/application_components/types.js';

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
            case 'school-name':
                res[id] = question.selection;
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
            if (question.questionId in dataSource) {
                const id = question.questionId;
                switch (question.type) {
                    case 'name':
                        // pass, name not used yet
                        break;

                    case 'multiple-checkbox': {
                        // build new choices array with .value flags
                        const selected = Array.isArray(dataSource[id])
                            ? dataSource[id]
                            : [];
                        const selectedSet = new Set(selected);
                        let foundOther = false;
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
                    case 'school-name':
                        question.selection = dataSource[id];
                        break;
                    default:
                        question.value = dataSource[id];
                }
            }
        }
    }
}
