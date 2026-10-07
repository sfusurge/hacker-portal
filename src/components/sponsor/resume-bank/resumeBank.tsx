'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { getColumns } from './columns';
import { User } from './types';
import CandidatePanel from './CandidatePanel';
import Pagination from './Pagination';
import GridItem from './GridItem';
import { Button } from '@/components/ui/button';
import { flexRender } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
    PaginationState,
} from '@tanstack/react-table';
import { trpc } from '@/trpc/client';
import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/solid';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import {
    assignSponsorSchoolLabels,
    mapSponsorResumeBankRow,
    OTHER_SCHOOL_LABEL,
    SECONDARY_SCHOOL_LABEL,
} from '@/lib/applications/sponsorResumeBank';
import type { InputFormPageData } from '@/components/application_components/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface ResumeTableProps {
    hackathonId: number;
    publicAccess?: boolean;
    hackathonName?: string;
    initialApplicationQuestions?: InputFormPageData[];
}

function isHttpUrl(value: string) {
    return Boolean(value) && value !== 'N/A' && value.startsWith('http');
}

function convertToCSV(arr: Record<string, unknown>[]) {
    if (!arr.length) return '';
    const header = Object.keys(arr[0]);
    const csvRows = [
        header.join(','),
        ...arr.map((row) =>
            header
                .map((fieldName) => {
                    const raw = row[fieldName];
                    if (typeof raw !== 'string') {
                        return raw == null ? '' : String(raw);
                    }
                    let val = raw.replace(/"/g, '""');
                    if (/[",\n]/.test(val)) {
                        val = `"${val}"`;
                    }
                    return val;
                })
                .join(',')
        ),
    ];
    return csvRows.join('\n');
}

function ResumeBankSkeleton() {
    return (
        <div className="flex flex-col">
            <div className="mb-5 flex flex-col gap-1">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="mt-1 h-4 w-64 sm:w-80" />
            </div>

            <div className="sticky -top-10 z-20 pb-4">
                <div
                    aria-hidden
                    className="md:bg-neutral-925 pointer-events-none absolute inset-x-0 -top-10 h-10 bg-neutral-950"
                />
                <div className="relative rounded-xl border border-neutral-600/40 bg-neutral-900 p-3 shadow-md backdrop-blur-md sm:p-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Skeleton className="h-10 min-w-[12rem] flex-1 basis-[14rem] sm:max-w-sm" />
                        <Skeleton className="h-10 w-full min-w-[10rem] basis-[12rem] sm:w-[200px] sm:flex-none" />
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-28" />
                        <div className="flex gap-2 sm:ml-auto">
                            <Skeleton className="h-9 w-9" />
                            <Skeleton className="h-9 w-28" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full rounded-xl border border-neutral-600/30 bg-neutral-900 p-4">
                <div className="@container">
                    <div className="grid grid-cols-1 gap-4 @[450px]:grid-cols-2 @[700px]:grid-cols-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-neutral-850 flex flex-col gap-3 rounded-xl border border-neutral-600/30 p-3"
                            >
                                <Skeleton className="h-44 w-full rounded-lg @[450px]:h-48 @[650px]:h-52" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <div className="flex gap-1.5 pt-1">
                                        <Skeleton className="h-5 w-14" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-9 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResumeTable({
    hackathonId,
    publicAccess = false,
    hackathonName,
    initialApplicationQuestions,
}: ResumeTableProps) {
    const hackathon = useAtomValue(hackathonAtom);
    const isPublicAccess = publicAccess;

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [schoolFilter, setSchoolFilter] = useState<string>('all');
    const [requireGithub, setRequireGithub] = useState(false);
    const [requireLinkedin, setRequireLinkedin] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 24,
        pageIndex: 0,
    });
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    useEffect(() => {
        setPagination({
            pageSize: parseInt(localStorage.getItem('pagesize') ?? '24', 10),
            pageIndex: parseInt(localStorage.getItem('pageindex') ?? '0', 10),
        });
    }, []);

    const publicQuery = trpc.applications.getPublicResumeBank.useInfiniteQuery(
        {
            hackathonId,
            maxResult: 500,
        },
        {
            enabled: isPublicAccess,
            getNextPageParam: (lastPage) => lastPage.nextToken,
        }
    );

    const authQuery = trpc.applications.getApplications.useInfiniteQuery(
        {
            hackathonId,
            maxResult: 500,
        },
        {
            enabled: !isPublicAccess,
            getNextPageParam: (lastPage) => lastPage.nextToken,
        }
    );

    const {
        data: applicationPages,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = isPublicAccess ? publicQuery : authQuery;

    const applicationQuestions = useMemo((): InputFormPageData[] => {
        if (initialApplicationQuestions?.length) {
            return initialApplicationQuestions;
        }
        if (isPublicAccess) {
            const fromPublic =
                publicQuery.data?.pages?.[0]?.applicationQuestions;
            if (fromPublic?.length) {
                return fromPublic as InputFormPageData[];
            }
        }
        return (hackathon?.applicationQuestionPages ??
            []) as InputFormPageData[];
    }, [
        initialApplicationQuestions,
        isPublicAccess,
        publicQuery.data,
        hackathon?.applicationQuestionPages,
    ]);

    const displayHackathonName =
        hackathonName ??
        publicQuery.data?.pages?.[0]?.hackathonName ??
        hackathon?.name ??
        'Active hackathon';

    const applications = useMemo(() => {
        return (
            applicationPages?.pages.flatMap((page: any) => page.applications) ??
            []
        );
    }, [applicationPages]);

    const data = useMemo((): User[] => {
        if (!applications || !Array.isArray(applications)) return [];
        const mappedRows = applications
            .map((item: any) => {
                const mapped = mapSponsorResumeBankRow(
                    (item.response ?? {}) as Record<string, unknown>,
                    applicationQuestions
                );
                if (!mapped.resumeUrl) return null;
                if (
                    item.currentStatus !== 'Accepted' &&
                    item.currentStatus !== 'Accepted - RSVP to Confirm'
                ) {
                    return null;
                }

                return {
                    id: item.userId as number,
                    firstName: mapped.firstName,
                    lastName: mapped.lastName,
                    school: mapped.school,
                    education: mapped.education,
                    github: mapped.github,
                    linkedin: mapped.linkedin,
                    resumeUrl: mapped.resumeUrl,
                    email: mapped.email,
                    currentStatus: item.currentStatus as string,
                };
            })
            .filter((row): row is NonNullable<typeof row> => row != null);

        return assignSponsorSchoolLabels(mappedRows).map((row) => ({
            ...row,
            schoolLabel: row.schoolLabel,
        }));
    }, [applications, applicationQuestions]);

    const schools = useMemo(() => {
        const set = new Set(data.map((u) => u.schoolLabel));
        const labels = Array.from(set);
        labels.sort((a, b) => {
            const rank = (label: string) => {
                if (label === SECONDARY_SCHOOL_LABEL) return 0;
                if (label === OTHER_SCHOOL_LABEL) return 2;
                return 1;
            };
            const ra = rank(a);
            const rb = rank(b);
            if (ra !== rb) return ra - rb;
            return a.localeCompare(b);
        });
        return labels;
    }, [data]);

    const filteredData = useMemo(() => {
        const q = globalFilter.trim().toLowerCase();
        return data.filter((user) => {
            if (schoolFilter !== 'all' && user.schoolLabel !== schoolFilter) {
                return false;
            }
            if (requireGithub && !isHttpUrl(user.github)) return false;
            if (requireLinkedin && !isHttpUrl(user.linkedin)) return false;
            if (!q) return true;
            const haystack = [
                user.firstName,
                user.lastName,
                user.email,
                user.school,
                user.schoolLabel,
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [data, globalFilter, schoolFilter, requireGithub, requireLinkedin]);

    const openPanel = (userId: number) => {
        setSelectedUserId(userId);
        setPanelOpen(true);
    };

    const columns = getColumns(openPanel);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            pagination,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
    });

    useEffect(() => {
        localStorage.setItem('pagesize', `${pagination.pageSize}`);
    }, [pagination.pageSize]);

    useEffect(() => {
        localStorage.setItem('pageindex', `${pagination.pageIndex}`);
    }, [pagination.pageIndex]);

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [globalFilter, schoolFilter, requireGithub, requireLinkedin, viewMode]);

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage || isLoading) return;
        if (data.length === 0 && !hasNextPage) return;
        const timeoutId = setTimeout(() => {
            fetchNextPage();
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [
        data.length,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        fetchNextPage,
    ]);

    const selectedUser: User | null = selectedUserId
        ? (filteredData.find((u) => u.id === selectedUserId) ?? null)
        : null;

    const processedRows = table.getPrePaginationRowModel().rows;

    const navigateUser = (direction: 'prev' | 'next') => {
        const currentIndex = processedRows.findIndex(
            (row) => row.original.id === selectedUserId
        );
        if (direction === 'prev' && currentIndex > 0) {
            setSelectedUserId(processedRows[currentIndex - 1].original.id);
            const newUserIndex = currentIndex - 1;
            const currentPageStart = pagination.pageIndex * pagination.pageSize;
            if (newUserIndex < currentPageStart && table.getCanPreviousPage()) {
                table.previousPage();
            }
        }
        if (direction === 'next' && currentIndex < processedRows.length - 1) {
            setSelectedUserId(processedRows[currentIndex + 1].original.id);
            const newUserIndex = currentIndex + 1;
            const currentPageEnd =
                (pagination.pageIndex + 1) * pagination.pageSize;
            if (newUserIndex >= currentPageEnd && table.getCanNextPage()) {
                table.nextPage();
            }
        }
    };

    const exportFilteredCsv = () => {
        const rows = filteredData.map((u) => ({
            name: `${u.firstName} ${u.lastName}`.trim(),
            email: u.email,
            school: u.schoolLabel,
            schoolRaw: u.school,
            github: u.github,
            linkedin: u.linkedin,
            resumeUrl: u.resumeUrl,
        }));
        const csv = convertToCSV(rows);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${displayHackathonName
            .toLowerCase()
            .replace(/\s+/g, '-')}-resume-bank.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return <ResumeBankSkeleton />;
    }

    if (isError) {
        return (
            <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-2 text-white">
                <span className="text-danger-400">
                    Error loading applications
                </span>
                <span className="text-sm text-white/60">{error?.message}</span>
            </div>
        );
    }

    const currentIndex =
        selectedUserId != null
            ? processedRows.findIndex(
                  (row) => row.original.id === selectedUserId
              )
            : -1;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Resume Bank
                    </h1>
                    <p className="mt-1 mb-10 text-sm text-white/60">
                        {displayHackathonName} · {filteredData.length} of{' '}
                        {data.length} candidates
                        {isFetchingNextPage ? ' · loading more…' : ''}
                    </p>
                </div>
            </div>

            <div className="sticky -top-10 z-20 pb-4">
                <div
                    aria-hidden
                    className="md:bg-neutral-925 pointer-events-none absolute inset-x-0 -top-10 h-10 bg-neutral-950"
                />
                <div className="relative rounded-xl border border-neutral-600/40 bg-neutral-900 p-3 shadow-md backdrop-blur-md sm:p-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Input
                            type="search"
                            placeholder="Search name, email, school…"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="min-w-[12rem] flex-1 basis-[14rem] border border-neutral-700/40 bg-neutral-800 text-white sm:max-w-sm"
                        />
                        <Select
                            value={schoolFilter}
                            onValueChange={setSchoolFilter}
                        >
                            <SelectTrigger className="w-full min-w-[10rem] basis-[12rem] sm:w-[200px] sm:flex-none">
                                <SelectValue placeholder="All schools" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All schools</SelectItem>
                                {schools.map((school) => (
                                    <SelectItem key={school} value={school}>
                                        {school}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                aria-pressed={requireGithub}
                                onClick={() => setRequireGithub((v) => !v)}
                                className={`rounded-md border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                                    requireGithub
                                        ? 'border-brand-400/60 bg-brand-600 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                                        : 'hover:bg-neutral-750 border-transparent bg-neutral-800 text-white/60 hover:text-white/80'
                                }`}
                            >
                                Has GitHub
                            </button>
                            <button
                                type="button"
                                aria-pressed={requireLinkedin}
                                onClick={() => setRequireLinkedin((v) => !v)}
                                className={`rounded-md border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                                    requireLinkedin
                                        ? 'border-brand-400/60 bg-brand-600 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                                        : 'hover:bg-neutral-750 border-transparent bg-neutral-800 text-white/60 hover:text-white/80'
                                }`}
                            >
                                Has LinkedIn
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                            <p className="mr-1 text-sm whitespace-nowrap text-white/55">
                                {filteredData.length}{' '}
                                {filteredData.length === 1
                                    ? 'resume'
                                    : 'resumes'}
                            </p>
                            <div className="flex overflow-hidden rounded-md border border-neutral-600/50">
                                <button
                                    type="button"
                                    title="Grid view"
                                    aria-label="Grid view"
                                    aria-pressed={viewMode === 'grid'}
                                    onClick={() => {
                                        setViewMode('grid');
                                        if (pagination.pageSize > 24) {
                                            table.setPageSize(24);
                                        }
                                    }}
                                    className={`flex h-9 w-9 items-center justify-center transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-neutral-700 text-white'
                                            : 'bg-neutral-800 text-white/50 hover:text-white/80'
                                    }`}
                                >
                                    <Squares2X2Icon className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    title="List view"
                                    aria-label="List view"
                                    aria-pressed={viewMode === 'list'}
                                    onClick={() => {
                                        setViewMode('list');
                                        if (pagination.pageSize <= 24) {
                                            table.setPageSize(50);
                                        }
                                    }}
                                    className={`flex h-9 w-9 items-center justify-center border-l border-neutral-600/50 transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-neutral-700 text-white'
                                            : 'bg-neutral-800 text-white/50 hover:text-white/80'
                                    }`}
                                >
                                    <ListBulletIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <Button
                                variant="brand"
                                hierarchy="primary"
                                size="compact"
                                onClick={exportFilteredCsv}
                                disabled={filteredData.length === 0}
                            >
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-600/40 bg-neutral-900 px-6 py-16 text-center">
                    <p className="text-lg font-medium text-white">
                        No candidates match
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                        Try clearing search or link filters.
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="w-full overflow-hidden rounded-xl border border-neutral-600/30 bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table
                            className="w-full text-left"
                            style={{ tableLayout: 'fixed', width: '100%' }}
                        >
                            <thead className="bg-neutral-900 text-gray-200">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{
                                                    width: header.getSize(),
                                                    minWidth:
                                                        header.column.columnDef
                                                            .minSize,
                                                }}
                                                className={`relative px-4 py-3 text-sm ${
                                                    header.column.columnDef
                                                        .id === 'actions'
                                                        ? 'sticky right-0 z-10 border-l border-neutral-600/30 bg-neutral-900'
                                                        : ''
                                                }`}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={`border-b border-neutral-600/20 ${
                                            row.original.id === selectedUserId
                                                ? 'bg-brand-950/30'
                                                : 'hover:bg-neutral-800/80'
                                        }`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                style={{
                                                    width: cell.column.getSize(),
                                                    minWidth:
                                                        cell.column.columnDef
                                                            .minSize,
                                                }}
                                                className={`bg-inherit px-4 py-3 text-sm text-white/85 ${
                                                    cell.column.columnDef.id ===
                                                    'actions'
                                                        ? 'sticky right-0 z-10 border-l border-neutral-600/30'
                                                        : ''
                                                }`}
                                            >
                                                <div className="truncate">
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext()
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPageIndex={table.getState().pagination.pageIndex}
                        pageSize={table.getState().pagination.pageSize}
                        totalRows={processedRows.length}
                        totalPages={table.getPageCount()}
                        canPreviousPage={table.getCanPreviousPage()}
                        canNextPage={table.getCanNextPage()}
                        onPageSizeChange={table.setPageSize}
                        onPageIndexChange={table.setPageIndex}
                        onPreviousPage={table.previousPage}
                        onNextPage={table.nextPage}
                        onFirstPage={() => table.setPageIndex(0)}
                        onLastPage={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        pageSizeOptions={[10, 20, 30, 40, 50, 100, 150, 200]}
                        isGrid={false}
                    />
                </div>
            ) : (
                <div className="w-full rounded-xl border border-neutral-600/30 bg-neutral-900 p-4">
                    <div className="@container">
                        <div className="grid grid-cols-1 gap-4 @[450px]:grid-cols-2 @[700px]:grid-cols-3">
                            {table.getRowModel().rows.map((row) => (
                                <GridItem
                                    key={row.original.id}
                                    user={row.original}
                                    selected={
                                        row.original.id === selectedUserId
                                    }
                                    onViewResume={openPanel}
                                />
                            ))}
                        </div>
                    </div>
                    <Pagination
                        currentPageIndex={table.getState().pagination.pageIndex}
                        pageSize={table.getState().pagination.pageSize}
                        totalRows={processedRows.length}
                        totalPages={table.getPageCount()}
                        canPreviousPage={table.getCanPreviousPage()}
                        canNextPage={table.getCanNextPage()}
                        onPageSizeChange={table.setPageSize}
                        onPageIndexChange={table.setPageIndex}
                        onPreviousPage={table.previousPage}
                        onNextPage={table.nextPage}
                        onFirstPage={() => table.setPageIndex(0)}
                        onLastPage={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        pageSizeOptions={[12, 24]}
                        isGrid={true}
                    />
                </div>
            )}

            {panelOpen && (
                <CandidatePanel
                    selectedUser={selectedUser}
                    onClose={() => setPanelOpen(false)}
                    onNavigateUser={navigateUser}
                    canNavigatePrev={currentIndex > 0}
                    canNavigateNext={
                        currentIndex >= 0 &&
                        currentIndex < processedRows.length - 1
                    }
                    currentIndex={Math.max(currentIndex, 0)}
                    totalRows={processedRows.length}
                />
            )}
        </div>
    );
}
