'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/16/solid';
import {
    PieChart as RechartsPieChart,
    Pie as RechartsPie,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    Sector,
} from 'recharts';
import { useCallback, useEffect, useState } from 'react';
import {
    DEMOGRAPHIC_CHART_DESCRIPTIONS,
    DEMOGRAPHIC_CHART_LABELS,
    DEMOGRAPHIC_STAT_ROLES,
    type DemographicStatRole,
} from '@/lib/statistics/demographicRoles';
import type { PieSlice } from '@/lib/statistics/statsTypes';

function escapeCsvCell(value: string | number): string {
    const text = String(value);
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

export function downloadChartCsv(title: string, data: PieSlice[]) {
    const total = data.reduce((sum, row) => sum + row.value, 0);
    const lines = [
        ['Category', 'Count', 'Percent'].map(escapeCsvCell).join(','),
        ...data.map((row) => {
            const pct =
                total > 0 ? ((row.value / total) * 100).toFixed(1) : '0.0';
            return [row.name, row.value, pct].map(escapeCsvCell).join(',');
        }),
    ];

    const blob = new Blob([lines.join('\n')], {
        type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safeName = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    anchor.href = url;
    anchor.download = `${safeName || 'chart'}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
}

export function useResponsiveChartSize() {
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

function renderActiveShape(props: any) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
        props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="none"
            />
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={outerRadius + 10}
                outerRadius={outerRadius + 14}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                opacity={0.35}
                stroke="none"
            />
        </g>
    );
}

function CustomLegend({
    data,
    onMouseEnter,
    onMouseLeave,
    activeIndex,
}: {
    data: PieSlice[];
    onMouseEnter: (index: number) => void;
    onMouseLeave: () => void;
    activeIndex: number | null;
}) {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div
            className="mt-3 max-h-32 w-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin]"
            onWheel={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col gap-0.5">
                {data.map((entry, index) => {
                    const pct =
                        total > 0 ? Math.round((entry.value / total) * 100) : 0;

                    return (
                        <div
                            key={entry.name}
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors duration-150 ${
                                activeIndex === index
                                    ? 'bg-white/10'
                                    : 'hover:bg-white/5'
                            }`}
                            onMouseEnter={() => onMouseEnter(index)}
                            onMouseLeave={onMouseLeave}
                        >
                            <div
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: entry.fill }}
                            />
                            <span className="min-w-0 flex-1 truncate text-xs text-white/60">
                                {entry.name} ({entry.value}, {pct}%)
                            </span>
                        </div>
                    );
                })}
            </div>
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
    emptyMessage = 'This data was not collected for this hackathon.',
}: {
    title: string;
    description: string;
    data: PieSlice[];
    activeIndex: number | null;
    setActiveIndex: (index: number | null) => void;
    chartSize: ReturnType<typeof useResponsiveChartSize>;
    emptyMessage?: string;
}) {
    const handleActivate = useCallback(
        (index: number | null) => {
            setActiveIndex(index);
        },
        [setActiveIndex]
    );

    return (
        <Card className="h-full min-h-[420px]">
            <CardHeader>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-left">
                        {description}
                    </CardDescription>
                </div>
                {data.length > 0 && (
                    <Button
                        type="button"
                        variant="default"
                        hierarchy="secondary"
                        size="compact"
                        leadingIconChild={
                            <ArrowDownTrayIcon className="size-4" />
                        }
                        onClick={() => downloadChartCsv(title, data)}
                    >
                        CSV
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
                {data.length === 0 ? (
                    <div className="flex min-h-[300px] flex-1 items-center justify-center px-4">
                        <p className="text-center text-sm text-white/50">
                            {emptyMessage}
                        </p>
                    </div>
                ) : (
                    <div className="flex w-full flex-1 flex-col">
                        <div className="h-[240px] w-full sm:h-[260px]">
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
                                        activeIndex={
                                            activeIndex === null
                                                ? undefined
                                                : activeIndex
                                        }
                                        activeShape={renderActiveShape}
                                        onMouseEnter={(
                                            _data: unknown,
                                            index: number
                                        ) => handleActivate(index)}
                                        onMouseLeave={() =>
                                            handleActivate(null)
                                        }
                                    >
                                        {data.map((entry) => (
                                            <Cell
                                                key={`cell-${entry.name}`}
                                                fill={entry.fill}
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
                                        animationDuration={150}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                        <CustomLegend
                            data={data}
                            activeIndex={activeIndex}
                            onMouseEnter={handleActivate}
                            onMouseLeave={() => handleActivate(null)}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function StatisticsChartsGrid({
    charts,
    chartSize,
    emptyMessage,
}: {
    charts: Partial<Record<DemographicStatRole, PieSlice[]>>;
    chartSize: ReturnType<typeof useResponsiveChartSize>;
    emptyMessage?: string;
}) {
    const [activeIndexes, setActiveIndexes] = useState<
        Partial<Record<DemographicStatRole, number | null>>
    >({});

    return (
        <div className="grid grid-cols-1 gap-4 pb-28 sm:gap-6 md:pb-10 xl:grid-cols-2">
            {DEMOGRAPHIC_STAT_ROLES.map((role) => (
                <StatisticsCard
                    key={role}
                    title={DEMOGRAPHIC_CHART_LABELS[role]}
                    description={DEMOGRAPHIC_CHART_DESCRIPTIONS[role]}
                    data={charts[role] ?? []}
                    activeIndex={activeIndexes[role] ?? null}
                    setActiveIndex={(index) =>
                        setActiveIndexes((prev) => {
                            if ((prev[role] ?? null) === index) {
                                return prev;
                            }
                            return {
                                ...prev,
                                [role]: index,
                            };
                        })
                    }
                    chartSize={chartSize}
                    emptyMessage={emptyMessage}
                />
            ))}
        </div>
    );
}

export function StatisticsChartsSkeleton() {
    return (
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
    );
}
