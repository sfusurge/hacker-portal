'use client';

import { useEffect, useMemo, useState } from 'react';
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
    mergeStatsPayloads,
    type Cohort,
    type StatsPayload,
} from '@/lib/statistics/statsTypes';

type HackathonOption = {
    id: number;
    name: string;
    startDate: string;
};

function sortHackathons(hackathons: HackathonOption[]) {
    return [...hackathons].sort((a, b) => {
        const aTime = Date.parse(a.startDate);
        const bTime = Date.parse(b.startDate);
        if (
            Number.isFinite(aTime) &&
            Number.isFinite(bTime) &&
            aTime !== bTime
        ) {
            return aTime - bTime;
        }
        return a.id - b.id;
    });
}

export default function StatisticsRangePage() {
    const activeHackathon = useAtomValue(hackathonAtom);
    const chartSize = useResponsiveChartSize();
    const { data: hackathons = [] } = trpc.hackathons.getHackathons.useQuery();

    const sortedHackathons = useMemo(
        () => sortHackathons(hackathons as HackathonOption[]),
        [hackathons]
    );

    const [fromId, setFromId] = useState<number | null>(null);
    const [toId, setToId] = useState<number | null>(null);
    const [cohort, setCohort] = useState<Cohort>('accepted');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payloads, setPayloads] = useState<StatsPayload[]>([]);
    const [missingNames, setMissingNames] = useState<string[]>([]);
    const [includedNames, setIncludedNames] = useState<string[]>([]);

    useEffect(() => {
        if (sortedHackathons.length === 0) return;
        if (fromId != null && toId != null) return;

        const fallbackId =
            activeHackathon?.id ??
            sortedHackathons[sortedHackathons.length - 1]?.id ??
            null;
        if (fallbackId == null) return;

        setFromId((prev) => prev ?? fallbackId);
        setToId((prev) => prev ?? fallbackId);
    }, [sortedHackathons, activeHackathon, fromId, toId]);

    const rangeHackathons = useMemo(() => {
        if (fromId == null || toId == null) return [];

        const fromIndex = sortedHackathons.findIndex((h) => h.id === fromId);
        const toIndex = sortedHackathons.findIndex((h) => h.id === toId);
        if (fromIndex < 0 || toIndex < 0) return [];

        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        return sortedHackathons.slice(start, end + 1);
    }, [sortedHackathons, fromId, toId]);

    useEffect(() => {
        if (rangeHackathons.length === 0) return;

        let cancelled = false;

        const fetchRange = async () => {
            setLoading(true);
            setError(null);

            try {
                const results = await Promise.all(
                    rangeHackathons.map(async (h) => {
                        const response = await fetch(
                            `/api/blob/statistics/${h.id}`
                        );
                        const result = await response.json();
                        return {
                            hackathon: h,
                            success: Boolean(result.success),
                            data: (result.data ?? null) as StatsPayload | null,
                        };
                    })
                );

                if (cancelled) return;

                const found = results.filter((r) => r.success && r.data);
                const missing = results
                    .filter((r) => !r.success || !r.data)
                    .map((r) => r.hackathon.name);

                setPayloads(found.map((r) => r.data!));
                setIncludedNames(found.map((r) => r.hackathon.name));
                setMissingNames(missing);

                if (found.length === 0) {
                    setError(
                        'No statistics found for hackathons in this range. Generate stats for each hackathon first.'
                    );
                }
            } catch {
                if (!cancelled) {
                    setError('Failed to load statistics for this range');
                    setPayloads([]);
                    setIncludedNames([]);
                    setMissingNames([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchRange();
        return () => {
            cancelled = true;
        };
    }, [rangeHackathons]);

    const charts = useMemo(
        () => mergeStatsPayloads(payloads, cohort),
        [payloads, cohort]
    );

    const fromName =
        sortedHackathons.find((h) => h.id === fromId)?.name ?? 'From';
    const toName = sortedHackathons.find((h) => h.id === toId)?.name ?? 'To';

    const header = (
        <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                    Statistics Range
                </h1>
                <p className="text-sm text-white/60 sm:text-base">
                    Combined demographics across a contiguous hackathon range
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Link href="/statistics">
                    <Button
                        type="button"
                        variant="default"
                        hierarchy="secondary"
                        size="compact"
                    >
                        Single hackathon
                    </Button>
                </Link>
                {sortedHackathons.length > 0 && (
                    <>
                        <Select
                            value={fromId != null ? String(fromId) : undefined}
                            onValueChange={(value) => setFromId(Number(value))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="From">
                                    {fromName}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {sortedHackathons.map((h) => (
                                    <SelectItem key={h.id} value={String(h.id)}>
                                        {h.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-white/50">to</span>
                        <Select
                            value={toId != null ? String(toId) : undefined}
                            onValueChange={(value) => setToId(Number(value))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="To">
                                    {toName}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {sortedHackathons.map((h) => (
                                    <SelectItem key={h.id} value={String(h.id)}>
                                        {h.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
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

    return (
        <div className="mx-auto flex h-full w-full flex-col gap-4 sm:gap-6">
            {header}

            {(includedNames.length > 0 || missingNames.length > 0) && (
                <div className="text-sm text-white/50">
                    {includedNames.length > 0 && (
                        <p>
                            Including: {includedNames.join(', ')} (
                            {includedNames.length})
                        </p>
                    )}
                    {missingNames.length > 0 && (
                        <p className="text-white/40">
                            Missing stats blob: {missingNames.join(', ')}
                        </p>
                    )}
                </div>
            )}

            {loading || fromId == null || toId == null ? (
                <StatisticsChartsSkeleton />
            ) : error ? (
                <p className="text-sm text-white/50">{error}</p>
            ) : (
                <StatisticsChartsGrid
                    charts={charts}
                    chartSize={chartSize}
                    emptyMessage="No data in this range for this field."
                />
            )}
        </div>
    );
}
