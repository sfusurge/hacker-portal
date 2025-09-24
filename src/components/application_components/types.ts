import dayjs from 'dayjs';
import { HTMLInputAutoCompleteAttribute } from 'react';

interface Entry {
    title?: string;
    description?: string;
}

type ChoiceOption = {
    name: string;
    data: string;
    other?: boolean;
};

/**
 * used both as a template, and also to hold current data.
 * This exist on both client side and server.
 * It's the client's responsibility to send an ApplicationData that makes sense, complete and up to date.
 * The server api can reject the request for any reason, so client modifying the question set is not a concern.
 */
export interface HackathonData {
    id: number;
    version: number;
    hackathonName: string; // should this be hackathon id in table instead?
    submissionTime?: string;

    applicationQuestionPages: InputFormPageData[];
    submissionQuestionPages: InputFormPageData[];

    submissionDeadline: dayjs.Dayjs;
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;

    judgeQuestions: JudgingFormQuestion[];
    judgeRubric: SubmissionJudgeRubric[];
}

export interface InputFormData {
    id: number;
    version: number;

    pages: InputFormPageData[];
}

export interface TransformedInputFormData extends InputFormData {}

export interface InputFormPageData extends Entry {
    alert?: AlertData;
    questions: InputFormQuestion[];
}

export type InputFormQuestion =
    | QuestionCheckBoxInput
    | QuestionDatePicker
    | QuestionTextAreaInput
    | QuestionTextLineInput
    | QuestionNumberInput
    | QuestionMultipleChoice
    | QuestionSchoolName
    | QuestionMultipleCheckBox
    | QuestionNameInput
    | QuestionFileUploads
    | QuestionRichTextInput
    | QuestionTextLinkInput;

export type ApplicationQuestionType = InputFormQuestion['type'];

export interface AlertData {
    title: string;
    description: string;
}

interface Question extends Entry {
    questionId: number; // must be unique to the application.
    type: string | 'N/A';
    required?: boolean;
    autoComplete?: HTMLInputAutoCompleteAttribute;
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

export interface QuestionTextLinkInput extends Question {
    type: 'link';
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
    choices: ChoiceOption[];
}

export interface QuestionRichTextInput extends Question {
    type: 'rich-text';
    value?: Record<any, any>;
    maxLength?: number;
}

export interface QuestionMultipleCheckBox extends Question {
    type: 'multiple-checkbox';
    min?: number;
    max?: number;
    choices: {
        data: string;
        name: string;
        exclusive?: boolean;
        value?: boolean;
    }[];
    allowOther?: boolean;
    otherValue?: string;
}

export type MimeTypes =
    | 'image/jpeg'
    | 'image/png'
    | 'image/gif'
    | 'image/webp'
    | 'text/plain'
    | 'application/pdf';

export interface QuestionFileUploads extends Question {
    type: 'file-upload';
    allowedTypes: MimeTypes[];
    allowMultiple: boolean;
    singleFileName?: string;
    maxSize: number; // in mbs
    fileList?: File[] | any[];
    fileLinks?: string[];
    fileUploadPath?: string; //path save the data, should !not! start with a slash
}

/**
 * Auto completes based on user input, from a near infinite list of uni names.
 */
export interface QuestionSchoolName extends Question {
    // TODO
    type: 'school-name';
    title: string;
    required: boolean;
    questionId: number;
    apiUrl: string;
    selection: string;
}

export interface QuestionDatePicker extends Question {
    type: 'date';
    value?: string;
}

export interface JudgeQuestion extends Question {
    type: 'judge-question';
    value?: number;
    min?: number;
    max?: number;
}

export interface SubmissionJudgeRubric {
    questionId: number;
    title: string;
    description: string[];
    rubric: {
        [score: string]: string[];
    };
}

// Judging form types
export type ScoreItem = {
    questionId: number;
    title: string;
    description?: string;
};

export interface ScoreGroupQuestion {
    type: 'score-group';
    questionId: number;
    title: string;
    required: boolean;
    description?: string;
    items: ScoreItem[];
}

export interface MultipleChoiceQuestion {
    type: 'multiple-choice';
    questionId: number;
    title: string;
    required: boolean;
    description?: string;
    choices: {
        id: string;
        name: string;
        data: string;
    }[];
}

export interface TextAreaQuestion {
    type: 'text-area';
    questionId: number;
    title: string;
    required: boolean;
    description?: string;
    placeholder?: string;
}

export type JudgingFormQuestion =
    | ScoreGroupQuestion
    | MultipleChoiceQuestion
    | TextAreaQuestion;

export interface FormResponse {
    [key: string]: string | null;
}
