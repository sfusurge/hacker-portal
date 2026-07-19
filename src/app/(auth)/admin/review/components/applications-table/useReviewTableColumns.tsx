'use client';

import { useMemo, type MutableRefObject } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { FlagIcon as FlagOutlineIcon } from '@heroicons/react/24/outline';
import { FlagIcon } from '@heroicons/react/24/solid';
import type { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import type { StatusEnum } from '@/db/schema/applications';
import { resolveCurrentStatusFilterValues } from '../ReviewTableFilters';
import { CurrentStatusCell, PendingStatusSelect } from './statusCells';
import { IndeterminateCheckbox } from './tablePrimitives';
import type { Applicant } from './types';

type UseReviewTableColumnsArgs = {
    extraColumns: ColumnDef<Applicant>[];
    showLocationColumn: boolean;
    isPendingUpdate: boolean;
    applicationDataMap: Map<number, ApplicationWithTeamInfo>;
    lastSelectionAnchorRef: MutableRefObject<number | null>;
    onRowClick?: (app: Applicant, idx: number) => void;
    onOpenSideCard: (app: ApplicationWithTeamInfo | undefined) => void;
    updateApplicantById: (
        userId: number,
        patch: {
            status?: StatusEnum;
            pendingStatus?: StatusEnum;
            flagged?: boolean;
        }
    ) => Promise<void>;
};

export function useReviewTableColumns({
    extraColumns,
    showLocationColumn,
    isPendingUpdate,
    applicationDataMap,
    lastSelectionAnchorRef,
    onRowClick,
    onOpenSideCard,
    updateApplicantById,
}: UseReviewTableColumnsArgs): ColumnDef<Applicant>[] {
    return useMemo(() => {
        const columns: ColumnDef<Applicant>[] = [
            {
                id: 'select',
                header: ({ table }) => (
                    <IndeterminateCheckbox
                        {...{
                            checked: table.getIsAllRowsSelected(),
                            indeterminate: table.getIsSomeRowsSelected(),
                            onChange: table.getToggleAllRowsSelectedHandler(),
                        }}
                    />
                ),
                cell: ({ row, table: tableInstance }) => {
                    const visualIndex = tableInstance
                        .getRowModel()
                        .rows.findIndex((r) => r.id === row.id);
                    return (
                        <IndeterminateCheckbox
                            {...{
                                checked: row.getIsSelected(),
                                disabled: !row.getCanSelect(),
                                indeterminate: row.getIsSomeSelected(),
                                onChange: (e) => {
                                    if (visualIndex >= 0) {
                                        lastSelectionAnchorRef.current =
                                            visualIndex;
                                    }
                                    row.getToggleSelectedHandler()(e);
                                },
                            }}
                        />
                    );
                },
                size: 44,
                enableResizing: false,
                enableSorting: false,
            },
            {
                id: 'flagged',
                accessorKey: 'flagged',
                header: () => (
                    <FlagOutlineIcon
                        className="size-4 text-white/50"
                        aria-hidden
                    />
                ),
                cell: ({ row }) => {
                    const flagged = row.original.flagged;
                    return (
                        <button
                            type="button"
                            className="flex h-11 w-full min-w-[2.75rem] items-center justify-center"
                            aria-label={flagged ? 'Unflag' : 'Flag'}
                            onClick={(e) => {
                                e.stopPropagation();
                                void updateApplicantById(row.original.id, {
                                    flagged: !flagged,
                                });
                            }}
                        >
                            {flagged ? (
                                <FlagIcon className="text-caution-500 size-5" />
                            ) : null}
                        </button>
                    );
                },
                size: 56,
                minSize: 56,
                enableResizing: false,
                enableSorting: false,
                enableColumnFilter: false,
            },
            {
                id: 'applicantName',
                accessorFn: (row) =>
                    `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
                header: 'Applicant Name',
                size: 175,
                minSize: 120,
                cell: ({ row, getValue }) => {
                    const name = getValue<string>() || '—';
                    return (
                        <button
                            type="button"
                            className="text-brand-300 max-w-full truncate text-left text-base hover:underline"
                            title={name}
                            onClick={() => {
                                onOpenSideCard(
                                    applicationDataMap.get(row.original.id)
                                );
                                onRowClick?.(row.original, row.index);
                            }}
                        >
                            {name}
                        </button>
                    );
                },
            },
            {
                id: 'teamName',
                accessorKey: 'teamName',
                header: 'Team Name',
                size: 160,
                minSize: 100,
                sortingFn: (rowA, rowB, columnId) => {
                    const a = String(rowA.getValue(columnId) ?? '').trim();
                    const b = String(rowB.getValue(columnId) ?? '').trim();
                    // Keep applicants without a team after named teams (A–Z).
                    if (!a && !b) return 0;
                    if (!a) return 1;
                    if (!b) return -1;
                    return a.localeCompare(b, undefined, {
                        sensitivity: 'base',
                    });
                },
                cell: ({ getValue }) => (
                    <span className="truncate text-base text-white">
                        {(getValue<string>() || '—') as string}
                    </span>
                ),
            },
            ...(showLocationColumn
                ? [
                      {
                          accessorKey: 'eventLocation',
                          header: 'Loc.',
                          size: 80,
                          minSize: 64,
                          cell: (info: { getValue: () => unknown }) => {
                              const v = (info.getValue() as string) ?? '';
                              return (
                                  <span className="block max-w-full" title={v}>
                                      {v || '—'}
                                  </span>
                              );
                          },
                      } as ColumnDef<Applicant>,
                  ]
                : []),
            {
                accessorKey: 'pendingStatus',
                header: 'Pending Status',
                size: 180,
                minSize: 160,
                enableColumnFilter: true,
                filterFn: (row, columnId, filterValue) => {
                    if (filterValue == null || filterValue === '') return true;
                    return row.getValue(columnId) === filterValue;
                },
                cell: ({ row, getValue }) => (
                    <PendingStatusSelect
                        value={getValue<string>()}
                        currentStatus={row.original.currentStatus}
                        acceptPendingStatus="Accepted - RSVP to Confirm"
                        disabled={isPendingUpdate}
                        readOnly={row.original.currentStatus === 'Accepted'}
                        onChange={(next) => {
                            void updateApplicantById(row.original.id, {
                                pendingStatus: next,
                            });
                        }}
                    />
                ),
            },
            {
                accessorKey: 'currentStatus',
                header: 'Current Status',
                size: 180,
                minSize: 160,
                enableColumnFilter: true,
                filterFn: (row, columnId, filterValue) => {
                    if (filterValue == null || filterValue === '') return true;
                    const allowed = Array.isArray(filterValue)
                        ? filterValue
                        : resolveCurrentStatusFilterValues(String(filterValue));
                    return allowed.includes(String(row.getValue(columnId)));
                },
                cell: ({ getValue }) => (
                    <CurrentStatusCell value={getValue<string>()} />
                ),
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 180,
                minSize: 140,
                cell: ({ getValue }) => (
                    <span className="truncate text-base text-white">
                        {getValue<string>() || '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'lastEmailSent',
                header: 'Last Email Sent',
                size: 180,
                minSize: 140,
            },
            {
                accessorKey: 'applicationDate',
                header: 'Application Date',
                size: 150,
                minSize: 120,
                cell: (info) =>
                    dayjs(info.getValue() as Date).format('MM-DD HH:mm'),
            },
            ...extraColumns,
        ];
        return columns;
    }, [
        showLocationColumn,
        extraColumns,
        isPendingUpdate,
        updateApplicantById,
        onOpenSideCard,
        applicationDataMap,
        onRowClick,
        lastSelectionAnchorRef,
    ]);
}
