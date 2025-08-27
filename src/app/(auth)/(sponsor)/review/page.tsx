'use client';

import { useState, useEffect } from 'react';
import { getColumns, User } from './columns';
import {
    ResponsiveDialog,
    ResponsiveDialogContent,
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

import testData from './testData';
import { Loader2 } from 'lucide-react';

export default function ResumeBankPage() {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pageSize, setPageSize] = useState<number>(20);
    const [pageIndex, setPageIndex] = useState<number>(0);

    // TODO: MAP TO RIGHT INDEXES FROM APP DATA
    useEffect(() => {
        const transformed = testData.map((item: any, index: number) => ({
            id: index + 1,
            firstName: item['1'],
            lastName: item['2'],
            school: item['3'],
            country: item['4'],
            github: item['5'],
            linkedin: item['6'],
            resumeUrl: item['7'],
        }));
        setData(transformed);
    }, []);

    // Table state
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const openDialog = (userId: number) => {
        setSelectedUserId(userId);
        setDialogOpen(true);
    };

    const navigateUser = (direction: 'prev' | 'next') => {
        if (selectedUserId === null) return;

        // get processed rows
        const processedRows = table.getPrePaginationRowModel().rows;
        const currentIndex = processedRows.findIndex(
            (row) => row.original.id === selectedUserId
        );

        if (currentIndex === -1) return;

        if (direction === 'prev' && currentIndex > 0) {
            const prevUser = processedRows[currentIndex - 1].original;
            setSelectedUserId(prevUser.id);
        } else if (
            direction === 'next' &&
            currentIndex < processedRows.length - 1
        ) {
            const nextUser = processedRows[currentIndex + 1].original;
            setSelectedUserId(nextUser.id);
        }
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

    // basic loading state, TODO: improve loading anim, add stormy/sparky img
    useEffect(() => {
        if (data.length > 0 && table.getRowModel().rows.length > 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [data, table]);

    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 text-white">
                <Loader2 className="text-brand-700 animate-spin text-4xl" />
                <span>Loading...</span>
            </div>
        );
    }

    // get currently open modal user
    const selectedUser = selectedUserId
        ? data.find((u) => u.id === selectedUserId)
        : null;

    return (
        <div className="w-full">
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
                                            className="relative px-4 py-4 text-sm"
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
                                            className="border-b border-neutral-600/30 bg-neutral-800 px-4 py-4 text-sm"
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
                            {[10, 20, 50, 100].map((size) => (
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
                    </ResponsiveDialogHeader>

                    {selectedUser && <PdfViewer url={selectedUser.resumeUrl} />}

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
        </div>
    );
}
