'use client';

import { useEffect, useMemo, useRef, useState, type HTMLProps } from 'react';
import {
    Column,
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    RowSelectionState,
    useReactTable,
} from '@tanstack/react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input/input';
import inputStyle from '@/components/ui/input/input.module.css';
import { cn } from '@/lib/utils';
import { CheckBox } from '@/components/ui/checkbox/checkbox';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { InputFormPageData } from '@/components/application_components/types';
import {
    filterSubmissionsByLocation,
    getSubmissionExportField,
    getSubmissionLocationFilterOptions,
    submissionToCsvRecord,
    type SubmissionExportRow,
    type SubmissionLocationFilterKey,
} from '@/lib/admin/submissionExport';
import {
    collectPdfPosterExports,
    downloadPdfPostersZip,
    resolvePdfPosterQuestionId,
} from '@/lib/admin/posterExport';
import {
    buildAllSubmissionTableColumns,
    buildSubmissionCsvColumnHeaders,
    buildSubmissionReviewTableColumns,
    resolveSubmissionReviewTableLocationQuestionId,
} from '@/lib/projects/buildSubmissionReviewTableColumns';

export type SubmissionTableRow = SubmissionExportRow;

type SubmissionsExportTableProps = {
    rows: SubmissionTableRow[];
    submissionQuestionPages: InputFormPageData[];
    hackathonName?: string;
};

const csvConfig = mkConfig({
    fieldSeparator: ',',
    filename: 'project-submissions',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

const SELECT_COLUMN_SIZE = 64;
const QUESTION_COLUMN_SIZE = 156;
const QUESTION_COLUMN_MIN = 96;
const QUESTION_COLUMN_MAX = 360;

function WrappingHeader({ label }: { label: string }) {
    return (
        <span className="block text-xs leading-snug font-medium break-words text-neutral-300">
            {label}
        </span>
    );
}

function isSelectColumn(column: Column<SubmissionTableRow, unknown>) {
    return column.id === 'select';
}

function columnSizeStyle(column: Column<SubmissionTableRow, unknown>) {
    if (isSelectColumn(column)) {
        return {
            width: SELECT_COLUMN_SIZE,
            minWidth: SELECT_COLUMN_SIZE,
            maxWidth: SELECT_COLUMN_SIZE,
        };
    }

    return {
        width: column.getSize(),
        minWidth: column.columnDef.minSize,
        maxWidth: column.columnDef.maxSize,
    };
}

function IndeterminateCheckbox({
    indeterminate,
    className,
    ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate =
                (!rest.checked && indeterminate) || false;
        }
    }, [indeterminate, rest.checked]);

    return (
        <CheckBox
            ref={ref}
            className={cn(
                'max-w-none !border-0 !bg-transparent !p-0',
                className
            )}
            onClick={(e) => e.stopPropagation()}
            {...rest}
        />
    );
}

