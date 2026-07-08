import { z } from 'zod';
import type { InputFormPageData } from '@/components/application_components/types';

export const SUPPORTED_QUESTION_TYPES = [
    'checkbox',
    'date',
    'date-ymd',
    'text-area',
    'text-line',
    'title-line',
    'number',
    'multiple-choice',
    'api-dropdown',
    'multiple-checkbox',
    'name',
    'file-upload',
    'rich-text',
    'markdown',
    'link',
    'dropdown',
    'major',
    'inline',
] as const;

export const REQUIRED_DISPLAY_ROLES = [
    'firstName',
    'lastName',
    'email',
] as const;

const questionSchema: z.ZodType<Record<string, unknown>> = z.lazy(() =>
    z
        .object({
            type: z.enum(SUPPORTED_QUESTION_TYPES),
            title: z.string().optional(),
            questionId: z.number().int().optional(),
            required: z.boolean().optional(),
            displayRole: z.union([z.string(), z.array(z.string())]).optional(),
            questions: z.array(questionSchema).optional(),
        })
        .passthrough()
);

const pageSchema = z
    .object({
        title: z.string({ message: 'Each page needs a title' }),
        description: z.string().optional(),
        alert: z
            .object({
                title: z.string().optional(),
                description: z.string().optional(),
            })
            .passthrough()
            .optional(),
        questions: z.array(questionSchema),
    })
    .passthrough();

export const applicationQuestionsSchema = z.array(pageSchema);

export type ApplicationQuestionsValidation =
    | { ok: true; data: InputFormPageData[] }
    | { ok: false; errors: string[] };

function collectQuestionIds(
    questions: Array<Record<string, unknown>>,
    out: number[]
) {
    for (const q of questions) {
        if (typeof q.questionId === 'number') out.push(q.questionId);
        if (Array.isArray(q.questions)) {
            collectQuestionIds(
                q.questions as Array<Record<string, unknown>>,
                out
            );
        }
    }
}

function collectRoles(
    questions: Array<Record<string, unknown>>,
    out: Set<string>
) {
    for (const q of questions) {
        const role = q.displayRole;
        if (typeof role === 'string') out.add(role);
        else if (Array.isArray(role)) role.forEach((r) => out.add(String(r)));
        if (Array.isArray(q.questions)) {
            collectRoles(q.questions as Array<Record<string, unknown>>, out);
        }
    }
}

export function validateApplicationQuestions(
    input: unknown
): ApplicationQuestionsValidation {
    const parsed = applicationQuestionsSchema.safeParse(input);
    if (!parsed.success) {
        const errors = parsed.error.issues.map((issue) => {
            const path = issue.path.join('.') || '(root)';
            return `${path}: ${issue.message}`;
        });
        return { ok: false, errors };
    }

    const errors: string[] = [];

    const ids: number[] = [];
    parsed.data.forEach((page) => collectQuestionIds(page.questions, ids));
    const seen = new Set<number>();
    const dupes = new Set<number>();
    for (const id of ids) {
        if (seen.has(id)) dupes.add(id);
        seen.add(id);
    }
    if (dupes.size > 0) {
        errors.push(
            `Duplicate questionId(s): ${[...dupes].sort((a, b) => a - b).join(', ')}`
        );
    }

    if (ids.length > 0) {
        const roles = new Set<string>();
        parsed.data.forEach((page) => collectRoles(page.questions, roles));
        for (const required of REQUIRED_DISPLAY_ROLES) {
            if (!roles.has(required)) {
                errors.push(
                    `Missing a question with displayRole "${required}"`
                );
            }
        }
    }

    if (errors.length > 0) return { ok: false, errors };

    return { ok: true, data: parsed.data as unknown as InputFormPageData[] };
}
