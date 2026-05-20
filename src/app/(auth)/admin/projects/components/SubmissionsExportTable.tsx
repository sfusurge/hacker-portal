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
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { Input } from '@/components/ui/input/input';
import inputStyle from '@/components/ui/input/input.module.css';
import { cn } from '@/lib/utils';
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
    resolveSubmissionExportQuestionIds,
    submissionToCsvRecord,
    type SubmissionExportRow,
    type SubmissionLocationFilterKey,
} from '@/lib/admin/submissionExport';

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

    const questionIds = useMemo(
        () => resolveSubmissionExportQuestionIds(submissionQuestionPages),
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
                questionIds.location,
                locationFilter
            ),
        [rows, questionIds.location, locationFilter]
    );

    useEffect(() => {
        setRowSelection({});
    }, [locationFilter]);

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
                accessorKey: 'teamId',
                header: 'Team ID',
            },
            {
                accessorKey: 'teamName',
                header: 'Team Name',
            },
            {
                id: 'project_name',
                header: 'Project Name',
                accessorFn: (row) =>
                    getSubmissionExportField(
                        row.response,
                        questionIds.projectName
                    ),
            },
            {
                id: 'track',
                header: 'Track',
                accessorFn: (row) =>
                    getSubmissionExportField(row.response, questionIds.track),
            },
            {
                id: 'location',
                header: 'Location',
                accessorFn: (row) =>
                    getSubmissionExportField(
                        row.response,
                        questionIds.location
                    ),
            },
        ],
        [questionIds.projectName, questionIds.track, questionIds.location]
    );

    const table = useReactTable({
        data: filteredRows,
        columns,
        state: { globalFilter, rowSelection },
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
            submissionToCsvRecord(row, questionIds, submissionQuestionPages)
        );

        const locationSlug =
            locationFilter === 'all' ? '' : `-${locationFilter}`;

        const config = mkConfig({
            ...csvConfig,
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
                {questionIds.location && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setLocationFilter('all')}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm transition-colors',
                                locationFilter === 'all'
                                    ? 'bg-brand-700 text-white'
                                    : 'bg-neutral-800 text-white/70 hover:bg-neutral-700'
                            )}
                        >
                            All locations
                        </button>
                        {locationOptions.map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setLocationFilter(option.key)}
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                                    locationFilter === option.key
                                        ? 'bg-brand-700 text-white'
                                        : 'bg-neutral-800 text-white/70 hover:bg-neutral-700'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-3 border-b border-neutral-600/30 p-4">
                <button
                    type="button"
                    className={`flex flex-row items-center justify-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap ${
                        selectedCount === 0
                            ? 'cursor-not-allowed bg-neutral-500/18 text-white/18'
                            : 'bg-neutral-700 text-white'
                    }`}
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
                    <DocumentArrowDownIcon className="size-5" />
                    Export Selected Rows
                </button>
                <button
                    type="button"
                    className="bg-brand-700 flex flex-row items-center justify-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap text-white"
                    onClick={() =>
                        exportRows(
                            table
                                .getFilteredRowModel()
                                .rows.map((r) => r.original),
                            'all'
                        )
                    }
                >
                    <DocumentArrowDownIcon className="size-5" />
                    Export All (filtered)
                </button>
            </div>

            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
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
                                    row.getIsSelected() ? 'selected' : undefined
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
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
            </Table>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-600/30 p-4 text-sm text-white/70">
                <button
                    type="button"
                    className="rounded-md px-3 py-1 hover:bg-neutral-800 disabled:opacity-40"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </button>
                <span>
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount() || 1}
                </span>
                <button
                    type="button"
                    className="rounded-md px-3 py-1 hover:bg-neutral-800 disabled:opacity-40"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
