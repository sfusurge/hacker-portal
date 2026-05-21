import dayjs from 'dayjs';
import { HTMLInputAutoCompleteAttribute } from 'react';

interface Entry {
    title?: string;
    description?: string;
}

/** Optional per-choice UI for multiple-choice*/
export type ChoiceOptionAlert = {
    title?: string;
    description: string;
    placement?: 'above-title' | 'below-fieldset';
    variant?: 'info' | 'default';
    /**
     * `alert` (default): bordered alert box (supports `title`).
     * `caption`: muted text under the selected radio only.
     */
    presentation?: 'alert' | 'caption';
};

type ChoiceOption = {
    name: string;
    data: string;
    other?: boolean;
    disabled?: boolean;
    alert?: ChoiceOptionAlert;
};

/**
 * used both as a template, and also to hold current data.
 * This exist on both client side and server.
 * It's the client's responsibility to send an ApplicationData that makes sense, complete and up to date.
 * The server api can reject the request for any reason, so client modifying the question set is not a concern.
 */
export interface HackathonData {
    name: string;
    eventPagePayload: any;
    id: number;
    version: number;
    hackathonName: string; // should this be hackathon id in table instead?
    submissionTime?: string;
    isPaid?: boolean;
    paymentDeadline: dayjs.Dayjs | null;

    applicationQuestionPages: InputFormPageData[];
    submissionQuestionPages: InputFormPageData[];

    submissionDeadline: dayjs.Dayjs;
    submissionOpen: dayjs.Dayjs | null;
    applicationOpen: dayjs.Dayjs | null;
    applicationCloses: dayjs.Dayjs | null;
    audienceVotingEnabled: boolean;
    audienceVotingOpen: dayjs.Dayjs | null;
    audienceVotingCloses: dayjs.Dayjs | null;
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
    | QuestionDateYmd
    | QuestionTextAreaInput
    | QuestionTextLineInput
    | QuestionTitleLineInput
    | QuestionNumberInput
    | QuestionMultipleChoice
    | QuestionApiDropdown
    | QuestionMultipleCheckBox
    | QuestionNameInput
    | QuestionFileUploads
    | QuestionRichTextInput
    | QuestionMarkdownInput
    | QuestionTextLinkInput
    | QuestionDropdown
    | QuestionMajorInput
    | QuestionInline;

export type ApplicationQuestionType = InputFormQuestion['type'];

/**
 * Question `displayRole` flags (string or array).
 *
 * Visibility (where the question appears):
 * - `all` — public project page
 * - `judge` — project page for judges/admins only
 * - `table` — admin submissions review/export table column
 * - `hidden` — submit form only (not visible to the user)
 *
 * Field identity (what the question represents; combine with visibility flags):
 * - `title`, `location`, `track`, `tagline`, `description`, `banner`
 * - `pdfPoster` — poster PDF file upload (admin bulk export)
 * - `eligibleTrack` — sponsor/track eligibility checkbox (grouped on project page)
 *
 * Example: `"displayRole": ["all", "table", "title"]`
 *
 * Disable inputs on the submit form:
 * - `"disabled": true` on a question — always read-only
 * - `"disabledWhen": { "questionId": 2, "value": "Waterloo" }` — read-only when another answer matches
 * - `"disabled": true` on a multiple-choice option — that choice cannot be selected
 */
export type DisplayRole =
    | 'all'
    | 'judge'
    | 'table'
    | 'hidden'
    | 'title'
    | 'location'
    | 'track'
    | 'tagline'
    | 'description'
    | 'banner'
    | 'pdfPoster'
    | 'eligibleTrack';

export type DisplayRoles = DisplayRole | DisplayRole[];

export interface AlertData {
    title: string;
    description: string;
}

interface Question extends Entry {
    questionId: number; // must be unique to the application.
    type: string | 'N/A';
    required?: boolean;
    autoComplete?: HTMLInputAutoCompleteAttribute;
    hideTitle?: boolean;
    visibleWhen?: { questionId: number; value: string };
    disabled?: boolean;
    disabledWhen?: { questionId: number; value: string };
    displayRole?: DisplayRoles;
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

export interface QuestionTitleLineInput extends Question {
    type: 'title-line';
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
    trackName?: string;
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

export interface QuestionMarkdownInput extends Question {
    type: 'markdown';
    placeHolder?: string;
    value?: string;
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
 * Auto completes based on user input from an API endpoint (e.g., schools, countries).
 */
export interface QuestionApiDropdown extends Question {
    type: 'api-dropdown';
    title: string;
    required: boolean;
    questionId: number;
    apiUrl: string;
    selection: string;
    placeHolder?: string;
}

export interface QuestionMajorInput extends Question {
    type: 'major';
    title: string;
    required: boolean;
    questionId: number;
    apiUrl: string;
    selection: string[];
}

export interface QuestionDatePicker extends Question {
    type: 'date';
    value?: string;
}

/**
 * Date input with YYYY/MM/DD format
 */
export interface QuestionDateYmd extends Question {
    type: 'date-ymd';
    value?: string;
    placeHolder?: string;
}

/**
 * Dropdown/select input with optional custom input support
 */
export interface QuestionDropdown extends Question {
    type: 'dropdown';
    value?: string | string[]; // string if allowMultiple is false, string[] if true
    choices: ChoiceOption[];
    allowCustom?: boolean;
    customPlaceHolder?: string;
    allowMultiple?: boolean;
    placeHoldder?: string; // Placeholder text for the dropdown button (note: typo in field name)
    dropdownDescription?: string; // Description text shown inside the dropdown menu header
}

/**
 * Inline container that groups multiple questions horizontally
 */
export interface QuestionInline extends Omit<Question, 'questionId'> {
    type: 'inline';
    questionId?: number; // Optional for inline questions as they're containers
    content: InputFormQuestion[]; // Array of questions to display inline
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
