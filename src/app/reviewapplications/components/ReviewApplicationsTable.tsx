'use client';

import { trpc } from '@/trpc/client';
import { Fragment, useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { makeData } from './makeData';

import { atom } from 'jotai';
import { useAtom } from 'jotai';

const sideCardAtom = atom<Applicant>({});
export { sideCardAtom };

export type Applicant = {
    id: number;
    name: string;
    status: string;
    applicationDate: Date;
    email: string;
    major: string;
    enrollmentYear: number;
    participantType: string;
    teamMemberNames: string[];
    discordUsername: string;
    attendancePeriod: string;
    attendingWorkshops: string[];
    photoConsent: boolean;
    questions: string;
};

type ReviewApplicationsTableProps = {
    toggleSideCard: () => void;
};

export default function ReviewApplicationsTable({
    toggleSideCard,
}: ReviewApplicationsTableProps) {
    const [sideCardInfo, setSideCardInfo] = useAtom(sideCardAtom);
    const [data] = useState(makeData(50));

    const defaultColumns: ColumnDef<Applicant>[] = [
        {
            accessorKey: 'name',
            header: () => 'Name',
            cell: (info) => info.getValue(),
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const value = info.getValue<string>();
                return (
                    <span
                        className={`px-3 py-0.5 text-xs rounded-md ${
                            value === 'Accepted'
                                ? 'bg-success-950 text-success-300'
                                : value === 'Pending'
                                  ? 'bg-yellow-950 text-yellow-300'
                                  : 'bg-danger-950 text-danger-300'
                        }`}
                    >
                        {value}
                    </span>
                );
            },
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'email',
            header: () => 'Email',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'major',
            header: () => 'Major',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'enrollmentYear',
            header: () => 'Enrollment Year',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'participantType',
            header: () => 'Participant Type',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'teamMemberNames',
            header: () => 'Team Member Names',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'discordUsername',
            header: () => 'Discord Username',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'attendancePeriod',
            header: () => 'Attendance Period',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'attendingWorkshops',
            header: () => 'Attending Workshops',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'photoConsent',
            header: () => 'Photo Consent',
            footer: (props) => props.column.id,
        },
        {
            accessorKey: 'questions',
            header: () => 'Questions',
            footer: (props) => props.column.id,
        },
    ];
    const [columns] = useState<typeof defaultColumns>(() => [
        ...defaultColumns,
    ]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className=" bg-neutral-900 rounded-xl overflow-hidden">
            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="text-left w-full">
                    <thead className="bg-neutral-700 text-gray-200 whitespace-nowrap">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={`px-4 py-4 text-sm ${
                                            index === 0
                                                ? 'sticky left-0 z-20 bg-neutral-700'
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
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <Fragment key={row.id}>
                                <tr
                                    className="cursor-pointer hover:bg-gray-800"
                                    onClick={() => {
                                        toggleSideCard();
                                        setSideCardInfo(row.original);
                                    }}
                                >
                                    {row
                                        .getVisibleCells()
                                        .map((cell, index) => (
                                            <td
                                                key={cell.id}
                                                className={`border-b border-gray-700 text-sm px-4 py-4 ${
                                                    index === 0
                                                        ? 'sticky left-0 z-10 bg-neutral-850'
                                                        : ''
                                                }`}
                                            >
                                                <div className="truncate max-w-32">
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext()
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                </tr>
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center px-4 py-4 bg-neutral-800">
                <div>
                    <button
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {'<'}
                    </button>
                    <button
                        className="px-4 py-2 ml-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {'>'}
                    </button>
                </div>
                <select
                    className="px-4 py-2 text-sm bg-neutral-700 text-white rounded-md"
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
