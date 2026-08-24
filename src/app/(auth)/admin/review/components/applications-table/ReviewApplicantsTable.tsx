'use client';

import {
    Fragment,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    RowSelectionState,
    PaginationState,
    type Row,
    type RowModel,
    type Table,
} from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import clsx from 'clsx';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import type { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import type { InputFormPageData } from '@/components/application_components/types';
import { getResponseValue } from '@/lib/admin/submissionExport';
import {
    applicationToCsvRecord,
    buildApplicationCsvColumnHeaders,
    getApplicationExportField,
    resolveApplicationQuestionIdByRole,
} from '@/lib/applications/applicationReviewExport';
import { getAcceptPendingStatusForEventLocation } from '@/lib/applicationAcceptStatus';
import {
    ApplicantStatusSummary,
    getApplicantStatusSummaryMetrics,
} from '../ApplicantStatusSummary';
import {
    CURRENT_STATUS_FILTER_OPTIONS,
    getPendingStatusFilterOptions,
    MULTI_VALUE_FILTER_LABELS,
    MULTI_VALUE_FILTER_ROLES,
    splitMultiValueTokens,
    type ReviewFilterField,
} from '../ReviewTableFilters';
import { BulkEmailModal } from './BulkEmailModal';
import {
    ReviewTablePagination,
    ReviewTableToolbar,
    SelectionActionBar,
} from './ReviewTableChrome';
import { reviewTableStickyColumnProps, SortIndicator } from './tablePrimitives';
import { sideCardAtomSJ, type Applicant } from './types';
import { useMarqueeRowSelection } from './useMarqueeRowSelection';
import { useReviewApplicantMutations } from './useReviewApplicantMutations';
import { useReviewTableColumns } from './useReviewTableColumns';

const TEAM_SORT_COLUMN_ID = 'teamName';

function isCheckInSortColumn(columnId: string): boolean {
    return columnId.startsWith('checkin-');
}

const DEFAULT_TEAM_SORT: SortingState[number] = {
    id: TEAM_SORT_COLUMN_ID,
    desc: false,
};

/**
 * - Team grouping on: keep teamName as primary sort (default A→Z).
 * - Team grouping off: never force teamName back.
 * - Check-in columns: replace all sorting while active (bypass team).
 */
function normalizeSorting(
    sorting: SortingState,
    groupByTeam: boolean
): SortingState {
    const checkInSort = [...sorting]
        .reverse()
        .find((s) => isCheckInSortColumn(s.id));
    if (checkInSort) {
        return [checkInSort];
    }

    const withoutCheckIn = sorting.filter((s) => !isCheckInSortColumn(s.id));

    if (!groupByTeam) {
        return withoutCheckIn.filter((s) => s.id !== TEAM_SORT_COLUMN_ID);
    }

    const teamSort =
        withoutCheckIn.find((s) => s.id === TEAM_SORT_COLUMN_ID) ??
        DEFAULT_TEAM_SORT;
    const rest = withoutCheckIn.filter((s) => s.id !== TEAM_SORT_COLUMN_ID);
    return [teamSort, ...rest];
}

function pinApplicantsWithoutTeamLast(
    rows: Row<Applicant>[]
): Row<Applicant>[] {
    const withTeam: Row<Applicant>[] = [];
    const withoutTeam: Row<Applicant>[] = [];
    for (const row of rows) {
        if ((row.original.teamName ?? '').trim()) {
            withTeam.push(row);
        } else {
            withoutTeam.push(row);
        }
    }
    return [...withTeam, ...withoutTeam];
}

function getTeamPinnedSortedRowModel(): (
    table: Table<Applicant>
) => () => RowModel<Applicant> {
    const defaultSortedRowModel = getSortedRowModel<Applicant>();
    return (table) => {
        const getSortedRows = defaultSortedRowModel(
            table as Table<Applicant>
        ) as () => RowModel<Applicant>;
        return () => {
            const sorted = getSortedRows();
            const sorting = table.getState().sorting;
            const teamGrouped =
                sorting.some((s) => s.id === TEAM_SORT_COLUMN_ID) &&
                !sorting.some((s) => isCheckInSortColumn(s.id));
            if (!teamGrouped) {
                return sorted;
            }
            const rows = pinApplicantsWithoutTeamLast(sorted.rows);
            return {
                ...sorted,
                rows,
                flatRows: rows,
                rowsById: Object.fromEntries(rows.map((row) => [row.id, row])),
            };
        };
    };
}

const csvConfig = mkConfig({
    fieldSeparator: ',',
    filename: 'Data',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

type ReviewApplicantsTableProps = {
    applicationCount: number;
    data: Applicant[];
    extraColumns: ColumnDef<Applicant>[];
    applicationQuestionPages: InputFormPageData[];
    applicationDataMap: Map<number, ApplicationWithTeamInfo>;
    fetchNextPage: () => Promise<void>;
    onRowClick?: (app: Applicant) => void;
    hackathonId: number;
    showLocationColumn: boolean;
};

export function ReviewApplicantsTable({
    applicationCount,
    data,
    extraColumns,
    applicationQuestionPages,
    applicationDataMap,
    fetchNextPage,
    onRowClick,
    hackathonId,
    showLocationColumn,
}: ReviewApplicantsTableProps) {
    const setSideCardInfo = useSetAtom(sideCardAtomSJ);
    const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);

    const statusSummary = useMemo(
        () => getApplicantStatusSummaryMetrics(data),
        [data]
    );

    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [groupByTeam, setGroupByTeam] = useState(true);
    const [sorting, setSorting] = useState<SortingState>(() =>
        normalizeSorting([], true)
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [filterValueLabels, setFilterValueLabels] = useState<
        Record<string, string>
    >({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [applicantTab, setApplicantTab] = useState<'all' | 'flagged'>('all');
    const [stickyFlaggedIds, setStickyFlaggedIds] =
        useState<Set<number> | null>(null);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
    const tableScrollContainerRef = useRef<HTMLDivElement | null>(null);
    const marqueeOverlayRef = useRef<HTMLDivElement | null>(null);
    const [tableViewportWidth, setTableViewportWidth] = useState(0);
    const [selectionMenuPos, setSelectionMenuPos] = useState<{
        top: number;
        left: number;
    } | null>(null);
    const lastSelectionAnchorRef = useRef<number | null>(null);

    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 200,
        pageIndex: 0,
    });

    useEffect(() => {
        const el = tableScrollContainerRef.current;
        if (!el) return;
        const update = () => setTableViewportWidth(el.clientWidth);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setPagination({
            pageSize: parseInt(localStorage.getItem('pagesize') ?? '200', 10),
            pageIndex: parseInt(localStorage.getItem('pageindex') ?? '0', 10),
        });
    }, []);

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        setRowSelection({});
    }, [applicantTab]);

    const flaggedCount = useMemo(
        () => data.filter((row) => row.flagged).length,
        [data]
    );

    const handleApplicantTabChange = (tab: 'all' | 'flagged') => {
        if (tab === 'flagged') {
            setStickyFlaggedIds(
                new Set(data.filter((row) => row.flagged).map((row) => row.id))
            );
        } else {
            setStickyFlaggedIds(null);
        }
        setApplicantTab(tab);
    };

    const tableData = useMemo(
        () =>
            applicantTab === 'flagged'
                ? data.filter(
                      (row) =>
                          row.flagged ||
                          (stickyFlaggedIds?.has(row.id) ?? false)
                  )
                : data,
        [applicantTab, data, stickyFlaggedIds]
    );

    const {
        batchUpdateApplicationStatus,
        updateApplicantById,
        batchUpdateApplicants,
        batchSetPendingStatus,
        isPending,
    } = useReviewApplicantMutations(hackathonId);

    const defaultColumns = useReviewTableColumns({
        extraColumns,
        showLocationColumn,
        isPendingUpdate: isPending,
        applicationDataMap,
        lastSelectionAnchorRef,
        onRowClick,
        onOpenSideCard: setSideCardInfo,
        updateApplicantById,
    });

    const table = useReactTable({
        data: tableData,
        columns: defaultColumns,
        getRowId: (row) => String(row.id),
        state: {
            globalFilter,
            sorting,
            columnFilters,
            rowSelection,
            pagination,
        },
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getTeamPinnedSortedRowModel(),
        enableRowSelection: true,
        enableMultiSort: true,
        isMultiSortEvent: () => true,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: (updater) => {
            setSorting((prev) => {
                const next =
                    typeof updater === 'function' ? updater(prev) : updater;
                // Clicking the Team Name header re-enables team grouping.
                if (next.some((s) => s.id === TEAM_SORT_COLUMN_ID)) {
                    if (!groupByTeam) setGroupByTeam(true);
                    return normalizeSorting(next, true);
                }
                return normalizeSorting(next, groupByTeam);
            });
        },
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
    });

    const { isMarqueeSelecting, handleRowPointerDown } = useMarqueeRowSelection(
        {
            table,
            rowSelection,
            setRowSelection,
            rowRefs,
            lastSelectionAnchorRef,
            scrollContainerRef: tableScrollContainerRef,
            marqueeOverlayRef,
        }
    );

    const selectColWidth = table.getColumn('select')?.getSize() ?? 44;
    const flaggedColWidth = table.getColumn('flagged')?.getSize() ?? 56;
    const stickyColumnOptions = {
        selectColWidth,
        flaggedColWidth,
    };
    const pageCount = table.getPageCount();

    useEffect(() => {
        localStorage.setItem('pagesize', `${pagination.pageSize}`);
    }, [pagination.pageSize]);

    useEffect(() => {
        localStorage.setItem('pageindex', `${pagination.pageIndex}`);
    }, [pagination.pageIndex]);

    useEffect(() => {
        if (pageCount - (pagination.pageIndex + 1) > 1) return;
        void fetchNextPage();
    }, [pageCount, pagination.pageIndex, fetchNextPage]);

    const exportExcel = () => {
        const selectedRows = table.getSelectedRowModel().rows;

        if (selectedRows.length === 0) {
            alert(
                'No rows selected. Please select at least one row to export.'
            );
            return;
        }

        const checkInColumns = Array.from(
            new Map(
                (data ?? [])
                    .flatMap((row) => row.checkIns ?? [])
                    .map((ci) => [
                        ci.eventId,
                        { eventId: ci.eventId, eventTitle: ci.eventTitle },
                    ])
            ).values()
        );

        const columnHeaders = buildApplicationCsvColumnHeaders(
            applicationQuestionPages,
            checkInColumns,
            { includeEventLocation: showLocationColumn }
        );

        const csvData = selectedRows.map(({ original }) =>
            applicationToCsvRecord(
                original,
                applicationQuestionPages,
                checkInColumns,
                { includeEventLocation: showLocationColumn }
            )
        );

        const config = mkConfig({
            ...csvConfig,
            useKeysAsHeaders: false,
            columnHeaders,
        });

        const csv = generateCsv(config)(csvData);
        download(config)(csv);
    };

    const hasSelection = Object.keys(rowSelection).length > 0;
    const selectedCount = Object.keys(rowSelection).length;

    const multiValueFilterFields = useMemo(() => {
        const fields: ReviewFilterField[] = [];
        for (const role of MULTI_VALUE_FILTER_ROLES) {
            const questionId = resolveApplicationQuestionIdByRole(
                applicationQuestionPages,
                role
            );
            if (!questionId) continue;
            fields.push({
                id: `q-${questionId}`,
                label: MULTI_VALUE_FILTER_LABELS[role],
                kind: 'multiValues',
            });
        }
        return fields;
    }, [applicationQuestionPages]);

    const filterFields: ReviewFilterField[] = useMemo(() => {
        return [
            {
                id: 'currentStatus',
                label: 'Current status',
                kind: 'currentStatus',
            },
            {
                id: 'pendingStatus',
                label: 'Pending status',
                kind: 'pendingStatus',
            },
            ...multiValueFilterFields,
        ];
    }, [multiValueFilterFields]);

    const getFilterValueOptions = useCallback(
        (field: ReviewFilterField) => {
            if (field.kind === 'currentStatus') {
                return CURRENT_STATUS_FILTER_OPTIONS;
            }
            if (field.kind === 'pendingStatus') {
                return getPendingStatusFilterOptions(showLocationColumn);
            }

            const unique = new Set<string>();

            for (const row of tableData) {
                if (field.kind === 'multiValues' && field.id.startsWith('q-')) {
                    const questionId = field.id.slice(2);
                    for (const token of splitMultiValueTokens(
                        getResponseValue(row.response, questionId)
                    )) {
                        unique.add(token);
                    }
                    continue;
                }

                const value = (() => {
                    if (field.id === 'applicantName') {
                        return `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim();
                    }
                    if (field.id === 'teamName') return row.teamName ?? '';
                    if (field.id === 'email') return row.email ?? '';
                    if (field.id === 'lastEmailSent')
                        return row.lastEmailSent ?? '';
                    if (field.id === 'eventLocation')
                        return row.eventLocation ?? '';
                    if (field.id.startsWith('q-')) {
                        const questionId = field.id.slice(2);
                        const fromResponse = getApplicationExportField(
                            row.response,
                            questionId
                        );
                        return fromResponse != null ? String(fromResponse) : '';
                    }
                    const fromResponse = row.response?.[field.id];
                    if (fromResponse != null) return String(fromResponse);
                    return '';
                })();
                if (value.trim()) unique.add(value.trim());
            }

            return Array.from(unique)
                .sort((a, b) => a.localeCompare(b))
                .slice(0, 100)
                .map((value) => ({ value, label: value }));
        },
        [tableData, showLocationColumn]
    );

    const activeFilterChips = useMemo(() => {
        return columnFilters.map((filter) => {
            const field = filterFields.find((f) => f.id === filter.id);
            return {
                id: filter.id,
                label: field?.label ?? filter.id,
                valueLabel:
                    filterValueLabels[filter.id] ?? String(filter.value ?? ''),
            };
        });
    }, [columnFilters, filterFields, filterValueLabels]);

    const sortLabels = useMemo(() => {
        const labels: Record<string, string> = {};
        for (const col of defaultColumns) {
            const id =
                col.id ?? ('accessorKey' in col ? String(col.accessorKey) : '');
            if (!id) continue;
            labels[id] = typeof col.header === 'string' ? col.header : id;
        }
        return labels;
    }, [defaultColumns]);

    const updateSelectionMenuPosition = useCallback(() => {
        const selectedIds = Object.keys(rowSelection).filter(
            (id) => rowSelection[id]
        );
        if (selectedIds.length === 0) {
            setSelectionMenuPos((prev) => (prev == null ? prev : null));
            return;
        }

        const els = selectedIds
            .map((id) => rowRefs.current.get(id))
            .filter((el): el is HTMLTableRowElement => el != null)
            .sort(
                (a, b) =>
                    a.getBoundingClientRect().top -
                    b.getBoundingClientRect().top
            );

        if (els.length === 0) {
            setSelectionMenuPos((prev) => (prev == null ? prev : null));
            return;
        }

        const lastRect = els[els.length - 1].getBoundingClientRect();
        const horizontalOffset = 225;
        const menuWidth = 420;
        const menuHeight = 48;
        const pad = 12;

        const scrollRect =
            tableScrollContainerRef.current?.getBoundingClientRect();
        const viewLeft = scrollRect?.left ?? pad;
        const viewRight = scrollRect?.right ?? window.innerWidth;

        // Stay in the visible table area while scrolling horizontally.
        const preferredLeft = viewLeft + horizontalOffset;
        const maxLeft = Math.max(viewLeft + pad, viewRight - menuWidth - pad);
        const left = Math.min(preferredLeft, maxLeft);

        // Stay under the lowest selected row while scrolling vertically.
        const preferredTop = lastRect.bottom + 8;
        const top = Math.min(
            Math.max(preferredTop, pad),
            window.innerHeight - menuHeight - pad
        );

        setSelectionMenuPos((prev) => {
            if (prev && prev.top === top && prev.left === left) return prev;
            return { top, left };
        });
    }, [rowSelection, pagination, tableData, sorting, globalFilter]);

    useLayoutEffect(() => {
        updateSelectionMenuPosition();
    }, [updateSelectionMenuPosition]);

    useEffect(() => {
        if (!hasSelection) return;

        let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

        const onScroll = () => {
            if (scrollEndTimer) clearTimeout(scrollEndTimer);
            // Keep the bar fixed during scroll; snap to the lowest selected row after.
            scrollEndTimer = setTimeout(() => {
                updateSelectionMenuPosition();
            }, 150);
        };

        const onResize = () => updateSelectionMenuPosition();

        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll, true);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScroll, true);
            if (scrollEndTimer) clearTimeout(scrollEndTimer);
        };
    }, [hasSelection, updateSelectionMenuPosition]);

    return (
        <div className="overflow-hidden">
            <ApplicantStatusSummary
                applicationCount={applicationCount}
                metrics={statusSummary}
                onExport={exportExcel}
                exportDisabled={!hasSelection}
            />

            <ReviewTableToolbar
                applicantTab={applicantTab}
                onApplicantTabChange={handleApplicantTabChange}
                flaggedCount={flaggedCount}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                filterMenuOpen={filterMenuOpen}
                onFilterMenuOpenChange={setFilterMenuOpen}
                filterFields={filterFields}
                getFilterValueOptions={getFilterValueOptions}
                onExport={exportExcel}
                hasSelection={hasSelection}
                activeFilterChips={activeFilterChips}
                onRemoveFilter={(fieldId) => {
                    setColumnFilters((prev) =>
                        prev.filter((f) => f.id !== fieldId)
                    );
                    setFilterValueLabels((prev) => {
                        const next = { ...prev };
                        delete next[fieldId];
                        return next;
                    });
                }}
                sorting={sorting}
                sortLabels={sortLabels}
                onClearSort={(columnId) => {
                    if (columnId === TEAM_SORT_COLUMN_ID) {
                        setGroupByTeam(false);
                        setSorting((prev) =>
                            normalizeSorting(
                                prev.filter(
                                    (s) => s.id !== TEAM_SORT_COLUMN_ID
                                ),
                                false
                            )
                        );
                        return;
                    }
                    setSorting((prev) =>
                        normalizeSorting(
                            prev.filter((s) => s.id !== columnId),
                            groupByTeam
                        )
                    );
                }}
                onColumnFiltersChange={setColumnFilters}
                onFilterValueLabelsChange={setFilterValueLabels}
            />

            <div
                data-marquee-bounds
                className="relative w-full overflow-hidden rounded-lg bg-neutral-900"
            >
                {isMarqueeSelecting ? (
                    <div
                        ref={marqueeOverlayRef}
                        className="pointer-events-none absolute top-0 left-0 z-50 border border-dashed border-neutral-500/60 bg-neutral-700/60 will-change-transform"
                        style={{ width: 0, height: 0 }}
                        aria-hidden
                    />
                ) : null}
                {hasSelection && selectionMenuPos ? (
                    <SelectionActionBar
                        selectedCount={selectedCount}
                        position={selectionMenuPos}
                        disabled={isPending}
                        acceptPendingStatus={getAcceptPendingStatusForEventLocation(
                            undefined
                        )}
                        onClearSelection={() => setRowSelection({})}
                        onChangePendingStatus={(next) => {
                            void batchSetPendingStatus(
                                table.getSelectedRowModel().rows,
                                next
                            );
                        }}
                        onFlag={() =>
                            void batchUpdateApplicants(
                                table.getSelectedRowModel().rows,
                                { flagged: true }
                            )
                        }
                    />
                ) : null}
                <div
                    ref={tableScrollContainerRef}
                    className="touch-pan-x overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"
                >
                    <table
                        className="w-full text-left"
                        style={{ tableLayout: 'fixed', width: '100%' }}
                    >
                        <thead className="bg-neutral-900 whitespace-nowrap text-white">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <Fragment key={headerGroup.id}>
                                    <tr>
                                        {headerGroup.headers.map(
                                            (header, index) => {
                                                const sticky =
                                                    reviewTableStickyColumnProps(
                                                        index,
                                                        stickyColumnOptions
                                                    );
                                                return (
                                                    <th
                                                        key={header.id}
                                                        colSpan={header.colSpan}
                                                        style={{
                                                            width: header.getSize(),
                                                            minWidth:
                                                                header.column
                                                                    .columnDef
                                                                    .minSize,
                                                            ...(sticky.styleLeft !=
                                                            null
                                                                ? {
                                                                      left: sticky.styleLeft,
                                                                  }
                                                                : {}),
                                                        }}
                                                        className={`relative h-12 overflow-hidden px-3 text-sm font-semibold overflow-ellipsis ${sticky.stickyClass}`}
                                                        onClick={
                                                            header.column.getCanSort()
                                                                ? header.column.getToggleSortingHandler()
                                                                : undefined
                                                        }
                                                    >
                                                        <div
                                                            className={clsx(
                                                                'flex items-center gap-2',
                                                                header.column.getCanSort()
                                                                    ? 'justify-between'
                                                                    : 'justify-center'
                                                            )}
                                                        >
                                                            <span className="truncate">
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                          header
                                                                              .column
                                                                              .columnDef
                                                                              .header,
                                                                          header.getContext()
                                                                      )}
                                                            </span>
                                                            {header.column.getCanSort() ? (
                                                                <SortIndicator
                                                                    sorted={header.column.getIsSorted()}
                                                                    sortIndex={
                                                                        sorting.length >
                                                                        1
                                                                            ? header.column.getSortIndex()
                                                                            : undefined
                                                                    }
                                                                />
                                                            ) : null}
                                                        </div>
                                                        {header.column.getCanResize() && (
                                                            <div
                                                                onMouseDown={header.getResizeHandler()}
                                                                onTouchStart={header.getResizeHandler()}
                                                                className={`absolute top-0 right-0 bottom-0 w-2 cursor-col-resize ${
                                                                    header.column.getIsResizing()
                                                                        ? 'bg-gray-500'
                                                                        : ''
                                                                }`}
                                                                style={{
                                                                    zIndex: 50,
                                                                }}
                                                            ></div>
                                                        )}
                                                    </th>
                                                );
                                            }
                                        )}
                                    </tr>
                                </Fragment>
                            ))}
                        </thead>

                        <tbody
                            className={clsx(
                                isMarqueeSelecting && 'select-none'
                            )}
                            onDragStart={(e) => {
                                if (isMarqueeSelecting) e.preventDefault();
                            }}
                        >
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            table.getVisibleLeafColumns().length
                                        }
                                        className="p-0"
                                    >
                                        <div
                                            className="sticky left-0 flex flex-col items-center justify-center gap-4 bg-neutral-800/60 px-4 py-20"
                                            style={{
                                                width:
                                                    tableViewportWidth > 0
                                                        ? tableViewportWidth
                                                        : '100%',
                                            }}
                                        >
                                            <div className="flex items-center rounded-full bg-white/60 p-1">
                                                <MagnifyingGlassIcon className="size-6 text-neutral-900" />
                                            </div>
                                            <div className="flex w-full flex-col gap-1 text-center leading-[1.25]">
                                                <p className="text-lg font-medium tracking-[-0.0075em] text-white">
                                                    {globalFilter.trim()
                                                        ? `No results found for ${globalFilter.trim()}`
                                                        : 'No results found'}
                                                </p>
                                                <p className="text-base tracking-[-0.0075em] text-white/60">
                                                    Please try entering a
                                                    different term.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                table
                                    .getRowModel()
                                    .rows.map((row, visualIndex) => {
                                        const isRowSelected =
                                            row.getIsSelected();
                                        return (
                                            <Fragment key={row.id}>
                                                <tr
                                                    ref={(el) => {
                                                        if (el) {
                                                            rowRefs.current.set(
                                                                row.id,
                                                                el
                                                            );
                                                        } else {
                                                            rowRefs.current.delete(
                                                                row.id
                                                            );
                                                        }
                                                    }}
                                                    data-row-index={visualIndex}
                                                    className={clsx(
                                                        'group',
                                                        isMarqueeSelecting &&
                                                            'cursor-crosshair'
                                                    )}
                                                    onPointerDown={(e) =>
                                                        handleRowPointerDown(
                                                            e,
                                                            visualIndex
                                                        )
                                                    }
                                                >
                                                    {row
                                                        .getVisibleCells()
                                                        .map((cell, index) => {
                                                            const sticky =
                                                                reviewTableStickyColumnProps(
                                                                    index,
                                                                    {
                                                                        ...stickyColumnOptions,
                                                                        variant:
                                                                            'body',
                                                                        selected:
                                                                            isRowSelected,
                                                                    }
                                                                );
                                                            const isPendingStatusCell =
                                                                cell.column
                                                                    .id ===
                                                                'pendingStatus';
                                                            const cellBg =
                                                                sticky.isSticky
                                                                    ? isRowSelected
                                                                        ? 'bg-[color-mix(in_srgb,var(--color-neutral-700)_60%,var(--color-neutral-900))]'
                                                                        : 'bg-[color-mix(in_srgb,var(--color-neutral-800)_60%,var(--color-neutral-900))]'
                                                                    : isRowSelected
                                                                      ? 'bg-neutral-700/60'
                                                                      : 'bg-neutral-800/60';
                                                            return (
                                                                <td
                                                                    key={
                                                                        cell.id
                                                                    }
                                                                    style={{
                                                                        width: cell.column.getSize(),
                                                                        minWidth:
                                                                            cell
                                                                                .column
                                                                                .columnDef
                                                                                .minSize,
                                                                        ...(sticky.styleLeft !=
                                                                        null
                                                                            ? {
                                                                                  left: sticky.styleLeft,
                                                                              }
                                                                            : {}),
                                                                    }}
                                                                    className={clsx(
                                                                        'relative h-11 border-b border-neutral-600/30 px-3 text-sm',
                                                                        cellBg,
                                                                        isPendingStatusCell &&
                                                                            !isRowSelected &&
                                                                            '[&:has([data-state=open])]:bg-neutral-700/60',
                                                                        sticky.stickyClass
                                                                    )}
                                                                    onClick={
                                                                        isPendingStatusCell
                                                                            ? (
                                                                                  e
                                                                              ) =>
                                                                                  e.stopPropagation()
                                                                            : undefined
                                                                    }
                                                                    onPointerDown={
                                                                        isPendingStatusCell
                                                                            ? (
                                                                                  e
                                                                              ) =>
                                                                                  e.stopPropagation()
                                                                            : undefined
                                                                    }
                                                                >
                                                                    {isPendingStatusCell ? (
                                                                        flexRender(
                                                                            cell
                                                                                .column
                                                                                .columnDef
                                                                                .cell,
                                                                            cell.getContext()
                                                                        )
                                                                    ) : (
                                                                        <div
                                                                            className="truncate"
                                                                            style={{
                                                                                whiteSpace:
                                                                                    'nowrap',
                                                                                overflow:
                                                                                    'hidden',
                                                                                textOverflow:
                                                                                    'ellipsis',
                                                                            }}
                                                                        >
                                                                            {flexRender(
                                                                                cell
                                                                                    .column
                                                                                    .columnDef
                                                                                    .cell,
                                                                                cell.getContext()
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                </tr>
                                            </Fragment>
                                        );
                                    })
                            )}
                        </tbody>
                    </table>
                </div>

                <ReviewTablePagination
                    table={table}
                    selectedCount={selectedCount}
                    hasSelection={hasSelection}
                    onEmailSelected={() => setIsEmailPopupOpen(true)}
                />
            </div>

            <BulkEmailModal
                open={isEmailPopupOpen}
                onOpenChange={setIsEmailPopupOpen}
                hackathonId={hackathonId}
                selectedRows={table.getSelectedRowModel().rows}
                batchUpdateApplicationStatus={batchUpdateApplicationStatus}
                onSent={() => setRowSelection({})}
            />
        </div>
    );
}
