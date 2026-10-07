import type {
    InputFormPageData,
    InputFormQuestion,
} from '@/components/application_components/types';
import { resolveApplicationQuestionIdByRole } from '@/lib/applications/applicationReviewExport';
import { getResponseValue } from '@/lib/admin/submissionExport';
import { flattenSubmissionQuestions } from '@/lib/projects/submissionFormQuestions';
import {
    DEMOGRAPHIC_STAT_ROLES,
    type DemographicStatRole,
} from './demographicRoles';
import { answersToCountKeys } from './normalizeFreeText';

export type PieSlice = {
    name: string;
    value: number;
    fill: string;
};

export type ApplicationForStats = {
    response: Record<string, unknown>;
    currentStatus: string;
};

export type DemographicPieCharts = Record<DemographicStatRole, PieSlice[]>;

function getColorByIndex(index: number): string {
    const colors = [
        'hsl(220 70% 60%)',
        'hsl(160 60% 55%)',
        'hsl(45 85% 65%)',
        'hsl(320 70% 65%)',
        'hsl(120 50% 55%)',
        'hsl(280 65% 65%)',
        'hsl(15 75% 60%)',
        'hsl(0 60% 60%)',
        'hsl(200 60% 60%)',
        'hsl(60 70% 60%)',
    ];
    return colors[index % colors.length];
}

/** Default: singleton answers (count < 2) roll into Other */
const MIN_COUNT_FOR_OWN_SLICE = 2;
/** Schools need a larger cohort before getting their own slice */
const MIN_SCHOOL_COUNT_FOR_OWN_SLICE = 7;
const SECONDARY_SCHOOL_LABEL = 'Secondary / High School';

const SECONDARY_EDUCATION_VALUES = new Set([
    'secondary',
    'less_than_secondary',
]);

function isSecondaryEducationLevel(value: unknown): boolean {
    const parts = Array.isArray(value)
        ? value
        : value == null || value === ''
          ? []
          : [value];
    for (const part of parts) {
        const normalized = String(part).trim().toLowerCase();
        if (!normalized) continue;
        if (SECONDARY_EDUCATION_VALUES.has(normalized)) return true;
        if (
            normalized.includes('secondary') ||
            normalized.includes('high school') ||
            normalized.includes('less than secondary')
        ) {
            return true;
        }
    }
    return false;
}

export function processFieldData(
    allKeys: string[],
    options?: {
        minCount?: number;
        protectedLabels?: ReadonlySet<string>;
    }
): PieSlice[] {
    const minCount = options?.minCount ?? MIN_COUNT_FOR_OWN_SLICE;
    const protectedLabels = options?.protectedLabels ?? new Set<string>();

    const fieldCount = allKeys.reduce(
        (acc: Record<string, number>, key: string) => {
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const processedData: Record<string, number> = {};
    let otherCount = 0;

    Object.entries(fieldCount).forEach(([value, count]) => {
        if (count >= minCount || protectedLabels.has(value)) {
            processedData[value] = (processedData[value] || 0) + count;
        } else {
            otherCount += count;
        }
    });

    if (otherCount > 0) {
        processedData['Other'] = (processedData['Other'] || 0) + otherCount;
    }

    const sortedEntries = Object.entries(processedData).sort(
        (a, b) => b[1] - a[1]
    );

    return sortedEntries.map(([value, count], index) => ({
        name: value,
        value: count,
        fill: index === 0 ? '#3730a3' : getColorByIndex(index),
    }));
}

export function buildRoleToQuestionIdMap(
    pages: InputFormPageData[] | undefined
): Partial<Record<DemographicStatRole, string>> {
    const map: Partial<Record<DemographicStatRole, string>> = {};
    for (const role of DEMOGRAPHIC_STAT_ROLES) {
        const id = resolveApplicationQuestionIdByRole(pages, role);
        if (id) map[role] = id;
    }
    return map;
}

function choiceLabelMapForQuestion(
    question: InputFormQuestion | undefined
): Map<string, string> | undefined {
    const choices = (
        question as { choices?: { data?: string; name?: string }[] } | undefined
    )?.choices;
    if (!choices?.length) return undefined;
    const map = new Map<string, string>();
    for (const choice of choices) {
        const data = String(choice.data ?? '').trim();
        const name = String(choice.name ?? '').trim();
        if (data && name) map.set(data, name);
    }
    return map.size > 0 ? map : undefined;
}

export function buildDemographicPieCharts(
    pages: InputFormPageData[] | undefined,
    apps: ApplicationForStats[]
): DemographicPieCharts {
    const roleToId = buildRoleToQuestionIdMap(pages);
    const questions = flattenSubmissionQuestions(pages);
    const result = {} as DemographicPieCharts;

    const educationQuestionId = roleToId.education;

    for (const role of DEMOGRAPHIC_STAT_ROLES) {
        const questionId = roleToId[role];
        if (!questionId) {
            result[role] = [];
            continue;
        }

        const question = questions.find(
            (q) => q.questionId != null && String(q.questionId) === questionId
        );
        const choiceLabels = choiceLabelMapForQuestion(question);

        const keys: string[] = [];
        for (const app of apps) {
            if (role === 'school') {
                const educationRaw = educationQuestionId
                    ? getResponseValue(app.response, educationQuestionId)
                    : null;
                if (isSecondaryEducationLevel(educationRaw)) {
                    keys.push(SECONDARY_SCHOOL_LABEL);
                    continue;
                }
            }

            const raw = getResponseValue(app.response, questionId);
            keys.push(...answersToCountKeys(raw, role, choiceLabels));
        }

        if (role === 'school') {
            result[role] = processFieldData(keys, {
                minCount: MIN_SCHOOL_COUNT_FOR_OWN_SLICE,
                protectedLabels: new Set([SECONDARY_SCHOOL_LABEL]),
            });
        } else {
            result[role] = processFieldData(keys);
        }
    }

    return result;
}
