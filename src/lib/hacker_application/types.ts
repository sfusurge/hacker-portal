interface Entry {
    title?: string;
    description?: string;
}

/**
 * used both as a template, and also to hold current data.
 * This exist on both client side and server.
 * It's the client's responsibility to send an ApplicationData that makes sense, complete and up to date.
 * The server api can reject the request for any reason, so client modifying the question set is not a concern.
 */
export interface ApplicationData {
    title?: string;
    version: number; // version must match, discard the application otherwise. Increment version with every change please.

    hackathonName: string; // should this be hackathon id in table instead?
    submissionTime?: string;

    pages: ApplicationPage[];
}

/**
 * Same info as application, except pages are destructured.
 */
export interface FlatApplication extends Entry {
    version: number; // version must match, discard the application otherwise. Increment version with every change please.

    hackathonName: string; // should this be hackathon id in table instead?
    submissionTime: string;

    questions: ApplicationQuestion[];
}

export interface ApplicationPage extends Entry {
    questions: ApplicationQuestion[];
}

export type ApplicationQuestion =
    | QuestionCheckBoxInput
    | QuestionDatePicker
    | QuestionTextAreaInput
    | QuestionTextLineInput
    | QuestionNumberInput
    | QuestionMultipleChoice
    | QuestionSchoolName
    | QuestionMultipleCheckBox
    | QuestionNameInput;

interface Question extends Entry {
    questionId: number; // must be unique to the application.
    type: string | 'N/A';
    required?: boolean;
    autoComplete?: string;
}

export interface QuestionTextLineInput extends Question {
    type: 'text-line';
    placeHolder?: string;
    value?: string;
    maxCount?: number;

    validator?: {
        pattern: string; //regex pattern
        errorMsg: string; // message to display if the pattern fails
    };
}

export interface QuestionNameInput extends Question {
    type: 'name';
    firstName?: string;
    lastName?: string;
    maxCount?: number;
}

export interface QuestionTextAreaInput extends Question {
    type: 'text-area';
    placeHolder?: string;
    value?: string;
    maxCount?: number;
}

export interface QuestionNumberInput extends Question {
    type: 'number';
    placeHolder?: number;
    value?: number;
    min?: number;
    max?: number;
    errMsg?: string;
}

export interface QuestionCheckBoxInput extends Question {
    type: 'checkbox';
    value?: boolean;
    label?: string;
    required?: boolean;
}

/**
 * For short and finite number of choices. For example T-shirt sizes, not university name.
 * In Choices, "data" is the internal data, "name" is whats actually displayed.
 */
export interface QuestionMultipleChoice extends Question {
    type: 'multiple-choice';
    value?: string;
    allowCustom?: boolean;
    allowDeselect?: boolean;
    choices: { data: string; name: string }[];
}

export interface QuestionMultipleCheckBox extends Question {
    type: 'multiple-checkbox';
    choices: {
        data: string;
        name: string;
        value: boolean;
    }[];
}

/**
 * Auto completes based on user input, from a near infinite list of uni names.
 */
export interface QuestionSchoolName extends Question {
    // TODO
    type: 'school-name';
    value?: string;
}

export interface QuestionDatePicker extends Question {
    type: 'date';
    value?: string;
}
