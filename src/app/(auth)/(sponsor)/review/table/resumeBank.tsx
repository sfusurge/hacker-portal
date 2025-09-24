'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getColumns, User } from './columns';
import {
    ResponsiveDialog,
    ResponsiveDialogContent,
    ResponsiveDialogDescription,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { flexRender } from '@tanstack/react-table';
import PdfViewer from '@/components/ui/pdf-viewer';
import { Input } from '@/components/ui/input';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
} from '@tanstack/react-table';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/trpc/client';

interface ResumeTableProps {
    hackathonId: number;
}

export default function ResumeTable({ hackathonId }: ResumeTableProps) {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [sorting, setSorting] = useState<SortingState>([]);

    // Infinite query for applications
    const {
        data: applicationPages,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.applications.getApplications.useInfiniteQuery(
        {
            hackathonId,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextToken,
        }
    );

    const applications = useMemo(() => {
        return (
            applicationPages?.pages.flatMap((page: any) => page.applications) ??
            []
        );
    }, [applicationPages]);

    // transform the application data to match the expected format
    const data = useMemo(() => {
        if (!applications || !Array.isArray(applications)) return [];

        return applications
            .map((item: any) => {
                const {
                    '1': firstName,
                    '2': lastName,
                    '4': email,
                    '9': resumeUrls,
                    '12': github,
                    '13': linkedin,
                    '16': school,
                } = item.response as Record<string, any>;

                const resumeUrl =
                    Array.isArray(resumeUrls) && resumeUrls.length > 0
                        ? resumeUrls[0]
                        : null;

                return {
                    id: item.userId,
                    firstName: firstName || 'N/A',
                    lastName: lastName || 'N/A',
                    school: school || 'N/A',
                    github: github || 'N/A',
                    linkedin: linkedin || 'N/A',
                    resumeUrl,
                    email: email || 'N/A',
                };
            })
            .filter((user: User) => !!user.resumeUrl);
    }, [applications]);

    const openDialog = (userId: number) => {
        setSelectedUserId(userId);
        setDialogOpen(true);
    };

    const columns = getColumns((userId: number) => openDialog(userId));

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
    });

    // infinite scroll logic
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container || isFetchingNextPage || !hasNextPage) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            fetchNextPage();
        }
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    // get currently open modal user
    const selectedUser = selectedUserId
        ? data.find((u) => u.id === selectedUserId)
        : null;

    const navigateUser = (direction: 'prev' | 'next') => {
        const processedRows = table.getPrePaginationRowModel().rows;
        const currentIndex = processedRows.findIndex(
            (row) => row.original.id === selectedUserId
        );
        if (direction === 'prev' && currentIndex > 0) {
            setSelectedUserId(processedRows[currentIndex - 1].original.id);
        }
        if (direction === 'next' && currentIndex < processedRows.length - 1) {
            setSelectedUserId(processedRows[currentIndex + 1].original.id);
        }
    };

    // convert data to CSV
    function convertToCSV(arr: any[]) {
        if (!arr.length) return '';
        const header = Object.keys(arr[0]).filter((key) => key !== 'id');
        const csvRows = [
            header.join(','), // header row
            ...arr.map((row) =>
                header
                    .map((fieldName) => {
                        let val = row[fieldName];
                        if (typeof val === 'string') {
                            // escape quotes
                            val = val.replace(/"/g, '""');
                            // wrap in quotes if contains comma or newline
                            if (val.search(/("|,|\n)/g) >= 0) {
                                val = `"${val}"`;
                            }
                        }
                        return val;
                    })
                    .join(',')
            ),
        ];
        return csvRows.join('\n');
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 text-white">
                <Loader2 className="text-brand-700 animate-spin text-4xl" />
                <span>Loading applications...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 text-white">
                <span className="text-red-400">Error loading applications</span>
                <span className="text-sm text-white/60">{error?.message}</span>
            </div>
        );
    }

    return (
        <>
            {/* Search */}
            <div className="flex justify-center gap-3 py-4">
                <Input
                    type="text"
                    placeholder="Search users..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full border border-neutral-700/18 bg-neutral-800 text-white"
                />
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    className="whitespace-nowrap"
                    onClick={() => {
                        const csv = convertToCSV(data);
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'stormhacks-resume-bank.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                >
                    Export as CSV
                </Button>
            </div>

            {/* Infinite scrollable table body */}
            <div
                ref={scrollContainerRef}
                className="h-full max-h-[75dvh] w-full overflow-y-auto rounded-xl bg-neutral-900 p-1"
            >
                <div className="overflow-x-auto">
                    <table
                        className="w-full text-left"
                        style={{ tableLayout: 'fixed', width: '100%' }}
                    >
                        <thead className="bg-neutral-900 whitespace-nowrap text-gray-200">
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
                                            className={`relative px-4 py-4 text-sm ${
                                                header.column.columnDef.id ===
                                                'actions'
                                                    ? 'sticky right-0 z-20 border-l border-neutral-600/30 bg-neutral-900'
                                                    : ''
                                            }`}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                            {/* resizer handler */}
                                            {header.column.getCanResize() && (
                                                <div
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    className={`absolute top-0 right-0 bottom-0 w-2 cursor-col-resize ${
                                                        header.column.getIsResizing()
                                                            ? 'bg-gray-500'
                                                            : 'hover:bg-gray-600'
                                                    }`}
                                                    style={{ zIndex: 50 }}
                                                />
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-800">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            style={{
                                                width: cell.column.getSize(),
                                                minWidth:
                                                    cell.column.columnDef
                                                        .minSize,
                                            }}
                                            className={`border-b border-neutral-600/30 bg-neutral-800 px-4 py-4 text-sm ${
                                                cell.column.columnDef.id ===
                                                'actions'
                                                    ? 'sticky right-0 z-20 border-l border-neutral-600/30 bg-neutral-800'
                                                    : ''
                                            }`}
                                        >
                                            <div
                                                className="truncate"
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {isFetchingNextPage && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="text-brand-700 animate-spin" />
                        </div>
                    )}
                    {!hasNextPage && (
                        <div className="flex justify-center py-4 text-xs text-white/60">
                            End of applications
                        </div>
                    )}
                </div>
            </div>

            <ResponsiveDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <ResponsiveDialogContent
                    className="w-full sm:max-w-4xl"
                    overlayZIndex={100}
                >
                    <ResponsiveDialogHeader>
                        <ResponsiveDialogTitle>
                            {selectedUser
                                ? `${selectedUser.firstName} ${selectedUser.lastName}'s Resume`
                                : ''}
                        </ResponsiveDialogTitle>
                        <ResponsiveDialogDescription>
                            {selectedUser ? (
                                <>
                                    {selectedUser.school}
                                    {(selectedUser.linkedin !== 'N/A' ||
                                        selectedUser.github !== 'N/A') &&
                                        ' | '}
                                    <span>
                                        {selectedUser.linkedin !== 'N/A' && (
                                            <>
                                                <Link
                                                    href={selectedUser.linkedin}
                                                    target="_blank"
                                                    className="text-brand-400 hover:underline"
                                                >
                                                    Linkedin
                                                </Link>
                                                {selectedUser.github !==
                                                    'N/A' && ' | '}
                                            </>
                                        )}
                                        {selectedUser.github !== 'N/A' && (
                                            <Link
                                                className="text-brand-400 hover:underline"
                                                target="_blank"
                                                href={selectedUser.github}
                                            >
                                                Github
                                            </Link>
                                        )}
                                    </span>
                                </>
                            ) : (
                                ''
                            )}
                        </ResponsiveDialogDescription>
                    </ResponsiveDialogHeader>

                    {selectedUser && (
                        <div className="flex w-full flex-col gap-3">
                            <PdfViewer url={selectedUser.resumeUrl} />
                            <div className="flex w-full justify-end">
                                <Link
                                    href={selectedUser?.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-white/60 hover:underline"
                                >
                                    Open Resume in New Tab
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="mb-4 flex items-center justify-between">
                        <Button
                            variant="default"
                            hierarchy={'primary'}
                            size="compact"
                            disabled={
                                selectedUserId === null ||
                                (() => {
                                    const processedRows =
                                        table.getPrePaginationRowModel().rows;
                                    const currentIndex =
                                        processedRows.findIndex(
                                            (row) =>
                                                row.original.id ===
                                                selectedUserId
                                        );
                                    return currentIndex <= 0;
                                })()
                            }
                            onClick={() => navigateUser('prev')}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-white/60">
                            {selectedUserId !== null
                                ? (() => {
                                      const processedRows =
                                          table.getPrePaginationRowModel().rows;
                                      const currentIndex =
                                          processedRows.findIndex(
                                              (row) =>
                                                  row.original.id ===
                                                  selectedUserId
                                          );
                                      return `${currentIndex + 1} of ${processedRows.length}`;
                                  })()
                                : ''}
                        </span>
                        <Button
                            variant="default"
                            hierarchy={'primary'}
                            size="compact"
                            disabled={
                                selectedUserId === null ||
                                (() => {
                                    const processedRows =
                                        table.getPrePaginationRowModel().rows;
                                    const currentIndex =
                                        processedRows.findIndex(
                                            (row) =>
                                                row.original.id ===
                                                selectedUserId
                                        );
                                    return (
                                        currentIndex >= processedRows.length - 1
                                    );
                                })()
                            }
                            onClick={() => navigateUser('next')}
                        >
                            Next
                        </Button>
                    </div>
                </ResponsiveDialogContent>
            </ResponsiveDialog>
        </>
    );
}
