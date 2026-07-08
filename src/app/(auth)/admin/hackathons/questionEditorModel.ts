export type Choice = { name?: string; data?: unknown } & Record<
    string,
    unknown
>;

export type Question = Record<string, unknown> & {
    type?: string;
    title?: string;
    questionId?: number;
    required?: boolean;
    displayRole?: string | string[];
    placeHolder?: string;
    choices?: Choice[];
    questions?: Question[];
};

export type Page = Record<string, unknown> & {
    title?: string;
    questions?: Question[];
};

export const CHOICE_TYPES = [
    'multiple-choice',
    'multiple-checkbox',
    'dropdown',
];
export const isChoiceType = (type?: string) =>
    CHOICE_TYPES.includes(type ?? '');

export const PLACEHOLDER_TYPES = [
    'text-line',
    'text-area',
    'link',
    'number',
    'api-dropdown',
    'major',
];
export const usesPlaceholder = (type?: string) =>
    PLACEHOLDER_TYPES.includes(type ?? '');

export const QUESTION_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: 'text-line', label: 'Short text' },
    { value: 'text-area', label: 'Paragraph' },
    { value: 'multiple-choice', label: 'Multiple choice (pick one)' },
    { value: 'multiple-checkbox', label: 'Checkboxes (pick many)' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Agreement checkbox' },
    { value: 'number', label: 'Number' },
    { value: 'link', label: 'URL / link' },
    { value: 'file-upload', label: 'File upload' },
    { value: 'date-ymd', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'api-dropdown', label: 'API dropdown (school, etc.)' },
    { value: 'major', label: 'Major' },
    { value: 'title-line', label: 'Section heading' },
    { value: 'rich-text', label: 'Rich text' },
    { value: 'markdown', label: 'Markdown' },
];

export function typeLabel(type?: string): string {
    return (
        QUESTION_TYPE_OPTIONS.find((o) => o.value === type)?.label ??
        type ??
        'unknown'
    );
}

export function maxQuestionId(pages: Page[]): number {
    let max = 0;
    const walk = (questions: Question[]) => {
        for (const q of questions) {
            if (typeof q.questionId === 'number' && q.questionId > max) {
                max = q.questionId;
            }
            if (Array.isArray(q.questions)) walk(q.questions);
        }
    };
    pages.forEach((p) => walk(p.questions ?? []));
    return max;
}

export function updatePage(
    pages: Page[],
    pi: number,
    patch: Partial<Page>
): Page[] {
    return pages.map((p, i) => (i === pi ? { ...p, ...patch } : p));
}

function mapQuestions(
    pages: Page[],
    pi: number,
    fn: (questions: Question[]) => Question[]
): Page[] {
    return pages.map((p, i) =>
        i === pi ? { ...p, questions: fn(p.questions ?? []) } : p
    );
}

export function updateQuestion(
    pages: Page[],
    pi: number,
    qi: number,
    patch: Partial<Question>
): Page[] {
    return mapQuestions(pages, pi, (qs) =>
        qs.map((q, j) => (j === qi ? { ...q, ...patch } : q))
    );
}

export function addQuestion(pages: Page[], pi: number): Page[] {
    const newQuestion: Question = {
        type: 'text-line',
        title: '',
        required: false,
        questionId: maxQuestionId(pages) + 1,
    };
    return mapQuestions(pages, pi, (qs) => [...qs, newQuestion]);
}

export function removeQuestion(pages: Page[], pi: number, qi: number): Page[] {
    return mapQuestions(pages, pi, (qs) => qs.filter((_, j) => j !== qi));
}

export function moveQuestion(
    pages: Page[],
    pi: number,
    qi: number,
    dir: -1 | 1
): Page[] {
    return mapQuestions(pages, pi, (qs) => {
        const target = qi + dir;
        if (target < 0 || target >= qs.length) return qs;
        const next = [...qs];
        [next[qi], next[target]] = [next[target], next[qi]];
        return next;
    });
}

export function addPage(pages: Page[]): Page[] {
    return [...pages, { title: 'New page', questions: [] }];
}

export function removePage(pages: Page[], pi: number): Page[] {
    return pages.filter((_, i) => i !== pi);
}

function mapChoices(
    pages: Page[],
    pi: number,
    qi: number,
    fn: (choices: Choice[]) => Choice[]
): Page[] {
    return updateQuestion(pages, pi, qi, {
        choices: fn(pages[pi]?.questions?.[qi]?.choices ?? []),
    });
}

export function setChoice(
    pages: Page[],
    pi: number,
    qi: number,
    ci: number,
    value: string
): Page[] {
    return mapChoices(pages, pi, qi, (cs) =>
        cs.map((c, k) => (k === ci ? { ...c, name: value, data: value } : c))
    );
}

export function addChoice(pages: Page[], pi: number, qi: number): Page[] {
    return mapChoices(pages, pi, qi, (cs) => [...cs, { name: '', data: '' }]);
}

export function removeChoice(
    pages: Page[],
    pi: number,
    qi: number,
    ci: number
): Page[] {
    return mapChoices(pages, pi, qi, (cs) => cs.filter((_, k) => k !== ci));
}
