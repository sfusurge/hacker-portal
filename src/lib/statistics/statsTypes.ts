import type { DemographicStatRole } from './demographicRoles';
import { DEMOGRAPHIC_STAT_ROLES } from './demographicRoles';

export type PieSlice = { name: string; value: number; fill: string };
export type Cohort = 'all' | 'accepted';
export type ChartsByRole = Partial<Record<DemographicStatRole, PieSlice[]>>;

export type StatsPayload = {
    datasets?: {
        all?: ChartsByRole;
        accepted?: ChartsByRole;
    };
    // legacy shape before this change
    pronouns?: PieSlice[];
    experience?: PieSlice[];
    school?: PieSlice[];
    levelStudy?: PieSlice[];
};

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

export function resolveChartsForCohort(
    payload: StatsPayload | null,
    cohort: Cohort
): ChartsByRole {
    if (!payload) return {};

    if (payload.datasets?.[cohort]) {
        return payload.datasets[cohort] ?? {};
    }

    // Legacy blob (pre-rewrite): treat as accepted-only with old keys
    if (cohort === 'accepted') {
        return {
            pronouns: payload.pronouns ?? [],
            priorHackathons: payload.experience ?? [],
            school: payload.school ?? [],
            education: payload.levelStudy ?? [],
        };
    }

    return {};
}

function mergePieSlices(slicesList: PieSlice[][]): PieSlice[] {
    const totals = new Map<string, number>();

    for (const slices of slicesList) {
        for (const slice of slices) {
            totals.set(slice.name, (totals.get(slice.name) ?? 0) + slice.value);
        }
    }

    return [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], index) => ({
            name,
            value,
            fill: index === 0 ? '#3730a3' : getColorByIndex(index),
        }));
}

/** Merge multiple chart sets by summing counts for matching category names. */
export function mergeChartsByRole(chartsList: ChartsByRole[]): ChartsByRole {
    const result: ChartsByRole = {};

    for (const role of DEMOGRAPHIC_STAT_ROLES) {
        const slicesList = chartsList
            .map((charts) => charts[role] ?? [])
            .filter((slices) => slices.length > 0);

        result[role] = slicesList.length > 0 ? mergePieSlices(slicesList) : [];
    }

    return result;
}

export function mergeStatsPayloads(
    payloads: StatsPayload[],
    cohort: Cohort
): ChartsByRole {
    return mergeChartsByRole(
        payloads.map((payload) => resolveChartsForCohort(payload, cohort))
    );
}
