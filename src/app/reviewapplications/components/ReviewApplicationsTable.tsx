'use client';

import { trpc } from '@/trpc/client';
import { Fragment, HTMLProps, useEffect, useRef, useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { makeData } from './makeData';

import { sideCardAtom } from '@/app/reviewapplications/page';
import { useAtom } from 'jotai';
import { Input } from '@/components/ui/input';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import SideCard from '@/app/reviewapplications/components/SideCard';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

const validEmailTypes = ['WELCOMEJH2025', 'WAITLISTJH2025', 'REJECTJH2025'];

export type Applicant = {
    id: number;
    status: string;
    tempStatus: string;
    applicationDate: Date;
    name: string;
    studentNumber: number;
    email: string;
    major: string;
    enrollmentYear: number;
    participantType: string;
    teamMemberNames: string[];
    dietaryRestrictions: string[];
    photoConsent: boolean;
};

type ReviewApplicationsTableProps = {
    toggleSideCard: () => void;
};

export default function ReviewApplicationsTable({
    toggleSideCard,
}: ReviewApplicationsTableProps) {
    const sendEmail = trpc.emails.sendEmail.useMutation();
    const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
    const [emailType, setEmailType] = useState('');
    const { toast } = useToast();

    const toggleEmailPopup = () => {
        setIsEmailPopupOpen(!isEmailPopupOpen);
    };

    const handleSendingEmails = async (rows: any, type: string) => {
        try {
            const rowData = rows.map((row: any) => ({
                id: row.original.id,
                name: row.original.name,
                email: row.original.email,
            }));
            for (let i = 0; i < rowData.length; i++) {
                sendEmail.mutate({
                    type: type,
                    user: {
                        id: rowData[i].id,
                        email: rowData[i].email,
                        name: rowData[i].name,
                    },
                });
            }
            toast({
                description: 'Emails Sent!',
                className: 'bg-neutral-900 text-white border-neutral-700/18',
            });
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    const tempDummy = [
        {
            id: 123456,
            status: 'Accepted',
            tempStatus: 'Pending',
            applicationDate: new Date('2024-12-12T10:15:30.000Z'),
            name: 'Brendan Shen',
            email: 'brendanshen@hotmail.com',
            studentNumber: 987654321,
            major: 'Computer Science',
            enrollmentYear: 2021,
            participantType: 'Individual',
            teamMemberNames: ['Alice', 'Bob', 'Charlie'],
            dietaryRestrictions: ['Vegetarian'],
            photoConsent: true,
        },
        {
            id: 789012,
            status: 'Rejected',
            tempStatus: 'Rejected',
            applicationDate: new Date('2024-11-30T14:20:15.000Z'),
            name: 'Brendan Gmail',
            email: 'brendanshen1256@gmail.com',
            studentNumber: 123456789,
            major: 'Engineering',
            enrollmentYear: 2023,
            participantType: 'Individual looking for a team',
            teamMemberNames: ['David', 'Eve', 'Frank'],
            dietaryRestrictions: ['Halal'],
            photoConsent: false,
        },
        {
            id: 345678,
            status: 'Waitlisted',
            tempStatus: 'Waitlisted',
            applicationDate: new Date('2024-10-01T08:45:00.000Z'),
            name: 'Brendan SFU',
            email: 'bqs1@sfu.ca',
            studentNumber: 456123789,
            major: 'Math',
            enrollmentYear: 2020,
            participantType: 'Team (4 max)',
            teamMemberNames: ['Grace', 'Heidi', 'Ivan'],
            dietaryRestrictions: ['Vegan'],
            photoConsent: true,
        },
    ];

    const [sideCardInfo, setSideCardInfo] = useAtom(sideCardAtom);
    //const [data] = useState(makeData(50));
    const [data] = useState(tempDummy);

    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});

    function IndeterminateCheckbox({
        indeterminate,
        className = '',
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
            <input
                type="checkbox"
                ref={ref}
                className={`${className} cursor-pointer`}
                {...rest}
                onClick={(e) => e.stopPropagation()} // Prevents the row click event
            />
        );
    }

    const defaultColumns: ColumnDef<Applicant>[] = [
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
            cell: ({ row }) => (
                <div className="bg-neutral-800/60">
                    <IndeterminateCheckbox
                        {...{
                            checked: row.getIsSelected(),
                            disabled: !row.getCanSelect(),
                            indeterminate: row.getIsSomeSelected(),
                            onChange: row.getToggleSelectedHandler(),
                        }}
                    />
                </div>
            ),
            size: 50,
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <span
                    className="cursor-pointer"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Name{' '}
                    {column.getIsSorted()
                        ? column.getIsSorted() === 'desc'
                            ? ' ↓'
                            : ' ↑'
                        : ''}
                </span>
            ),
            cell: (info) => info.getValue(),
            // footer: (props) => props.column.id,
            size: 150, // Initial width
            minSize: 100, // Minimum width
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
                                : value === 'Waitlisted'
                                  ? 'bg-yellow-950 text-yellow-300'
                                  : 'bg-danger-950 text-danger-300'
                        }`}
                    >
                        {value}
                    </span>
                );
            },
            // footer: (props) => props.column.id,
            size: 120,
            minSize: 120,
        },
        {
            accessorKey: 'tempStatus',
            header: () => 'Temporary Status',
            cell: (info) => {
                const value = info.getValue<string>();
                return (
                    <span
                        className={`px-3 py-0.5 text-xs rounded-md ${
                            value === 'Accepted'
                                ? 'bg-success-950 text-success-300'
                                : value === 'Waitlisted'
                                  ? 'bg-yellow-950 text-yellow-300'
                                  : 'bg-danger-950 text-danger-300'
                        }`}
                    >
                        {value}
                    </span>
                );
            },
            // footer: (props) => props.column.id,
            size: 150,
            minSize: 150,
        },
        {
            accessorKey: 'applicationDate',
            header: () => 'Application Date',
            // footer: (props) => props.column.id,
            size: 200,
            minSize: 150,
        },
        {
            accessorKey: 'email',
            header: () => 'Email',
            // footer: (props) => props.column.id,
            size: 200,
            minSize: 150,
        },
        {
            accessorKey: 'studentNumber',
            header: () => 'Student Number',
            // footer: (props) => props.column.id,
            size: 200,
            minSize: 150,
        },
        {
            accessorKey: 'major',
            header: () => 'Major',
            // footer: (props) => props.column.id,
            size: 150,
            minSize: 100,
        },
        {
            accessorKey: 'enrollmentYear',
            header: () => 'Enrollment Year',
            // footer: (props) => props.column.id,
            size: 150,
            minSize: 150,
        },
        {
            accessorKey: 'participantType',
            header: () => 'Participant Type',
            // footer: (props) => props.column.id,
            size: 150,
            minSize: 100,
        },
        {
            accessorKey: 'teamMemberNames',
            header: () => 'Team Member Names',
            // footer: (props) => props.column.id,
            size: 200,
            minSize: 150,
        },
        {
            accessorKey: 'dietaryRestrictions',
            header: () => 'Dietary Restrictions',
            // footer: (props) => props.column.id,
            size: 200,
            minSize: 150,
        },
        {
            accessorKey: 'photoConsent',
            header: () => 'Photo Consent',
            // footer: (props) => props.column.id,
            size: 150,
            minSize: 100,
        },
    ];
    const [columns] = useState<typeof defaultColumns>(() => [
        ...defaultColumns,
    ]);

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
            rowSelection,
        },
        columnResizeMode: 'onChange',
        enableColumnResizing: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableRowSelection: true,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
    });

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        filename: 'Data',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
    });

    const exportExcel = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const rowData = selectedRows.map((row) => ({
            id: row.original.id,
            name: row.original.name,
            status: row.original.status,
            applicationDate: row.original.applicationDate.toISOString(),
            email: row.original.email,
            major: row.original.major,
            enrollmentYear: row.original.enrollmentYear,
            participantType: row.original.participantType,
            teamMemberNames: row.original.teamMemberNames.join(', '),
            dietaryRestrictions: row.original.dietaryRestrictions.join(', '),
            photoConsent: row.original.photoConsent ? 'Yes' : 'No',
        }));

        if (rowData.length === 0) {
            alert(
                'No rows selected. Please select at least one row to export.'
            );
            return;
        }

        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    return (
        <div className=" bg-neutral-900 rounded-xl overflow-hidden">
            {/* Global Search */}
            <div className="flex p-4 gap-3 justify-center">
                <Input
                    type="text"
                    placeholder="Global Search..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="bg-neutral-800 text-white border border-neutral-700/18 w-full"
                />

                <button
                    className="px-4 py-2 text-sm bg-neutral-800/60 text-white rounded-md whitespace-nowrap"
                    type="button"
                    onClick={() => exportExcel()}
                >
                    Export to CSV
                </button>

                <button
                    className="px-4 py-2 text-sm bg-neutral-800/60 text-white rounded-md whitespace-nowrap"
                    type="button"
                    onClick={() => toggleEmailPopup()}
                >
                    Send Emails
                </button>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table
                    className="text-left w-full"
                    style={{ tableLayout: 'fixed', width: '100%' }}
                >
                    <thead className="bg-neutral-900 text-gray-200 whitespace-nowrap">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        style={{
                                            width: header.getSize(),
                                            minWidth:
                                                header.column.columnDef.minSize,
                                        }}
                                        className={`relative px-4 py-4 text-sm ${
                                            index === 0
                                                ? 'sticky left-0 z-20 bg-neutral-900' // First column
                                                : index === 1
                                                  ? 'sticky left-[50px] z-20 bg-neutral-900' // Second column
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
                                        {header.column.getCanResize() && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize ${
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
                                                style={{
                                                    width: cell.column.getSize(),
                                                    minWidth:
                                                        cell.column.columnDef
                                                            .minSize,
                                                }}
                                                className={`border-b border-neutral-600/30 text-sm px-4 py-4 bg-neutral-800/60 ${
                                                    index === 0
                                                        ? 'sticky left-0 z-10 bg-neutral-800' // First column
                                                        : index === 1
                                                          ? 'sticky left-[50px] z-10 bg-neutral-800' // Second column
                                                          : ''
                                                }`}
                                            >
                                                <div
                                                    className="truncate"
                                                    style={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                    }}
                                                >
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

            {/*Footer*/}
            <div className="flex flex-col gap-4 px-4 py-4 bg-neutral-900">
                <div className="flex justify-between items-center gap-2">
                    <div className="text-sm text-white">
                        {Object.keys(rowSelection).length} of{' '}
                        {table.getPreFilteredRowModel().rows.length} Rows
                        Selected
                    </div>

                    <div className="flex flex-row items-center gap-1">
                        <header>Rows per page:</header>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                table.setPageSize(Number(e.target.value));
                            }}
                            className="px-4 py-2 text-sm bg-neutral-800/60 text-white rounded-md"
                        >
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-row items-center gap-5">
                        <div className="flex  items-center gap-1">
                            <div className="flex items-center gap-1">
                                Page:
                                <input
                                    type="number"
                                    min="1"
                                    max={table.getPageCount()}
                                    value={
                                        table.getState().pagination.pageIndex +
                                        1
                                    } // Bind to the current page index
                                    onChange={(e) => {
                                        const page = e.target.value
                                            ? Number(e.target.value) - 1
                                            : 0;
                                        table.setPageIndex(page);
                                    }}
                                    className="text-center pl-3 py-2 text-sm bg-neutral-800/60 text-white rounded-md"
                                />
                            </div>
                            <span className="flex items-center gap-1">
                                of {table.getPageCount()}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                className=""
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {'<<'}
                            </button>
                            <button
                                className=""
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {'<'}
                            </button>
                            <button
                                className=""
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                {'>'}
                            </button>
                            <button
                                className=""
                                onClick={() =>
                                    table.setPageIndex(table.getPageCount() - 1)
                                }
                                disabled={!table.getCanNextPage()}
                            >
                                {'>>'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/*Send Email Popup*/}
            {isEmailPopupOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                    onClick={() => setIsEmailPopupOpen(false)}
                >
                    <div
                        className="flex flex-col rounded-xl bg-neutral-900 text-white p-10 gap-4 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <RadioGroup
                            value={emailType}
                            onValueChange={setEmailType}
                        >
                            <Label className="text-white/60 mb-2">
                                Which template do you want to use?
                            </Label>
                            <div className="flex flex-col gap-2 w-full">
                                {validEmailTypes.map((type) => (
                                    <div
                                        className={`flex items-center space-x-2 px-4 py-3 rounded-lg cursor-pointer border ${
                                            emailType === type
                                                ? 'bg-brand-950/60 border-brand-900'
                                                : 'bg-neutral-800/60 border-neutral-600/60'
                                        }`}
                                        key={type}
                                        onClick={() => setEmailType(type)}
                                    >
                                        <RadioGroupItem
                                            value={type}
                                            id={type}
                                            onChange={() => setEmailType(type)}
                                            className={`appearance-none w-5 h-5 rounded-full border ${
                                                emailType === type
                                                    ? 'bg-brand-500 border-blue-800'
                                                    : 'bg-neutral-700 border-neutral-500'
                                            }`}
                                        />
                                        <Label
                                            htmlFor={type}
                                            className="cursor-pointer text-white font-light"
                                        >
                                            {type}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                        <button
                            className="px-4 py-2 text-sm bg-neutral-800/60 text-white rounded-md whitespace-nowrap hover:bg-neutral-700/60"
                            type="button"
                            onClick={() =>
                                handleSendingEmails(
                                    table.getSelectedRowModel().rows,
                                    emailType
                                )
                            }
                        >
                            Send Emails
                        </button>
                    </div>
                    <Toaster />
                </div>
            )}
        </div>
    );
}
