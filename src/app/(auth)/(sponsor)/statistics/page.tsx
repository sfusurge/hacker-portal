'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PieChart as RechartsPieChart,
    Pie as RechartsPie,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import {
    DEMOGRAPHIC_CHART_DESCRIPTIONS,
    DEMOGRAPHIC_CHART_LABELS,
    DEMOGRAPHIC_STAT_ROLES,
    type DemographicStatRole,
} from '@/lib/statistics/demographicRoles';

type PieSlice = { name: string; value: number; fill: string };
type Cohort = 'all' | 'accepted';
type ChartsByRole = Partial<Record<DemographicStatRole, PieSlice[]>>;

type StatsPayload = {
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

function useResponsiveChartSize() {
    const [chartSize, setChartSize] = useState({
        outerRadius: 80,
        innerRadius: 50,
        fontSize: 12,
        legendLayout: 'vertical' as 'vertical' | 'horizontal',
    });

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setChartSize({
                    outerRadius: 50,
                    innerRadius: 30,
                    fontSize: 10,
                    legendLayout: 'horizontal',
                });
            } else if (width < 768) {
                setChartSize({
                    outerRadius: 60,
                    innerRadius: 35,
                    fontSize: 11,
                    legendLayout: 'horizontal',
                });
            } else if (width < 1024) {
                setChartSize({
                    outerRadius: 70,
                    innerRadius: 45,
                    fontSize: 12,
                    legendLayout: 'vertical',
                });
            } else {
                setChartSize({
                    outerRadius: 80,
                    innerRadius: 50,
                    fontSize: 12,
                    legendLayout: 'vertical',
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return chartSize;
}

function CustomLegend({
    payload,
    onMouseEnter,
    onMouseLeave,
    activeIndex,
}: any) {
    return (
        <div className="flex w-full flex-wrap justify-center gap-1">
            {payload.map((entry: any, index: number) => (
                <div
                    key={index}
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-0.5 transition-all duration-200 ${
                        activeIndex === index
                            ? 'scale-105 bg-white/10'
                            : 'hover:bg-white/5'
                    }`}
                    onMouseEnter={() => onMouseEnter(index)}
                    onMouseLeave={onMouseLeave}
                >
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-white/60">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

function StatisticsCard({
    title,
    description,
    data,
    activeIndex,
    setActiveIndex,
    chartSize,
}: {
    title: string;
    description: string;
    data: PieSlice[];
    activeIndex: number | null;
    setActiveIndex: (index: number | null) => void;
    chartSize: ReturnType<typeof useResponsiveChartSize>;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-right md:text-left">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    {data.length === 0 ? (
                        <p className="text-sm text-white/50">
                            No data for this field (question may be missing
                            displayRole on this hackathon form).
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <RechartsPie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={chartSize.outerRadius}
                                    innerRadius={chartSize.innerRadius}
                                    stroke="none"
                                    onMouseEnter={(_data: any, index: number) =>
                                        setActiveIndex(index)
                                    }
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                            opacity={
                                                activeIndex === null ||
                                                activeIndex === index
                                                    ? 1
                                                    : 0.3
                                            }
                                        />
                                    ))}
                                </RechartsPie>
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: '#0f0f0f',
                                        border: '1px solid #525252',
                                        borderRadius: '8px',
                                        fontSize: chartSize.fontSize,
                                        color: '#f5f5f5',
                                        boxShadow:
                                            '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                                    }}
                                    labelStyle={{ color: '#f5f5f5' }}
                                    itemStyle={{ color: '#f5f5f5' }}
                                />
                                <Legend
                                    content={(props) => (
                                        <CustomLegend
                                            {...props}
                                            onMouseEnter={(index: number) =>
                                                setActiveIndex(index)
                                            }
                                            onMouseLeave={() =>
                                                setActiveIndex(null)
                                            }
                                            activeIndex={activeIndex}
                                        />
                                    )}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function resolveChartsForCohort(
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

export default function StatisticsPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const chartSize = useResponsiveChartSize();

    const [payload, setPayload] = useState<StatsPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cohort, setCohort] = useState<Cohort>('accepted');
    const [activeIndexes, setActiveIndexes] = useState<
        Partial<Record<DemographicStatRole, number | null>>
    >({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/blob/statistics/${hackathon.id}`
                );
                const result = await response.json();

                if (result.success) {
                    setPayload(result.data);
                    setError(null);
                } else {
                    setError(result.error || 'Failed to fetch statistics data');
                    setPayload(null);
                }
            } catch {
                setError('Failed to fetch statistics data');
                setPayload(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [hackathon.id]);

    const activeCharts = resolveChartsForCohort(payload, cohort);

    if (loading) {
        return (
            <div className="flex h-full w-full flex-col gap-4 sm:gap-6">
                <div className="text-left text-white">
                    <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                        Application Statistics
                    </h1>
                    <p className="text-sm text-white/60 sm:text-base">
                        Data visualization of hackers
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-4 pb-28 sm:gap-6 md:pb-10 xl:grid-cols-2">
                    {[...Array(4)].map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <Skeleton className="mb-2 h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[250px] w-full sm:h-[300px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full w-full flex-col gap-4 sm:gap-6">
                <div className="text-left text-white">
                    <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                        Application Statistics
                    </h1>
                    <p className="text-sm text-white/60 sm:text-base">
                        Error loading statistics data
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto flex h-full w-full flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                        Application Statistics
                    </h1>
                    <p className="text-sm text-white/60 sm:text-base">
                        Data visualization of hackers
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setCohort('all')}
                        className={`rounded-md px-3 py-1.5 text-sm ${
                            cohort === 'all'
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                    >
                        All applicants
                    </button>
                    <button
                        type="button"
                        onClick={() => setCohort('accepted')}
                        className={`rounded-md px-3 py-1.5 text-sm ${
                            cohort === 'accepted'
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                    >
                        Accepted only
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pb-28 sm:gap-6 md:pb-10 xl:grid-cols-2">
                {DEMOGRAPHIC_STAT_ROLES.map((role) => (
                    <StatisticsCard
                        key={role}
                        title={DEMOGRAPHIC_CHART_LABELS[role]}
                        description={DEMOGRAPHIC_CHART_DESCRIPTIONS[role]}
                        data={activeCharts[role] ?? []}
                        activeIndex={activeIndexes[role] ?? null}
                        setActiveIndex={(index) =>
                            setActiveIndexes((prev) => ({
                                ...prev,
                                [role]: index,
                            }))
                        }
                        chartSize={chartSize}
                    />
                ))}
            </div>
        </div>
    );
}
