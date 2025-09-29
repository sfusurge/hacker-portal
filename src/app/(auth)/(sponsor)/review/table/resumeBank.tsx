'use client';

import { useState, useEffect, useMemo } from 'react';
import { getColumns } from './columns';
import { User } from './types';
import ResumeDialog from './ResumeDialog';
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

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/solid';

interface ResumeTableProps {
    hackathonId: number;
}

export default function ResumeTable({ hackathonId }: ResumeTableProps) {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: parseInt(localStorage.getItem('pagesize') ?? '24'),
        pageIndex: parseInt(localStorage.getItem('pageindex') ?? '0'),
    });
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

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
            maxResult: 500,
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
    const data = useMemo((): User[] => {
        if (!applications || !Array.isArray(applications)) return [];
        return applications
            .map((item: any): User => {
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
                    currentStatus: item.currentStatus,
                };
            })
            .filter((user: User) => !!user.resumeUrl)
            .filter((user: User) => {
                return (
                    user.currentStatus === 'Accepted' ||
                    user.currentStatus === 'Accepted - RSVP to Confirm'
                );
            });
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
            pagination,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onGlobalFilterChange: setGlobalFilter,
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
        if (!hasNextPage || isFetchingNextPage || isLoading) return;

        const hasAcceptedApplicants = data.length > 0;

        if (hasAcceptedApplicants && hasNextPage) {
            // small delay
            const timeoutId = setTimeout(() => {
                fetchNextPage();
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [
        data.length,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        fetchNextPage,
    ]);

    // get currently open modal user
    const selectedUser: User | null = selectedUserId
        ? data.find((u) => u.id === selectedUserId) || null
        : null;

    const navigateUser = (direction: 'prev' | 'next') => {
        const processedRows = table.getPrePaginationRowModel().rows;
        const currentIndex = processedRows.findIndex(
            (row) => row.original.id === selectedUserId
        );

        if (direction === 'prev') {
            if (currentIndex > 0) {
                // move to previous item in the overall data
                setSelectedUserId(processedRows[currentIndex - 1].original.id);

                // check if we need to change pages
                const newUserIndex = currentIndex - 1;
                const currentPageStart =
                    pagination.pageIndex * pagination.pageSize;
                if (
                    newUserIndex < currentPageStart &&
                    table.getCanPreviousPage()
                ) {
                    table.previousPage();
                }
            }
        }

        if (direction === 'next') {
            if (currentIndex < processedRows.length - 1) {
                // move to next item in the overall data
                setSelectedUserId(processedRows[currentIndex + 1].original.id);

                // check if we need to change pages
                const newUserIndex = currentIndex + 1;
                const currentPageEnd =
                    (pagination.pageIndex + 1) * pagination.pageSize;
                if (newUserIndex >= currentPageEnd && table.getCanNextPage()) {
                    table.nextPage();
                }
            }
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
            <div className="flex flex-col gap-2">
                <div className="flex justify-center gap-3 py-4">
                    <Input
                        type="text"
                        placeholder="Search applicants..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full border border-neutral-700/18 bg-neutral-800 text-white"
                    />
                    <Button
                        variant={'default'}
                        hierarchy="primary"
                        size="cozy"
                        className="whitespace-nowrap"
                        onClick={() => {
                            const newViewMode =
                                viewMode === 'list' ? 'grid' : 'list';
                            setViewMode(newViewMode);

                            if (newViewMode === 'grid') {
                                // switch to grid view - use 12 or 24 max
                                const currentPageSize = pagination.pageSize;
                                if (currentPageSize > 24) {
                                    table.setPageSize(24);
                                } else if (currentPageSize > 12) {
                                    table.setPageSize(12);
                                }
                            } else {
                                // switch to list view
                                if (pagination.pageSize <= 24) {
                                    table.setPageSize(50);
                                }
                            }
                        }}
                    >
                        {viewMode === 'list' ? (
                            <ListBulletIcon className="h-4 w-4" />
                        ) : (
                            <Squares2X2Icon className="h-4 w-4" />
                        )}
                    </Button>
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
            </div>

            {viewMode === 'list' ? (
                <div className="w-full rounded-xl bg-neutral-900 p-1">
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
                                                    header.column.columnDef
                                                        .id === 'actions'
                                                        ? 'sticky right-0 z-20 border-l border-neutral-600/30 bg-neutral-900'
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
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-800"
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
                                                        textOverflow:
                                                            'ellipsis',
                                                    }}
                                                >
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
                        totalRows={table.getPreFilteredRowModel().rows.length}
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
                // grid view
                <div className="w-full rounded-xl bg-neutral-900 p-4">
                    <div className="@container">
                        <div className="grid grid-cols-1 gap-4 @[450px]:grid-cols-2 @[650px]:grid-cols-3 @[925px]:grid-cols-4">
                            {table.getRowModel().rows.map((row) => (
                                <GridItem
                                    key={row.original.id}
                                    user={row.original}
                                    onViewResume={openDialog}
                                />
                            ))}
                        </div>
                    </div>

                    <Pagination
                        currentPageIndex={table.getState().pagination.pageIndex}
                        pageSize={table.getState().pagination.pageSize}
                        totalRows={table.getPreFilteredRowModel().rows.length}
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

            <ResumeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                selectedUser={selectedUser}
                onNavigateUser={navigateUser}
                canNavigatePrev={
                    selectedUserId !== null &&
                    (() => {
                        const processedRows =
                            table.getPrePaginationRowModel().rows;
                        const currentIndex = processedRows.findIndex(
                            (row) => row.original.id === selectedUserId
                        );
                        return currentIndex > 0;
                    })()
                }
                canNavigateNext={
                    selectedUserId !== null &&
                    (() => {
                        const processedRows =
                            table.getPrePaginationRowModel().rows;
                        const currentIndex = processedRows.findIndex(
                            (row) => row.original.id === selectedUserId
                        );
                        return currentIndex < processedRows.length - 1;
                    })()
                }
                currentIndex={
                    selectedUserId !== null
                        ? (() => {
                              const processedRows =
                                  table.getPrePaginationRowModel().rows;
                              return processedRows.findIndex(
                                  (row) => row.original.id === selectedUserId
                              );
                          })()
                        : 0
                }
                totalRows={table.getPrePaginationRowModel().rows.length}
            />
        </>
    );
}
