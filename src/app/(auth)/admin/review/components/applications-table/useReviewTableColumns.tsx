'use client';

import { useMemo, type MutableRefObject } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { FlagIcon as FlagOutlineIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { FlagIcon } from '@heroicons/react/24/solid';
import type { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import type { StatusEnum } from '@/db/schema/applications';
import { getAcceptPendingStatusForEventLocation } from '@/lib/applicationAcceptStatus';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    onRowClick?: (app: Applicant) => void;
    onOpenSideCard: (app: ApplicationWithTeamInfo | undefined) => void;
    updateApplicantById: (
        userId: number,
        patch: {
            status?: StatusEnum;
            pendingStatus?: StatusEnum;
            flagged?: boolean;
            hsFlagged?: boolean;
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
                accessorFn: (row) => (row.hsFlagged ? 2 : row.flagged ? 1 : 0),
                header: () => null,
                cell: ({ row }) => {
                    const { flagged, hsFlagged } = row.original;
                    const ariaLabel = hsFlagged
                        ? 'Under 19 flag'
                        : flagged
                          ? 'Flagged'
                          : 'Set flag';

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-11 w-full min-w-[2.75rem] items-center justify-center"
                                    aria-label={ariaLabel}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {hsFlagged ? (
                                        <ShieldCheckIcon className="text-danger-400 size-5" />
                                    ) : flagged ? (
                                        <FlagIcon className="text-caution-500 size-5" />
                                    ) : (
                                        <FlagOutlineIcon className="size-5 text-white/40 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 data-[state=open]:opacity-100" />
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                sideOffset={4}
                                className="z-[100] w-[160px] rounded-lg border-neutral-600/30 bg-neutral-900 p-1 text-white shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.04),0px_4px_6px_-2px_rgba(0,0,0,0.12),0px_12px_16px_-4px_rgba(0,0,0,0.08)]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DropdownMenuItem
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-white focus:bg-neutral-800 focus:text-white"
                                    onSelect={() => {
                                        void updateApplicantById(
                                            row.original.id,
                                            {
                                                flagged: true,
                                                hsFlagged: false,
                                            }
                                        );
                                    }}
                                >
                                    <FlagIcon className="text-caution-500 size-4 shrink-0" />
                                    Flagged
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-white focus:bg-neutral-800 focus:text-white"
                                    onSelect={() => {
                                        void updateApplicantById(
                                            row.original.id,
                                            {
                                                flagged: false,
                                                hsFlagged: true,
                                            }
                                        );
                                    }}
                                >
                                    <ShieldCheckIcon className="text-danger-400 size-4 shrink-0" />
                                    Under 19
                                </DropdownMenuItem>
                                {(flagged || hsFlagged) && (
                                    <DropdownMenuItem
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-white focus:bg-neutral-800 focus:text-white"
                                        onSelect={() => {
                                            void updateApplicantById(
                                                row.original.id,
                                                {
                                                    flagged: false,
                                                    hsFlagged: false,
                                                }
                                            );
                                        }}
                                    >
                                        <FlagOutlineIcon className="size-4 shrink-0 text-white/50" />
                                        Remove flag
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                onRowClick?.(row.original);
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
                    const cell = String(row.getValue(columnId) ?? '');
                    // N/A is "Under review"; include legacy Awaiting Review pending values
                    if (filterValue === 'N/A') {
                        return cell === 'N/A' || cell === 'Awaiting Review';
                    }
                    return cell === filterValue;
                },
                cell: ({ row, getValue }) => (
                    <PendingStatusSelect
                        value={getValue<string>()}
                        acceptPendingStatus={getAcceptPendingStatusForEventLocation(
                            row.original.eventLocationKey
                        )}
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
