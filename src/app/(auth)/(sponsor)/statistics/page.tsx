'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    StatisticsChartsGrid,
    StatisticsChartsSkeleton,
    useResponsiveChartSize,
} from '@/components/statistics/StatisticsCharts';
import { trpc } from '@/trpc/client';
import {
    resolveChartsForCohort,
    type Cohort,
    type StatsPayload,
} from '@/lib/statistics/statsTypes';

export default function StatisticsPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const chartSize = useResponsiveChartSize();
    const hasSetInitialHackathon = useRef(false);

    const { data: hackathons = [] } = trpc.hackathons.getHackathons.useQuery();
    const [selectedHackathonId, setSelectedHackathonId] = useState<
        number | null
    >(null);

    const [payload, setPayload] = useState<StatsPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cohort, setCohort] = useState<Cohort>('accepted');

    useEffect(() => {
        if (hasSetInitialHackathon.current) return;
        if (hackathon?.id) {
            hasSetInitialHackathon.current = true;
            setSelectedHackathonId(hackathon.id);
        }
    }, [hackathon]);

    useEffect(() => {
        if (selectedHackathonId == null) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/blob/statistics/${selectedHackathonId}`
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
    }, [selectedHackathonId]);

    const activeCharts = resolveChartsForCohort(payload, cohort);
    const selectedHackathonName =
        hackathons.find((h) => h.id === selectedHackathonId)?.name ??
        'Select hackathon';

    const header = (
        <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                    Application Statistics
                </h1>
                <p className="text-sm text-white/60 sm:text-base">
                    {error
                        ? 'Error loading statistics data'
                        : 'Data visualization of hackers'}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Link href="/statistics/range">
                    <Button
                        type="button"
                        variant="default"
                        hierarchy="secondary"
                        size="compact"
                    >
                        Range view
                    </Button>
                </Link>
                {hackathons.length > 0 && (
                    <Select
                        value={
                            selectedHackathonId != null
                                ? String(selectedHackathonId)
                                : undefined
                        }
                        onValueChange={(value) =>
                            setSelectedHackathonId(Number(value))
                        }
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select hackathon">
                                {selectedHackathonName}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {hackathons.map((h) => (
                                <SelectItem key={h.id} value={String(h.id)}>
                                    {h.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
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
    );

    if (loading || selectedHackathonId == null) {
        return (
            <div className="mx-auto flex h-full w-full flex-col gap-4 sm:gap-6">
                {header}
                <StatisticsChartsSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto flex h-full w-full flex-col gap-4 sm:gap-6">
                {header}
            </div>
        );
    }

    return (
        <div className="mx-auto flex h-full w-full flex-col gap-4 sm:gap-6">
            {header}
            <StatisticsChartsGrid charts={activeCharts} chartSize={chartSize} />
        </div>
    );
}
