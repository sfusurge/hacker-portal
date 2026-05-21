'use client';

import { useEffect, useMemo, useRef, useState, type HTMLProps } from 'react';
import {
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
import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    DocumentArrowDownIcon,
} from '@heroicons/react/24/solid';
import { Input } from '@/components/ui/input/input';
import inputStyle from '@/components/ui/input/input.module.css';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckBox } from '@/components/ui/checkbox/checkbox';
import {
    Table,
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
    buildAllSubmissionTableColumns,
    buildSubmissionCsvColumnHeaders,
    buildSubmissionReviewTableColumns,
    resolveSubmissionReviewTableLocationQuestionId,
} from '@/lib/projects/buildSubmissionReviewTableColumns';
import {
    collectPdfPosterEntries,
    downloadPdfPostersAsCombinedPdf,
    downloadPdfPostersAsZip,
    formatPosterExportSummary,
    resolvePdfPosterQuestionId,
} from '@/lib/admin/posterExport';

export type SubmissionTableRow = SubmissionExportRow;

type SubmissionsExportTableProps = {
    rows: SubmissionTableRow[];
    submissionQuestionPages: InputFormPageData[];
    hackathonName?: string;
};

const DEFAULT_PAGE_SIZE = 10;
const COLLAPSED_COLUMN_MAX = 'max-w-[10rem]';
/** 3× collapsed width when a column header is expanded */
const EXPANDED_COLUMN_MAX = 'min-w-[20rem] max-w-[20rem] w-[20rem]';

function getExpandableColumnWidthClass(isExpanded: boolean): string {
    return isExpanded ? EXPANDED_COLUMN_MAX : COLLAPSED_COLUMN_MAX;
}

const STICKY_CHECKBOX_COLUMN_CLASS = cn(
    'sticky left-0 z-20 w-16 min-w-16 max-w-16',
    'border-r border-neutral-600/30 bg-neutral-900',
    'shadow-[4px_0_12px_-4px_rgba(0,0,0,0.45)]',
    '[tr:hover_&]:bg-neutral-800/50',
    '[tr[data-state=selected]_&]:bg-neutral-800'
);

const STICKY_CHECKBOX_HEADER_CLASS = cn(STICKY_CHECKBOX_COLUMN_CLASS, 'z-30');

function formatSubmissionCellValue(value: unknown): string {
    if (value == null || value === '') return '—';
    return String(value);
}

function ExpandableColumnHeader({
    columnId,
    label,
    isExpanded,
    onToggle,
}: {
    columnId: string;
    label: string;
    isExpanded: boolean;
    onToggle: (columnId: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onToggle(columnId)}
            className={cn(
                'flex w-full min-w-0 items-start gap-1 text-left font-medium text-neutral-400 transition-colors hover:text-white',
                getExpandableColumnWidthClass(isExpanded)
            )}
            title={!isExpanded ? label : undefined}
            aria-expanded={isExpanded}
        >
            <span
                className={cn(
                    'min-w-0 flex-1',
                    isExpanded ? 'break-words whitespace-normal' : 'truncate'
                )}
            >
                {label}
            </span>
            {isExpanded ? (
                <ChevronDoubleLeftIcon
                    className="mt-0.5 size-4 shrink-0 opacity-70"
                    aria-hidden
                />
            ) : (
                <ChevronDoubleRightIcon
                    className="mt-0.5 size-4 shrink-0 opacity-70"
                    aria-hidden
                />
            )}
        </button>
    );
}

function ExpandableSubmissionCell({
    value,
    isExpanded,
}: {
    value: unknown;
    isExpanded: boolean;
}) {
    const text = formatSubmissionCellValue(value);

    return (
        <div
            className={cn(
                'min-w-0',
                isExpanded
                    ? cn(
                          getExpandableColumnWidthClass(true),
                          'break-words whitespace-normal'
                      )
                    : cn(COLLAPSED_COLUMN_MAX, 'truncate')
            )}
            title={!isExpanded && text !== '—' ? text : undefined}
        >
            {text}
        </div>
    );
}