export default function SubmissionsExportTable({
    rows,
    submissionQuestionPages,
    hackathonName,
}: SubmissionsExportTableProps) {
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [locationFilter, setLocationFilter] =
        useState<SubmissionLocationFilterKey>('all');
    const [isExportingPosters, setIsExportingPosters] = useState(false);
    const [showAllColumns, setShowAllColumns] = useState(false);

    const reviewTableColumns = useMemo(
        () => buildSubmissionReviewTableColumns(submissionQuestionPages),
        [submissionQuestionPages]
    );

    const allTableColumns = useMemo(
        () => buildAllSubmissionTableColumns(submissionQuestionPages),
        [submissionQuestionPages]
    );

    const questionTableColumns = showAllColumns
        ? allTableColumns
        : reviewTableColumns;

    const csvExportOptions = useMemo(
        () => ({ includeAllQuestions: showAllColumns }),
        [showAllColumns]
    );

    const csvColumnHeaders = useMemo(
        () =>
            buildSubmissionCsvColumnHeaders(
                submissionQuestionPages,
                csvExportOptions
            ),
        [submissionQuestionPages, csvExportOptions]
    );

    const locationQuestionId = useMemo(
        () =>
            resolveSubmissionReviewTableLocationQuestionId(
                submissionQuestionPages
            ),
        [submissionQuestionPages]
    );

    const locationOptions = useMemo(
        () => getSubmissionLocationFilterOptions(submissionQuestionPages),
        [submissionQuestionPages]
    );

    const filteredRows = useMemo(
        () =>
            filterSubmissionsByLocation(
                rows,
                locationQuestionId,
                locationFilter
            ),
        [rows, locationQuestionId, locationFilter]
    );

    useEffect(() => {
        setRowSelection({});
    }, [locationFilter]);

    const columns = useMemo<ColumnDef<SubmissionTableRow>[]>(
        () => [
            {
                id: 'select',
                size: SELECT_COLUMN_SIZE,
                minSize: SELECT_COLUMN_SIZE,
                maxSize: SELECT_COLUMN_SIZE,
                enableResizing: false,
                header: ({ table }) => (
                    <IndeterminateCheckbox
                        checked={table.getIsAllPageRowsSelected()}
                        indeterminate={table.getIsSomePageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <IndeterminateCheckbox
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'teamId',
                size: 88,
                minSize: 72,
                maxSize: 120,
                header: () => <WrappingHeader label="Team ID" />,
            },
            {
                accessorKey: 'teamName',
                size: 160,
                minSize: 120,
                maxSize: 280,
                header: () => <WrappingHeader label="Team Name" />,
            },
            ...questionTableColumns.map((col) => ({
                id: col.id,
                size: QUESTION_COLUMN_SIZE,
                minSize: QUESTION_COLUMN_MIN,
                maxSize: QUESTION_COLUMN_MAX,
                header: () => <WrappingHeader label={col.header} />,
                accessorFn: (row: SubmissionTableRow) =>
                    getSubmissionExportField(row.response, col.questionId),
                cell: ({ getValue }: { getValue: () => unknown }) => {
                    const text = String(getValue() ?? '');
                    return (
                        <span
                            className="block text-sm leading-snug break-words text-white/90"
                            title={text || undefined}
                        >
                            {text}
                        </span>
                    );
                },
            })),
        ],
        [questionTableColumns]
    );

    const table = useReactTable({
        data: filteredRows,
        columns,
        state: { globalFilter, rowSelection },
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        defaultColumn: {
            size: QUESTION_COLUMN_SIZE,
            minSize: QUESTION_COLUMN_MIN,
            maxSize: QUESTION_COLUMN_MAX,
        },
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: true,
        getRowId: (row) => String(row.teamId),
    });

    function exportRows(
        rowsToExport: SubmissionTableRow[],
        filenameSuffix: string
    ) {
        if (rowsToExport.length === 0) {
            alert('No rows to export.');
            return;
        }

        const csvData = rowsToExport.map((row) =>
            submissionToCsvRecord(
                row,
                submissionQuestionPages,
                csvExportOptions
            )
        );

        const locationSlug =
            locationFilter === 'all' ? '' : `-${locationFilter}`;

        const config = mkConfig({
            ...csvConfig,
            useKeysAsHeaders: false,
            columnHeaders: csvColumnHeaders,
            filename: hackathonName
                ? `${hackathonName.replace(/\s+/g, '-').toLowerCase()}-submissions${locationSlug}-${filenameSuffix}`
                : `project-submissions${locationSlug}-${filenameSuffix}`,
        });

        const csv = generateCsv(config)(csvData);
        download(config)(csv);
    }

    const selectedCount = table.getSelectedRowModel().rows.length;

    const pdfPosterQuestionId = useMemo(
        () => resolvePdfPosterQuestionId(submissionQuestionPages),
        [submissionQuestionPages]
    );

    async function exportPdfPosters(
        rowsToExport: SubmissionTableRow[],
        filenameSuffix: string
    ) {
        if (rowsToExport.length === 0) {
            alert('No rows to export.');
            return;
        }

        if (pdfPosterQuestionId == null) {
            alert(
                'No PDF poster question found. Add displayRole "pdfPoster" to the poster file-upload question.'
            );
            return;
        }

        const entries = collectPdfPosterExports(
            rowsToExport,
            submissionQuestionPages,
            pdfPosterQuestionId
        );

        if (entries.length === 0) {
            alert('No PDF posters found in the selected submissions.');
            return;
        }

        setIsExportingPosters(true);
        try {
            const locationSlug =
                locationFilter === 'all' ? '' : `-${locationFilter}`;
            const zipBaseName = hackathonName
                ? `${hackathonName.replace(/\s+/g, '-').toLowerCase()}-submissions${locationSlug}-${filenameSuffix}`
                : `project-submissions${locationSlug}-${filenameSuffix}`;

            const result = await downloadPdfPostersZip(entries, zipBaseName);

            if (result.downloaded === 0) {
                alert(
                    result.errors.length > 0
                        ? `Could not download any posters:\n${result.errors.slice(0, 5).join('\n')}`
                        : 'Could not download any posters.'
                );
                return;
            }

            if (result.skipped > 0 || result.errors.length > 0) {
                const detail =
                    result.errors.length > 0
                        ? `\n\nIssues:\n${result.errors.slice(0, 8).join('\n')}`
                        : '';
                alert(
                    `Downloaded ${result.downloaded} poster${result.downloaded === 1 ? '' : 's'} (${result.skipped} skipped).${detail}`
                );
            }
        } finally {
            setIsExportingPosters(false);
        }
    }

    return (
        <div className="min-w-0 overflow-hidden rounded-md border border-neutral-600/30">
            <div className="flex flex-col gap-3 border-b border-neutral-600/30 bg-neutral-900 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-white/70">
                        <span className="font-medium text-white">
                            {filteredRows.length}
                        </span>{' '}
                        submission{filteredRows.length === 1 ? '' : 's'}
                        {locationFilter !== 'all' &&
                            rows.length !== filteredRows.length && (
                                <span className="text-white/50">
                                    {' '}
                                    of {rows.length}
                                </span>
                            )}
                        {selectedCount > 0 && (
                            <span className="text-white/50">
                                {' '}
                                · {selectedCount} selected
                            </span>
                        )}
                    </div>
                    <Input
                        type="search"
                        placeholder="Search teams..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className={cn(inputStyle.textinput, 'max-w-xs')}
                    />
                </div>
                {locationQuestionId && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="compact"
                            variant={
                                locationFilter === 'all' ? 'brand' : 'default'
                            }
                            hierarchy={
                                locationFilter === 'all'
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() => setLocationFilter('all')}
                        >
                            All locations
                        </Button>
                        {locationOptions.map((option) => (
                            <Button
                                key={option.key}
                                type="button"
                                size="compact"
                                variant={
                                    locationFilter === option.key
                                        ? 'brand'
                                        : 'default'
                                }
                                hierarchy={
                                    locationFilter === option.key
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => setLocationFilter(option.key)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-600/30 p-4">
                <CheckBox
                    name="show-all-columns"
                    label="Show all fields"
                    checked={showAllColumns}
                    onChange={(e) => setShowAllColumns(e.target.checked)}
                />
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="default"
                        hierarchy="primary"
                        size="compact"
                        className="whitespace-nowrap"
                        leadingIconChild={
                            <DocumentArrowDownIcon className="size-5" />
                        }
                        disabled={selectedCount === 0}
                        onClick={() =>
                            exportRows(
                                table
                                    .getSelectedRowModel()
                                    .rows.map((row) => row.original),
                                'selected'
                            )
                        }
                    >
                        Export Selected Rows
                    </Button>
                    <Button
                        type="button"
                        variant="brand"
                        hierarchy="primary"
                        size="compact"
                        className="whitespace-nowrap"
                        leadingIconChild={
                            <DocumentArrowDownIcon className="size-5" />
                        }
                        onClick={() =>
                            exportRows(
                                table
                                    .getFilteredRowModel()
                                    .rows.map((r) => r.original),
                                'all'
                            )
                        }
                    >
                        Export All (filtered)
                    </Button>
                    <Button
                        type="button"
                        variant="default"
                        hierarchy="primary"
                        size="compact"
                        className="whitespace-nowrap"
                        leadingIconChild={
                            <DocumentArrowDownIcon className="size-5" />
                        }
                        disabled={
                            pdfPosterQuestionId == null ||
                            isExportingPosters ||
                            filteredRows.length === 0
                        }
                        onClick={() =>
                            exportPdfPosters(
                                table
                                    .getFilteredRowModel()
                                    .rows.map((r) => r.original),
                                'pdf-posters'
                            )
                        }
                    >
                        {isExportingPosters
                            ? 'Exporting PDF posters...'
                            : 'Export PDF Posters (filtered)'}
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-full overflow-x-auto">
                <table
                    className="table-fixed caption-bottom text-sm"
                    style={{ width: table.getCenterTotalSize() }}
                >
                    <colgroup>
                        {table
                            .getHeaderGroups()[0]
                            ?.headers.map((header) => (
                                <col
                                    key={header.id}
                                    style={columnSizeStyle(header.column)}
                                />
                            ))}
                    </colgroup>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            'relative py-3 align-top',
                                            isSelectColumn(header.column) &&
                                                'w-16 max-w-16 min-w-16 shrink-0 px-2'
                                        )}
                                        style={columnSizeStyle(header.column)}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                        {header.column.getCanResize() && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={cn(
                                                    'absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize touch-none select-none',
                                                    header.column.getIsResizing()
                                                        ? 'bg-brand-500'
                                                        : 'hover:bg-neutral-600'
                                                )}
                                            />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected()
                                            ? 'selected'
                                            : undefined
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                'py-3 align-top',
                                                isSelectColumn(cell.column) &&
                                                    'w-16 max-w-16 min-w-16 shrink-0 px-2'
                                            )}
                                            style={columnSizeStyle(cell.column)}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-white/60"
                                >
                                    No submissions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </table>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-600/30 p-4 text-sm text-white/70">
                <Button
                    type="button"
                    variant="default"
                    hierarchy="tertiary"
                    size="compact"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <span>
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount() || 1}
                </span>
                <Button
                    type="button"
                    variant="default"
                    hierarchy="tertiary"
                    size="compact"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
