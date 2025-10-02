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

// responsive chart sizing
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
                // sm
                setChartSize({
                    outerRadius: 50,
                    innerRadius: 30,
                    fontSize: 10,
                    legendLayout: 'horizontal' as 'vertical' | 'horizontal',
                });
            } else if (width < 768) {
                // md
                setChartSize({
                    outerRadius: 60,
                    innerRadius: 35,
                    fontSize: 11,
                    legendLayout: 'horizontal' as 'vertical' | 'horizontal',
                });
            } else if (width < 1024) {
                // lg
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

// custom legend component with hover interactions
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
    data: any[];
    activeIndex: number | null;
    setActiveIndex: (index: number | null) => void;
    chartSize: any;
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
                            >
                                {data.map((entry: any, index: number) => (
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
                                    color: '#f5f5f5 !important',
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
                </div>
            </CardContent>
        </Card>
    );
}

export default function StatisticsPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const chartSize = useResponsiveChartSize();

    const [pieChartData, setPieChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activePronounsIndex, setActivePronounsIndex] = useState<
        number | null
    >(null);
    const [activeExperienceIndex, setActiveExperienceIndex] = useState<
        number | null
    >(null);
    const [activeLevelStudyIndex, setActiveLevelStudyIndex] = useState<
        number | null
    >(null);
    const [activeSchoolIndex, setActiveSchoolIndex] = useState<number | null>(
        null
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/blob/statistics/${hackathon.id}`
                );
                const result = await response.json();

                if (result.success) {
                    setPieChartData(result.data);
                    setError(null);
                } else {
                    setError(result.error || 'Failed to fetch statistics data');
                    setPieChartData(null);
                }
            } catch (err) {
                setError('Failed to fetch statistics data');
                setPieChartData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [hackathon.id]);

    const pronounsData = pieChartData?.pronouns || [];
    const experienceData = pieChartData?.experience || [];
    const levelStudyData = pieChartData?.levelStudy || [];
    const schoolData = pieChartData?.school || [];

    if (loading) {
        return (
            <div className="flex h-full w-full flex-col gap-4 p-4 sm:gap-6 sm:p-6">
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
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full w-full flex-col gap-4 p-4 sm:gap-6 sm:p-6">
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
            <div className="text-white">
                <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                    Application Statistics
                </h1>
                <p className="text-sm text-white/60 sm:text-base">
                    Data visualization of hackers
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pb-28 sm:gap-6 md:pb-10 xl:grid-cols-2">
                <StatisticsCard
                    title="Pronouns Distribution"
                    description="Applicant pronouns"
                    data={pronounsData}
                    activeIndex={activePronounsIndex}
                    setActiveIndex={setActivePronounsIndex}
                    chartSize={chartSize}
                />

                <StatisticsCard
                    title="Hackathon Experience"
                    description="Previous hackathon participation"
                    data={experienceData}
                    activeIndex={activeExperienceIndex}
                    setActiveIndex={setActiveExperienceIndex}
                    chartSize={chartSize}
                />

                <StatisticsCard
                    title="Level of Study"
                    description="Distribution of academic levels"
                    data={levelStudyData}
                    activeIndex={activeLevelStudyIndex}
                    setActiveIndex={setActiveLevelStudyIndex}
                    chartSize={chartSize}
                />

                <StatisticsCard
                    title="School Demographics"
                    description="Participant distribution by institution"
                    data={schoolData}
                    activeIndex={activeSchoolIndex}
                    setActiveIndex={setActiveSchoolIndex}
                    chartSize={chartSize}
                />
            </div>
        </div>
    );
}
