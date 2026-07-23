'use client';

import {
    AdjustmentsHorizontalIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DocumentArrowDownIcon,
    EnvelopeIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/16/solid';
import {
    FlagIcon as FlagOutlineIcon,
    UserIcon,
} from '@heroicons/react/24/solid';
import { FlagIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { CircleDot } from 'lucide-react';
import type {
    ColumnFiltersState,
    SortingState,
    Table,
} from '@tanstack/react-table';
import type { StatusEnum } from '@/db/schema/applications';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ReviewActiveFilterChips,
    ReviewTableFilters,
    resolveCurrentStatusFilterValues,
    type ReviewFilterField,
    type ReviewFilterValueOption,
} from '../ReviewTableFilters';
import { PendingStatusMenuItems } from './statusCells';
import type { Applicant } from './types';

const toolbarButtonClass =
    'inline-flex min-h-9 items-center gap-2 rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700/60';

type ReviewTableToolbarProps = {
    applicantTab: 'all' | 'flagged';
    onApplicantTabChange: (tab: 'all' | 'flagged') => void;
    flaggedCount: number;
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
    filterMenuOpen: boolean;
    onFilterMenuOpenChange: (open: boolean) => void;
    filterFields: ReviewFilterField[];
    getFilterValueOptions: (
        field: ReviewFilterField
    ) => ReviewFilterValueOption[];
    onExport: () => void;
    hasSelection: boolean;
    activeFilterChips: { id: string; label: string; valueLabel: string }[];
    onRemoveFilter: (fieldId: string) => void;
    sorting: SortingState;
    sortLabels: Record<string, string>;
    onClearSort: (columnId: string) => void;
    onColumnFiltersChange: (
        updater:
            | ColumnFiltersState
            | ((prev: ColumnFiltersState) => ColumnFiltersState)
    ) => void;
    onFilterValueLabelsChange: (
        updater:
            | Record<string, string>
            | ((prev: Record<string, string>) => Record<string, string>)
    ) => void;
};

export function ReviewTableToolbar({
    applicantTab,
    onApplicantTabChange,
    flaggedCount,
    globalFilter,
    onGlobalFilterChange,
    filterMenuOpen,
    onFilterMenuOpenChange,
    filterFields,
    getFilterValueOptions,
    onExport,
    hasSelection,
    activeFilterChips,
    onRemoveFilter,
    sorting,
    sortLabels,
    onClearSort,
    onColumnFiltersChange,
    onFilterValueLabelsChange,
}: ReviewTableToolbarProps) {
    return (
        <div className="flex flex-col gap-2 px-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onApplicantTabChange('all')}
                        className={clsx(
                            'inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            applicantTab === 'all'
                                ? 'bg-neutral-700/60 text-white'
                                : 'text-white/60 hover:bg-neutral-900 hover:text-white'
                        )}
                    >
                        <UserIcon className="size-5" />
                        All Applicants
                    </button>
                    <button
                        type="button"
                        onClick={() => onApplicantTabChange('flagged')}
                        className={clsx(
                            'inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            applicantTab === 'flagged'
                                ? 'bg-neutral-700/60 text-white'
                                : 'text-white/60 hover:bg-neutral-900 hover:text-white'
                        )}
                    >
                        <FlagOutlineIcon className="size-4" />
                        Flagged
                        {flaggedCount > 0 ? (
                            <span className="bg-caution-500 rounded-md px-1.5 text-xs font-semibold text-white">
                                {flaggedCount}
                            </span>
                        ) : null}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-9 w-[300px] max-w-full items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3">
                        <MagnifyingGlassIcon className="size-4 shrink-0 text-white/50" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={globalFilter ?? ''}
                            onChange={(e) =>
                                onGlobalFilterChange(e.target.value)
                            }
                            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
                        />
                    </div>
                    <ReviewTableFilters
                        open={filterMenuOpen}
                        onOpenChange={onFilterMenuOpenChange}
                        fields={filterFields}
                        getValueOptions={getFilterValueOptions}
                        onSelectValue={(fieldId, value, valueLabel) => {
                            const filterValue =
                                fieldId === 'currentStatus'
                                    ? resolveCurrentStatusFilterValues(value)
                                    : value;
                            onColumnFiltersChange((prev) => {
                                const rest = prev.filter(
                                    (f) => f.id !== fieldId
                                );
                                return [
                                    ...rest,
                                    { id: fieldId, value: filterValue },
                                ];
                            });
                            onFilterValueLabelsChange((prev) => ({
                                ...prev,
                                [fieldId]: valueLabel,
                            }));
                        }}
                        trigger={
                            <>
                                <AdjustmentsHorizontalIcon className="size-4" />
                                Filter
                            </>
                        }
                    />
                    <button
                        type="button"
                        onClick={onExport}
                        disabled={!hasSelection}
                        className={clsx(
                            toolbarButtonClass,
                            !hasSelection &&
                                'cursor-not-allowed opacity-40 hover:bg-neutral-800/60'
                        )}
                    >
                        <DocumentArrowDownIcon className="size-4" />
                        Export
                    </button>
                </div>
            </div>

            <ReviewActiveFilterChips
                activeFilters={activeFilterChips}
                onRemoveFilter={onRemoveFilter}
                sorting={sorting}
                sortLabels={sortLabels}
                onClearSort={onClearSort}
            />
        </div>
    );
}

type SelectionActionBarProps = {
    selectedCount: number;
    position: { top: number; left: number };
    disabled?: boolean;
    acceptPendingStatus: StatusEnum;
    onClearSelection: () => void;
    onChangePendingStatus: (next: StatusEnum) => void;
    onFlag: () => void;
};

export function SelectionActionBar({
    selectedCount,
    position,
    disabled,
    acceptPendingStatus,
    onClearSelection,
    onChangePendingStatus,
    onFlag,
}: SelectionActionBarProps) {
    return (
        <div
            className="pointer-events-none fixed z-40"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <div className="bg-neutral-925 pointer-events-auto flex items-stretch gap-1 rounded-lg border border-neutral-600/60 px-2 py-1 shadow-[0px_2px_2px_rgba(0,0,0,0.08),0px_4px_3px_rgba(0,0,0,0.12)]">
                <button
                    type="button"
                    className="text-brand-300 flex items-center justify-center rounded px-2 py-2 text-sm tracking-tight whitespace-nowrap transition-colors hover:bg-neutral-800"
                    onClick={onClearSelection}
                    aria-label="Clear selection"
                >
                    {selectedCount} selected
                </button>
                <div
                    className="w-px self-stretch bg-neutral-600/60"
                    aria-hidden
                />
                <DropdownMenu>
                    <DropdownMenuTrigger
                        disabled={disabled}
                        className="flex items-center gap-3 rounded px-2 py-2 text-sm text-white transition-colors hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-50"
                    >
                        <CircleDot className="size-4 shrink-0 text-white/70" />
                        Change pending status
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="center"
                        sideOffset={8}
                        className="z-[100] w-[180px] rounded-lg border-neutral-600/30 bg-neutral-900 p-1 text-white shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.04),0px_4px_6px_-2px_rgba(0,0,0,0.12),0px_12px_16px_-4px_rgba(0,0,0,0.08)]"
                    >
                        <PendingStatusMenuItems
                            acceptPendingStatus={acceptPendingStatus}
                            onSelect={onChangePendingStatus}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
                <div
                    className="w-px self-stretch bg-neutral-600/60"
                    aria-hidden
                />
                <button
                    type="button"
                    className="flex items-center gap-3 rounded px-2 py-2 text-sm text-white transition-colors hover:bg-neutral-800"
                    disabled={disabled}
                    onClick={onFlag}
                >
                    <FlagIcon className="size-4 shrink-0 text-white/70" />
                    Flag
                </button>
            </div>
        </div>
    );
}

type ReviewTablePaginationProps = {
    table: Table<Applicant>;
    selectedCount: number;
    hasSelection: boolean;
    onEmailSelected: () => void;
};

export function ReviewTablePagination({
    table,
    selectedCount,
    hasSelection,
    onEmailSelected,
}: ReviewTablePaginationProps) {
    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900 px-5 py-3">
                <div className="min-w-0 flex-1 text-sm text-white">
                    {selectedCount} of{' '}
                    {table.getPreFilteredRowModel().rows.length} rows selected
                </div>

                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-white">
                    <span>Rows per page:</span>
                    <div className="relative">
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                table.setPageSize(parseInt(e.target.value));
                            }}
                            className="appearance-none rounded-lg border border-neutral-600/60 bg-neutral-800/60 py-2 pr-8 pl-3 text-sm font-medium text-white"
                        >
                            {[10, 20, 30, 40, 50, 100, 150, 200].map(
                                (pageSize) => (
                                    <option key={pageSize} value={pageSize}>
                                        {pageSize}
                                    </option>
                                )
                            )}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-white/50" />
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-end gap-4 text-sm text-white">
                    <div className="flex items-center gap-2">
                        <span>Page</span>
                        <input
                            type="number"
                            min="1"
                            max={table.getPageCount() || 1}
                            value={table.getState().pagination.pageIndex + 1}
                            onChange={(e) => {
                                const page = e.target.value
                                    ? Number(e.target.value) - 1
                                    : 0;
                                table.setPageIndex(page);
                            }}
                            className="h-9 w-9 rounded-lg border border-neutral-600/60 bg-neutral-800/60 text-center text-sm font-medium text-white"
                        />
                        <span>of {table.getPageCount() || 1}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className="inline-flex size-9 items-center justify-center rounded-lg text-white/70 disabled:opacity-30"
                            onClick={() => {
                                table.setPageIndex(0);
                            }}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="First page"
                        >
                            <ChevronDoubleLeftIcon className="size-4" />
                        </button>
                        <button
                            type="button"
                            className="inline-flex size-9 items-center justify-center rounded-lg text-white/70 disabled:opacity-30"
                            onClick={() => {
                                table.previousPage();
                            }}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Previous page"
                        >
                            <ChevronLeftIcon className="size-4" />
                        </button>
                        <button
                            type="button"
                            className="inline-flex size-9 items-center justify-center rounded-lg text-white/70 disabled:opacity-30"
                            onClick={() => {
                                table.nextPage();
                            }}
                            disabled={!table.getCanNextPage()}
                            aria-label="Next page"
                        >
                            <ChevronRightIcon className="size-4" />
                        </button>
                        <button
                            type="button"
                            className="inline-flex size-9 items-center justify-center rounded-lg text-white/70 disabled:opacity-30"
                            onClick={() => {
                                table.setPageIndex(table.getPageCount() - 1);
                            }}
                            disabled={!table.getCanNextPage()}
                            aria-label="Last page"
                        >
                            <ChevronDoubleRightIcon className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 p-4">
                <button
                    className={`flex flex-row items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm whitespace-nowrap ${
                        !hasSelection
                            ? 'cursor-not-allowed bg-neutral-500/18 text-white/18'
                            : 'bg-brand-700 text-white'
                    }`}
                    type="button"
                    onClick={onEmailSelected}
                    disabled={!hasSelection}
                >
                    <EnvelopeIcon className="size-5" />
                    Email Selected Entries
                </button>
            </div>
        </>
    );
}