const csvConfig = mkConfig({
    fieldSeparator: ',',
    filename: 'project-submissions',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

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
    const [posterExportBusy, setPosterExportBusy] = useState<
        'zip' | 'pdf' | null
    >(null);
    const [showAllColumns, setShowAllColumns] = useState(false);
    const [expandedColumnIds, setExpandedColumnIds] = useState<
        Record<string, boolean>
    >({});

    const pdfPosterQuestionId = useMemo(
        () => resolvePdfPosterQuestionId(submissionQuestionPages),
        [submissionQuestionPages]
    );

    const reviewTableColumns = useMemo(
        () => buildSubmissionReviewTableColumns(submissionQuestionPages),
        [submissionQuestionPages]
    );

    const allSubmissionColumns = useMemo(
        () => buildAllSubmissionTableColumns(submissionQuestionPages),
        [submissionQuestionPages]
    );

    const questionColumns = showAllColumns
        ? allSubmissionColumns
        : reviewTableColumns;

    const csvColumnHeaders = useMemo(
        () =>
            buildSubmissionCsvColumnHeaders(
                submissionQuestionPages,
                showAllColumns
            ),
        [submissionQuestionPages, showAllColumns]
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

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
    });

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [showAllColumns, locationFilter, globalFilter]);

    useEffect(() => {
        setExpandedColumnIds({});
    }, [showAllColumns, questionColumns]);

    const toggleColumnExpanded = (columnId: string) => {
        setExpandedColumnIds((prev) => ({
            ...prev,
            [columnId]: !prev[columnId],
        }));
    };

    const columns = useMemo<ColumnDef<SubmissionTableRow>[]>(
        () => [
            {
                id: 'select',
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
                id: 'teamId',
                accessorKey: 'teamId',
                header: 'Team ID',
                cell: ({ getValue }) => (
                    <div
                        className={cn(
                            COLLAPSED_COLUMN_MAX,
                            'truncate tabular-nums'
                        )}
                        title={String(getValue() ?? '')}
                    >
                        {formatSubmissionCellValue(getValue())}
                    </div>
                ),
            },
            {
                id: 'teamName',
                accessorKey: 'teamName',
                header: ({ column }) => (
                    <ExpandableColumnHeader
                        columnId={column.id}
                        label="Team Name"
                        isExpanded={!!expandedColumnIds[column.id]}
                        onToggle={toggleColumnExpanded}
                    />
                ),
                cell: ({ row, column }) => (
                    <ExpandableSubmissionCell
                        value={row.original.teamName}
                        isExpanded={!!expandedColumnIds[column.id]}
                    />
                ),
            },
            ...questionColumns.map((col) => ({
                id: col.id,
                header: ({ column }: { column: { id: string } }) => (
                    <ExpandableColumnHeader
                        columnId={column.id}
                        label={col.header}
                        isExpanded={!!expandedColumnIds[column.id]}
                        onToggle={toggleColumnExpanded}
                    />
                ),
                accessorFn: (row: SubmissionTableRow) =>
                    getSubmissionExportField(row.response, col.questionId),
                cell: ({
                    row,
                    column,
                }: {
                    row: { original: SubmissionTableRow };
                    column: { id: string };
                }) => (
                    <ExpandableSubmissionCell
                        value={getSubmissionExportField(
                            row.original.response,
                            col.questionId
                        )}
                        isExpanded={!!expandedColumnIds[column.id]}
                    />
                ),
            })),
        ],
        [questionColumns, expandedColumnIds]
    );

    const table = useReactTable({
        data: filteredRows,
        columns,
        state: { globalFilter, rowSelection, pagination },
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: true,
        getRowId: (row) => String(row.teamId),
    });

    async function exportPdfPosters(mode: 'zip' | 'pdf') {
        if (pdfPosterQuestionId == null) {
            alert('This event form has no PDF poster upload question.');
            return;
        }

        const rowsToExport = table
            .getSelectedRowModel()
            .rows.map((row) => row.original);

        if (rowsToExport.length === 0) {
            alert('Select at least one row to export posters.');
            return;
        }

        const entries = collectPdfPosterEntries(
            rowsToExport,
            pdfPosterQuestionId
        );

        if (entries.length === 0) {
            alert('No poster PDFs found in the selected submissions.');
            return;
        }

        setPosterExportBusy(mode);
        try {
            const result =
                mode === 'zip'
                    ? await downloadPdfPostersAsZip(
                          entries,
                          hackathonName ?? 'hackathon'
                      )
                    : await downloadPdfPostersAsCombinedPdf(
                          entries,
                          hackathonName ?? 'hackathon'
                      );

            if (result.succeeded === 0) {
                alert(
                    'Could not download any posters. Check that poster URLs are reachable.'
                );
                return;
            }

            alert(formatPosterExportSummary(result, rowsToExport.length));
        } finally {
            setPosterExportBusy(null);
        }
    }

    function exportRows(
        rowsToExport: SubmissionTableRow[],
        filenameSuffix: string
    ) {
        if (rowsToExport.length === 0) {
            alert('No rows to export.');
            return;
        }

        const csvData = rowsToExport.map((row) =>
            submissionToCsvRecord(row, submissionQuestionPages, {
                includeAllColumns: showAllColumns,
            })
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

    return (
        <div className="overflow-hidden rounded-md border border-neutral-600/30">
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
                            variant={
                                locationFilter === 'all' ? 'brand' : 'default'
                            }
                            hierarchy={
                                locationFilter === 'all'
                                    ? 'primary'
                                    : 'secondary'
                            }
                            size="compact"
                            onClick={() => setLocationFilter('all')}
                        >
                            All locations
                        </Button>
                        {locationOptions.map((option) => (
                            <Button
                                key={option.key}
                                type="button"
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
                                size="compact"
                                onClick={() => setLocationFilter(option.key)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-600/30 px-4 py-4">
                <CheckBox
                    id="show-all-submission-columns"
                    label="Show all columns"
                    checked={showAllColumns}
                    onChange={(e) => setShowAllColumns(e.target.checked)}
                />
                <div className="flex flex-wrap items-center justify-end gap-3">
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
                                    .getSelectedRowModel()
                                    .rows.map((row) => row.original),
                                'selected'
                            )
                        }
                        disabled={selectedCount === 0}
                    >
                        Export Selected Rows
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
                    {pdfPosterQuestionId != null && (
                        <>
                            <Button
                                type="button"
                                variant="brand"
                                hierarchy="primary"
                                size="compact"
                                className="whitespace-nowrap"
                                leadingIconChild={
                                    <DocumentArrowDownIcon className="size-5" />
                                }
                                onClick={() => exportPdfPosters('zip')}
                                disabled={
                                    posterExportBusy !== null ||
                                    selectedCount === 0
                                }
                            >
                                {posterExportBusy === 'zip'
                                    ? 'Building ZIP…'
                                    : 'Download posters (ZIP)'}
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
                                onClick={() => exportPdfPosters('pdf')}
                                disabled={
                                    posterExportBusy !== null ||
                                    selectedCount === 0
                                }
                            >
                                {posterExportBusy === 'pdf'
                                    ? 'Combining PDFs…'
                                    : 'Combine posters (PDF)'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="w-full overflow-x-auto px-4 pb-2">
                <Table className="w-full min-w-max table-auto [&>div]:overflow-visible">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const columnId = header.column.id;
                                    const isExpanded =
                                        !!expandedColumnIds[columnId];
                                    const isExpandable =
                                        columnId === 'teamName' ||
                                        questionColumns.some(
                                            (c) => c.id === columnId
                                        );

                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                'pt-4 align-top',
                                                columnId === 'select' &&
                                                    STICKY_CHECKBOX_HEADER_CLASS,
                                                columnId === 'teamId' &&
                                                    COLLAPSED_COLUMN_MAX,
                                                isExpandable &&
                                                    getExpandableColumnWidthClass(
                                                        isExpanded
                                                    )
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
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
                                    {row.getVisibleCells().map((cell) => {
                                        const columnId = cell.column.id;
                                        const isExpanded =
                                            !!expandedColumnIds[columnId];
                                        const isExpandable =
                                            columnId === 'teamName' ||
                                            questionColumns.some(
                                                (c) => c.id === columnId
                                            );

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(
                                                    'align-top',
                                                    columnId === 'select' &&
                                                        STICKY_CHECKBOX_COLUMN_CLASS,
                                                    !isExpanded && 'max-w-0',
                                                    columnId === 'teamId' &&
                                                        COLLAPSED_COLUMN_MAX,
                                                    isExpandable &&
                                                        getExpandableColumnWidthClass(
                                                            isExpanded
                                                        )
                                                )}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        );
                                    })}
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
                </Table>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-600/30 p-4 text-sm text-white/70">
                <Button
                    type="button"
                    variant="default"
                    hierarchy="secondary"
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
                    hierarchy="secondary"
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
