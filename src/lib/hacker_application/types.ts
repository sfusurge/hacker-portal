interface Entry {
  title?: string;
  description?: string;
}

interface Application extends Entry {
  version: number; // version must match, discard the application otherwise. Increment version with every change please.

  hackathonName: string; // should this be hackathon id in table instead?
  submissionTime: string;

  pages: ApplicationPage[];
}

/**
 * Same info as application, except pages are destructured.
 */
interface FlatApplication extends Entry {
  version: number; // version must match, discard the application otherwise. Increment version with every change please.

  hackathonName: string; // should this be hackathon id in table instead?
  submissionTime: string;

  questions: ApplicationQuestion[];
}

interface ApplicationPage extends Entry {
  questions: ApplicationQuestion[];
}

type ApplicationQuestion =
  | QuestionCheckBoxInput
  | QuestionDatePicker
  | QuestionTextAreaInput
  | QuestionTextLineInput
  | QuestionNumberInput
  | QuestionMultipleChoice
  | QuestionSchoolName;

interface Question extends Entry {
  questionId: number; // must be unique to the application.
  required?: boolean;
}

interface QuestionTextLineInput extends Question {
  type: 'text-line';
  placeHolder?: string;
  value?: string;
  maxCharacter: number;
}

interface QuestionTextAreaInput extends Question {
  type: 'text-area';
  placeHolder?: string;
  value?: string;
  maxCharacter: number;
}

interface QuestionNumberInput extends Question {
  type: 'number';
  placeHolder?: number;
  value?: number;
  min?: number;
  max?: number;
}

interface QuestionCheckBoxInput extends Question {
  type: 'checkbox';
  value?: boolean;
}

/**
 * For short and finite number of choices. For example T-shirt sizes, not university name.
 * In Choices, "value" is the internal data, "name" is whats actually displayed.
 */
interface QuestionMultipleChoice extends Question {
  type: 'multiple-choice';
  value?: string;
  choices: [{ value: string; name: string }];
}

/**
 * Auto completes based on user input, from a near infinite list of uni names.
 */
interface QuestionSchoolName extends Question {
  // TODO
  type: 'school-name';
  value?: string;
}

interface QuestionDatePicker extends Question {
  type: 'date';
  value?: string;
}
