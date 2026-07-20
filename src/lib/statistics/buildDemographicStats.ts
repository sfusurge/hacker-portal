import type { InputFormPageData } from '@/components/application_components/types';
import { resolveApplicationQuestionIdByRole } from '@/lib/applications/applicationReviewExport';
import { getResponseValue } from '@/lib/admin/submissionExport';
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

/** Count keys across applicants; singleton answers (count < 2) roll into Other */
const MIN_COUNT_FOR_OWN_SLICE = 2;

export function processFieldData(allKeys: string[]): PieSlice[] {
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
        if (count >= MIN_COUNT_FOR_OWN_SLICE) {
            processedData[value] = count;
        } else {
            otherCount += count;
        }
    });

    if (otherCount > 0) {
        processedData['Other'] = otherCount;
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

export function buildDemographicPieCharts(
    pages: InputFormPageData[] | undefined,
    apps: ApplicationForStats[]
): DemographicPieCharts {
    const roleToId = buildRoleToQuestionIdMap(pages);
    const result = {} as DemographicPieCharts;

    for (const role of DEMOGRAPHIC_STAT_ROLES) {
        const questionId = roleToId[role];
        if (!questionId) {
            result[role] = [];
            continue;
        }

        const keys: string[] = [];
        for (const app of apps) {
            const raw = getResponseValue(app.response, questionId);
            keys.push(...answersToCountKeys(raw, role));
        }
        result[role] = processFieldData(keys);
    }

    return result;
}
