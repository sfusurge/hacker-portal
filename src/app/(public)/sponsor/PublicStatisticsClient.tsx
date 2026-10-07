'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    StatisticsChartsGrid,
    StatisticsChartsSkeleton,
    useResponsiveChartSize,
} from '@/components/statistics/StatisticsCharts';
import {
    resolveChartsForCohort,
    type Cohort,
    type StatsPayload,
} from '@/lib/statistics/statsTypes';
import { withSponsorPublicToken } from '@/lib/sponsor/publicSponsorAccess';

export default function PublicStatisticsClient({
    hackathonId,
    hackathonName,
    token,
}: {
    hackathonId: number;
    hackathonName: string;
    token: string;
}) {
    const chartSize = useResponsiveChartSize();
    const [payload, setPayload] = useState<StatsPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cohort, setCohort] = useState<Cohort>('accepted');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/blob/statistics/${hackathonId}`
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
    }, [hackathonId]);

    const activeCharts = resolveChartsForCohort(payload, cohort);

    return (
        <div className="mx-auto flex h-full w-full flex-col gap-4 sm:gap-6">
            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Application Statistics
                        </h1>
                        <p className="mt-1 text-sm text-white/60">
                            {error
                                ? 'Error loading statistics data'
                                : `Demographics and representation of ${hackathonName}`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-600/30 bg-neutral-900 p-3">
                    <button
                        type="button"
                        onClick={() => setCohort('all')}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                            cohort === 'all'
                                ? 'bg-brand-600 text-white'
                                : 'hover:bg-neutral-750 bg-neutral-800 text-white/60'
                        }`}
                    >
                        All applicants
                    </button>
                    <button
                        type="button"
                        onClick={() => setCohort('accepted')}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                            cohort === 'accepted'
                                ? 'bg-brand-600 text-white'
                                : 'hover:bg-neutral-750 bg-neutral-800 text-white/60'
                        }`}
                    >
                        Accepted only
                    </button>
                </div>
            </div>

            {loading ? (
                <StatisticsChartsSkeleton />
            ) : error ? null : (
                <StatisticsChartsGrid
                    charts={activeCharts}
                    chartSize={chartSize}
                />
            )}
        </div>
    );
}
