'use client';

import { useState, useEffect, useMemo } from 'react';
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
    getPaginationRowModel,
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
    const [pageSize, setPageSize] = useState<number>(20);
    const [pageIndex, setPageIndex] = useState<number>(0);

    // table states
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const {
        data: applications,
        isLoading,
        isError,
        error,
    } = trpc.applications.getApplications.useQuery({
        hackathonId,
    });

    // Transform the application data to match the expected format
    const data = useMemo(() => {
        if (!applications) return [];

        return applications.map((item: any) => {
            const {
                '1': firstName,
                '2': lastName,
                '4': email,
                '9': resumeUrls,
                '12': github,
                '13': linkedin,
                '16': school,
            } = item.response as Record<string, any>;

            return {
                id: item.userId,
                firstName: firstName || 'N/A',
                lastName: lastName || 'N/A',
                school: school || 'N/A',
                github: github || 'N/A',
                linkedin: linkedin || 'N/A',
                resumeUrl:
                    Array.isArray(resumeUrls) && resumeUrls.length > 0
                        ? resumeUrls[0]
                        : 'N/A',
                email: email || 'N/A',
            };
        });
    }, [applications]);

    const openDialog = (userId: number) => {
        setSelectedUserId(userId);
        setDialogOpen(true);
    };

    const navigateUser = (direction: 'prev' | 'next') => {
        if (selectedUserId === null) return;
        // fetch the filtered rows (across all pages)
        const allFilteredRows = table.getFilteredRowModel().rows;
        const currentIndex = allFilteredRows.findIndex(
            (row) => row.original.id === selectedUserId
        );

        if (currentIndex === -1) return;

        // get direction and increment/decrement from index
        let targetIndex = currentIndex;
        if (direction === 'prev' && currentIndex > 0) {
            targetIndex = currentIndex - 1;
        } else if (
            direction === 'next' &&
            currentIndex < allFilteredRows.length - 1
        ) {
            targetIndex = currentIndex + 1;
        } else {
            return;
        }

        const targetUser = allFilteredRows[targetIndex].original;

        // calculate page user is on to automatically swap pages when needed
        const targetPageIndex = Math.floor(targetIndex / pageSize);

        // swap page index to new page when needed
        if (targetPageIndex !== pageIndex) {
            setPageIndex(targetPageIndex);
            table.setPageIndex(targetPageIndex);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(
                    'resumeTablePageIndex',
                    String(targetPageIndex)
                );
            }
        }

        setSelectedUserId(targetUser.id);
    };

    const columns = getColumns((userId: number) => openDialog(userId));

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
            pagination: {
                pageSize,
                pageIndex,
            },
        },
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onPaginationChange: (updater) => {
            let newState;
            if (typeof updater === 'function') {
                newState = updater({ pageSize, pageIndex });
            } else {
                newState = updater;
            }
            if (newState.pageSize !== pageSize) {
                setPageSize(newState.pageSize);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(
                        'resumeTablePageSize',
                        String(newState.pageSize)
                    );
                }
            }
            if (newState.pageIndex !== pageIndex) {
                setPageIndex(newState.pageIndex);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(
                        'resumeTablePageIndex',
                        String(newState.pageIndex)
                    );
                }
            }
        },
    });

    // Only run after table and data are ready
    useEffect(() => {
        if (data.length === 0) return;
        const storedSize = localStorage.getItem('resumeTablePageSize');
        const storedIndex = localStorage.getItem('resumeTablePageIndex');
        if (storedSize) {
            const size = parseInt(storedSize);
            setPageSize(size);
            table.setPageSize(size);
        }
        if (storedIndex) {
            const idx = parseInt(storedIndex);
            setPageIndex(idx);
            table.setPageIndex(idx);
        }
    }, [table, data]);

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

    // get currently open modal user
    const selectedUser = selectedUserId
        ? data.find((u) => u.id === selectedUserId)
        : null;

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
            </div>

            {/* scrollable table body */}
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
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-neutral-900 px-4 py-4">
                <div className="text-sm text-white">
                    <span className="hidden md:inline-flex">Page</span>{' '}
                    {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex flex-row items-center gap-2">
                        <header className="text-white">
                            Rows
                            <span className="hidden md:inline-flex">
                                &nbsp;per page
                            </span>
                            :
                        </header>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                const newSize = parseInt(e.target.value);
                                setPageSize(newSize);
                                table.setPageSize(newSize);
                                if (typeof window !== 'undefined') {
                                    window.localStorage.setItem(
                                        'resumeTablePageSize',
                                        String(newSize)
                                    );
                                }
                                setPageIndex(0);
                                table.setPageIndex(0);
                                if (typeof window !== 'undefined') {
                                    window.localStorage.setItem(
                                        'resumeTablePageIndex',
                                        '0'
                                    );
                                }
                            }}
                            className="rounded-md bg-neutral-800/60 px-3 py-2 text-sm text-white"
                        >
                            {[20, 50, 100, 200].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setPageIndex(0);
                                table.setPageIndex(0);
                                if (typeof window !== 'undefined') {
                                    window.localStorage.setItem(
                                        'resumeTablePageIndex',
                                        '0'
                                    );
                                }
                            }}
                            disabled={!table.getCanPreviousPage()}
                            className="text-white disabled:opacity-50"
                        >
                            {'<<'}
                        </button>
                        <button
                            onClick={() => {
                                const prev = Math.max(pageIndex - 1, 0);
                                setPageIndex(prev);
                                table.setPageIndex(prev);
                                if (typeof window !== 'undefined') {
                                    window.localStorage.setItem(
                                        'resumeTablePageIndex',
                                        String(prev)
                                    );
                                }
                            }}
                            disabled={!table.getCanPreviousPage()}
                            className="text-white disabled:opacity-50"
                        >
                            {'<'}
                        </button>
                        <button
                            onClick={() => {
                                const next = Math.min(
                                    pageIndex + 1,
                                    table.getPageCount() - 1
                                );
                                setPageIndex(next);
                                table.setPageIndex(next);
                                if (typeof window !== 'undefined') {
                                    window.localStorage.setItem(
                                        'resumeTablePageIndex',
                                        String(next)
                                    );
                                }
                            }}
                            disabled={!table.getCanNextPage()}
                            className="text-white disabled:opacity-50"
                        >
                            {'>'}
                        </button>
                        <button
                            onClick={() => {
                                const last = table.getPageCount() - 1;
                                setPageIndex(last);
                                table.setPageIndex(last);
                                if (typeof window !== 'undefined') {
                                    window.localStorage.setItem(
                                        'resumeTablePageIndex',
                                        String(last)
                                    );
                                }
                            }}
                            disabled={!table.getCanNextPage()}
                            className="text-white disabled:opacity-50"
                        >
                            {'>>'}
                        </button>
                    </div>
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
                                    {' | '}
                                    <span>
                                        <Link
                                            href={selectedUser.linkedin}
                                            target="_blank"
                                            className="text-brand-400 hover:underline"
                                        >
                                            Linkedin
                                        </Link>
                                        {' | '}
                                        <Link
                                            className="text-brand-400 hover:underline"
                                            target="_blank"
                                            href={selectedUser.github}
                                        >
                                            Github
                                        </Link>
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
