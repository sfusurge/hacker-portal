'use client';

import { trpc } from '@/trpc/client';
import {
    Fragment,
    HTMLProps,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
} from '@tanstack/react-table';

import { atom, useAtomValue, useSetAtom } from 'jotai';

import { Input } from '@/components/ui/input';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { EnvelopeIcon } from '@heroicons/react/16/solid';
import dayjs from 'dayjs';
import { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import { hackathonAtom } from '@/app/(auth)/ClientContext';

export type Applicant = {
    id: number;
    teamName: string | null;

    // Basic Information
    firstName: string;
    lastName: string;
    pronouns: string;
    email: string;
    haveHackathonExperience: string[];
    howHeardAbout: string[];
    dietaryRestrictions?: string[];
    tShirtSize: string;
    resume?: string;
    discord: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    otherLinks?: string;

    // School Information
    school?: string;
    background: string;
    yearOfStudy?: string;
    major: string;

    // Short Answer Questions
    excitement: string;
    problemOrSkill: string;
    dreamProject: string;

    // Team Information
    teamMember1?: string;
    teamMember2?: string;
    teamMember3?: string;
    teamMember4?: string;

    // Sponsors / Agreements
    shareResume: boolean;
    acceptMLH: boolean;
    acceptSFSS: boolean;
    acceptEmails: boolean;
    authorizeMLH: boolean;
    photoRelease: boolean;
    currentStatus: string;
    pendingStatus: string;
    applicationDate: Date;

    checkIns: {
        eventId: number;
        eventTitle: string;
        checkedIn: boolean;
    }[];
};

type ReviewApplicationsTableProps = {
    toggleSideCard: () => void;
};

export const sideCardAtomSJ = atom<ApplicationWithTeamInfo>();

export default function ReviewApplicationsTable({
    toggleSideCard,
}: ReviewApplicationsTableProps) {
    const setSideCardInfo = useSetAtom(sideCardAtomSJ);

    const sendEmail = trpc.emails.sendEmail.useMutation();
    const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
        null
    );
    const { toast } = useToast();

    // Fetch email templates
    const { data: emailTemplates, isLoading: templatesLoading } =
        trpc.emailTemplates.getEmailTemplates.useQuery();

    // Email popup state toggle
    const toggleEmailPopup = () => {
        setIsEmailPopupOpen(!isEmailPopupOpen);
    };

    const updateApplicationStatus =
        trpc.applications.updateApplication.useMutation();

    //sends emails to selected users
    const handleSendingEmails = async (rows: any) => {
        try {
            if (!selectedTemplateId) {
                toast({
                    title: 'Error',
                    description: 'Please select an email template',
                    variant: 'default',
                });
                return;
            }

            setIsSending(true);

            const rowData = rows.map((row: any) => {
                return {
                    id: row.original.id,
                    firstName: row.original.firstName,
                    lastName: row.original.lastName,
                    email: row.original.email,
                    pendingStatus: row.original.pendingStatus,
                    currentStatus: row.original.currentStatus,
                };
            });

            let successCount = 0;
            let failureCount = 0;
            let statusUpdateCount = 0;

            for (let i = 0; i < rowData.length; i++) {
                try {
                    // Send email
                    await sendEmail.mutateAsync({
                        templateId: selectedTemplateId,
                        user: {
                            id: rowData[i].id,
                            email: rowData[i].email,
                            firstName: rowData[i].firstName,
                            lastName: rowData[i].lastName,
                        },
                    });

                    const status = rowData[i].pendingStatus;

                    if (
                        status !== 'N/A' &&
                        rowData[i].currentStatus !== 'Accepted'
                    ) {
                        await updateApplicationStatus.mutateAsync({
                            userId: rowData[i].id,
                            hackathonId: hackathon?.id!,
                            status: status,
                        });
                        statusUpdateCount++;
                    }

                    successCount++;
                } catch (error) {
                    console.error(
                        `Error sending email to ${rowData[i].email}:`,
                        error
                    );
                    failureCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: 'Success',
                    description: `${successCount} email${successCount !== 1 ? 's' : ''} sent successfully${failureCount > 0 ? ` (${failureCount} failed)` : ''}${statusUpdateCount > 0 ? ` and ${statusUpdateCount} status${statusUpdateCount !== 1 ? 'es' : ''} updated` : ''}`,
                    className:
                        'bg-neutral-900 text-white border-neutral-700/18',
                });

                applicationData.refetch();
            } else if (failureCount > 0) {
                toast({
                    title: 'Error',
                    description: `Failed to send ${failureCount} email${failureCount !== 1 ? 's' : ''}. Check console for details.`,
                    variant: 'default',
                });
            }

            setIsEmailPopupOpen(false);
            setIsSending(false);
        } catch (error) {
            console.error('Error in email sending process:', error);
            toast({
                title: 'Error',
                description:
                    'Failed to send emails. Check console for details.',
                variant: 'default',
            });
            setIsSending(false);
        }
    };

    const hackathon = useAtomValue(hackathonAtom);

    // Get data from DB
    const applicationData = trpc.applications.getApplications.useQuery({
        hackathonId: hackathon?.id!,
        maxResult: 2000,
    });

    const applicationDataMap = useMemo(() => {
        const map = new Map<number, ApplicationWithTeamInfo>();
        if (!applicationData.data) {
            return map;
        }

        for (const appData of applicationData.data) {
            map.set(appData.userId, appData);
        }

        return map;
    }, [applicationData]);

    // Data state
    const [data, setData] = useState<Applicant[]>([]);

    //Change data state on update of DB
    useEffect(() => {
        if (applicationData.data) {
            const transformed = transformResponse(applicationData.data);
            setData(transformed);
        }
    }, [applicationData.data]);

    // Filters and sorting
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [sorting, setSorting] = useState<SortingState>([
        // sort by people with a team first
        { id: 'teamName', desc: true },
    ]);
    const [rowSelection, setRowSelection] = useState({});

    const checkedInInfoColumns: ColumnDef<Applicant>[] =
        data[0]?.checkIns?.map(({ eventTitle, checkedIn }, i) => {
            return {
                accessorFn: () => (checkedIn ? 'Yes' : 'No'),
                header: eventTitle,
                size: 100,
            };
        }) ?? [];

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
            id: 'teamName',
            accessorKey: 'teamName',
            header: 'Team Name',
            size: 200,
            minSize: 100,
        },
        {
            accessorKey: 'firstName',
            header: 'First Name',
            size: 150,
            minSize: 100,
        },
        {
            accessorKey: 'lastName',
            header: 'Last Name',
            size: 150,
            minSize: 100,
        },
        {
            accessorKey: 'members',
            header: 'Team Members',
            size: 200,
            minSize: 100,
            cell: (info) => (info.getValue() as string[]).join(', '),
        },
        {
            accessorKey: 'currentStatus',
            header: 'Current Status',
            cell: (info) => {
                const value = info.getValue<string>();
                return (
                    <span
                        className={`rounded-md px-3 py-0.5 text-xs ${
                            value === 'Accepted' ||
                            value === 'Accepted - Pending Payment'
                                ? 'bg-success-950 text-success-300'
                                : value === 'Wait List'
                                  ? 'bg-yellow-950 text-yellow-300'
                                  : value === 'Declined'
                                    ? 'bg-danger-950 text-danger-300'
                                    : 'bg-neutral-600/30'
                        }`}
                    >
                        {value}
                    </span>
                );
            },
            size: 200,
            minSize: 200,
        },
        {
            accessorKey: 'pendingStatus',
            header: 'Pending Status',
            cell: (info) => {
                const value = info.getValue<string>();
                return (
                    <span
                        className={`rounded-md px-3 py-0.5 text-xs ${
                            value === 'Accepted' ||
                            value === 'Accepted - Pending Payment'
                                ? 'bg-success-950 text-success-300'
                                : value === 'Wait List'
                                  ? 'bg-yellow-950 text-yellow-300'
                                  : value === 'Declined'
                                    ? 'bg-danger-950 text-danger-300'
                                    : 'bg-neutral-600/30'
                        }`}
                    >
                        {value}
                    </span>
                );
            },
            size: 150,
            minSize: 150,
        },
        {
            accessorKey: 'applicationDate',
            header: 'Date',
            size: 100,
            minSize: 100,
            cell: (info) => dayjs(info.getValue() as Date).format('MMM DD'),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 225,
            minSize: 150,
        },
        {
            accessorKey: 'discord',
            header: 'Discord',
            size: 150,
            minSize: 100,
        },
        {
            accessorKey: 'school',
            header: 'School',
            size: 225,
            minSize: 150,
        },
        {
            accessorKey: 'major',
            header: 'Major',
            size: 200,
            minSize: 150,
        },
        {
            accessorKey: 'yearOfStudy',
            header: 'Year',
            size: 120,
            minSize: 100,
        },
        {
            accessorKey: 'haveHackathonExperience',
            header: 'Hackathon Experience',
            size: 200,
            minSize: 150,
        },
        {
            accessorKey: 'howHeardAbout',
            header: 'How Heard About',
            size: 200,
            minSize: 150,
            cell: (info) => (info.getValue() as string[]).join(', '),
        },
        {
            accessorKey: 'dietaryRestrictions',
            header: 'Dietary Restrictions',
            size: 200,
            minSize: 150,
            cell: (info) => (info.getValue() as string[]).join(', '),
        },
        {
            accessorKey: 'tShirtSize',
            header: 'T-Shirt Size',
            size: 120,
            minSize: 100,
        },
        {
            accessorKey: 'resume',
            header: 'Resume',
            size: 200,
            minSize: 150,
            cell: (info) => {
                const url = info.getValue() as string | undefined;
                return url ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                    >
                        View
                    </a>
                ) : (
                    'N/A'
                );
            },
        },
        ...checkedInInfoColumns,
    ];

    const table = useReactTable({
        data,
        columns: defaultColumns,
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

    const [iniload, setIniload] = useState(true);
    useEffect(() => {
        if (!iniload || data.length === 0) {
            return;
        }
        // TODO remove this jank
        if (localStorage.getItem('pagesize')) {
            table.setPageSize(parseInt(localStorage.getItem('pagesize')!));
        }
        if (localStorage.getItem('pageindex')) {
            table.setPageIndex(parseInt(localStorage.getItem('pageindex')!));
        }
        setIniload(false);
    }, [data, iniload]);

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        filename: 'Data',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
    });

    const exportExcel = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const tempData = selectedRows.map(({ original }) => {
            const { applicationDate, checkIns, ...rest } = original;
            return {
                ...rest,
                haveHackathonExperience:
                    original.haveHackathonExperience?.join(', '),
                howHeardAbout: original.howHeardAbout?.join(', '),
                dietaryRestrictions: original.dietaryRestrictions?.join(', '),
            };
        });

        if (tempData.length === 0) {
            alert(
                'No rows selected. Please select at least one row to export.'
            );
            return;
        }

        const csv = generateCsv(csvConfig)(tempData);
        download(csvConfig)(csv);
    };

    if (applicationData.isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p>Loading data...</p>
            </div>
        );
    }

    if (applicationData.isError) {
        return (
            <div className="flex h-full items-center justify-center">
                <p>Error fetching data: {applicationData.error.message}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            {/* Global Search */}
            <div className="flex justify-center gap-3 p-4">
                <Input
                    type="text"
                    placeholder="Global Search..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full border border-neutral-700/18 bg-neutral-800 text-white"
                />
            </div>

            {/* Scrollable table */}
            <div className="w-full rounded-xl bg-neutral-900 p-1">
                <div className="overflow-x-auto">
                    <table
                        className="w-full text-left"
                        style={{ tableLayout: 'fixed', width: '100%' }}
                    >
                        <thead className="bg-neutral-900 whitespace-nowrap text-gray-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(
                                        (header, index) => (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{
                                                    width: header.getSize(),
                                                    minWidth:
                                                        header.column.columnDef
                                                            .minSize,
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
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext()
                                                      )}
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
                                        )
                                    )}
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
                                            setSideCardInfo(
                                                applicationDataMap.get(
                                                    row.original.id
                                                )
                                            );
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
                                                            cell.column
                                                                .columnDef
                                                                .minSize,
                                                    }}
                                                    className={`border-b border-neutral-600/30 bg-neutral-800 px-4 py-4 text-sm ${
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
                                                            whiteSpace:
                                                                'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
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
                <div className="flex flex-col gap-4 bg-neutral-900 px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
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
                                    table.setPageSize(parseInt(e.target.value));
                                    localStorage.setItem(
                                        'pagesize',
                                        e.target.value
                                    );
                                }}
                                className="rounded-md bg-neutral-800/60 px-4 py-2 text-sm text-white"
                            >
                                {[10, 20, 30, 40, 50, 100, 150, 200].map(
                                    (pageSize) => (
                                        <option key={pageSize} value={pageSize}>
                                            {pageSize}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="flex flex-row items-center gap-5">
                            <div className="flex items-center gap-1">
                                <div className="flex items-center gap-1">
                                    Page:
                                    <input
                                        type="number"
                                        min="1"
                                        max={table.getPageCount()}
                                        value={
                                            table.getState().pagination
                                                .pageIndex + 1
                                        } // Bind to the current page index
                                        onChange={(e) => {
                                            const page = e.target.value
                                                ? Number(e.target.value) - 1
                                                : 0;
                                            table.setPageIndex(page);
                                        }}
                                        className="rounded-md bg-neutral-800/60 py-2 pl-3 text-center text-sm text-white"
                                    />
                                </div>
                                <span className="flex items-center gap-1">
                                    of {table.getPageCount()}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    className=""
                                    onClick={() => {
                                        table.setPageIndex(0);
                                        localStorage.setItem(
                                            'pageindex',
                                            `${0}`
                                        );
                                    }}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<<'}
                                </button>
                                <button
                                    className=""
                                    onClick={() => {
                                        table.previousPage();
                                        localStorage.setItem(
                                            'pageindex',
                                            `${table.getState().pagination.pageIndex - 1}`
                                        );
                                    }}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<'}
                                </button>
                                <button
                                    className=""
                                    onClick={() => {
                                        table.nextPage();
                                        localStorage.setItem(
                                            'pageindex',
                                            `${table.getState().pagination.pageIndex + 1}`
                                        );
                                    }}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'>'}
                                </button>
                                <button
                                    className=""
                                    onClick={() => {
                                        table.setPageIndex(
                                            table.getPageCount() - 1
                                        );
                                        localStorage.setItem(
                                            'pageindex',
                                            `${table.getPageCount() - 1}`
                                        );
                                    }}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {'>>'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 p-4">
                <button
                    className={`flex flex-row items-center justify-center gap-2 rounded-md px-4 py-2 text-sm whitespace-nowrap ${
                        Object.keys(rowSelection).length === 0
                            ? 'cursor-not-allowed bg-neutral-500/18 text-white/18'
                            : 'bg-neutral-700 text-white'
                    }`}
                    type="button"
                    onClick={() => toggleEmailPopup()}
                    disabled={Object.keys(rowSelection).length === 0}
                >
                    <EnvelopeIcon className="size-6" />
                    Email Selected Entries
                </button>

                <button
                    className={`flex flex-row items-center justify-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap ${
                        Object.keys(rowSelection).length === 0
                            ? 'cursor-not-allowed bg-neutral-500/18 text-white/18'
                            : 'bg-neutral-700 text-white'
                    }`}
                    type="button"
                    onClick={() => exportExcel()}
                    disabled={Object.keys(rowSelection).length === 0}
                >
                    <DocumentArrowDownIcon className="size-6" />
                    Export Selected Rows
                </button>
            </div>

            {/*Send Email Popup*/}
            {isEmailPopupOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
                    onClick={() => setIsEmailPopupOpen(false)}
                >
                    <div
                        className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-neutral-900 p-10 text-white shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-2 text-xl font-semibold">
                            Send Emails
                        </h2>

                        <div className="mb-4">
                            <Label className="mb-2 text-white/60">
                                Select Email Template
                            </Label>
                            {templatesLoading ? (
                                <div className="text-sm text-white/60">
                                    Loading templates...
                                </div>
                            ) : emailTemplates && emailTemplates.length > 0 ? (
                                <div className="mt-2 max-h-60 overflow-y-auto">
                                    <RadioGroup
                                        value={
                                            selectedTemplateId?.toString() || ''
                                        }
                                        onValueChange={(value) =>
                                            setSelectedTemplateId(Number(value))
                                        }
                                    >
                                        <div className="flex w-full flex-col gap-2">
                                            {emailTemplates.map((template) => (
                                                <div
                                                    className={`flex cursor-pointer items-center space-x-2 rounded-lg border px-4 py-3 ${
                                                        selectedTemplateId ===
                                                        template.id
                                                            ? 'bg-brand-950/60 border-brand-900'
                                                            : 'border-neutral-600/60 bg-neutral-800/60'
                                                    }`}
                                                    key={template.id}
                                                    onClick={() =>
                                                        setSelectedTemplateId(
                                                            template.id
                                                        )
                                                    }
                                                >
                                                    <RadioGroupItem
                                                        value={template.id.toString()}
                                                        id={`template-${template.id}`}
                                                        className={`h-5 w-5 appearance-none rounded-full border ${
                                                            selectedTemplateId ===
                                                            template.id
                                                                ? 'bg-brand-500 border-blue-800'
                                                                : 'border-neutral-500 bg-neutral-700'
                                                        }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <Label
                                                            htmlFor={`template-${template.id}`}
                                                            className="cursor-pointer font-medium text-white"
                                                        >
                                                            {template.title}
                                                        </Label>
                                                        <span className="text-xs text-white/60">
                                                            {template.purpose}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </div>
                            ) : (
                                <div className="text-sm text-white/60">
                                    No email templates found. Please create
                                    templates in the Email Templates section.
                                </div>
                            )}
                        </div>

                        <div className="mt-2 flex justify-between">
                            <button
                                className="rounded-md bg-neutral-800 px-4 py-2 text-sm whitespace-nowrap text-white hover:bg-neutral-700"
                                type="button"
                                onClick={() => setIsEmailPopupOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`rounded-md px-4 py-2 text-sm whitespace-nowrap text-white ${
                                    !selectedTemplateId || isSending
                                        ? 'cursor-not-allowed bg-neutral-600/60'
                                        : 'bg-brand-600 hover:bg-brand-700'
                                }`}
                                type="button"
                                disabled={!selectedTemplateId || isSending}
                                onClick={() =>
                                    handleSendingEmails(
                                        table.getSelectedRowModel().rows
                                    )
                                }
                            >
                                {isSending
                                    ? 'Sending...'
                                    : `Send Email to ${table.getSelectedRowModel().rows.length} Rows`}
                            </button>
                        </div>
                    </div>
                    <Toaster />
                </div>
            )}
        </div>
    );
}

// I copied this from somewhere, this is for the checkboxes in the table
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
            onClick={(e) => e.stopPropagation()}
        />
    );
}

// Function to transform the data received from DB to the json format the table expects
function transformResponse(response: any[]) {
    console.log(response);

    return response.map((item) => {
        const {
            '1': firstName,
            '2': lastName,
            '3': pronouns,
            '4': email,
            '5': haveHackathonExperience,
            '6': howHeardAbout,
            '7': dietaryRestrictions,
            '8': tShirtSize,
            '9': resume,
            '10': discord,
            '11': instagram,
            '12': github,
            '13': linkedin,
            '14': portfolio,
            '15': otherLinks,
            '16': school,
            '17': background,
            '18': yearOfStudy,
            '19': major,
            '20': excitement,
            '21': problemOrSkill,
            '22': dreamProject,
            '23': teamMember1,
            '24': teamMember2,
            '25': teamMember3,
            '26': teamMember4,
            '27': shareResume,
            '28': acceptMLH,
            '29': acceptSFSS,
            '30': acceptEmails,
            '31': authorizeMLH,
            '32': photoRelease,
        } = item.response as Record<string, any>;

        const members = item.members;
        const checkIns = item.checkIns;

        const teamName = item.teamName
            ? `${item.teamName} (${item.teamId})`
            : null;

        return {
            id: Number(item.userId),
            teamName,
            currentStatus: item.currentStatus,
            pendingStatus: item.pendingStatus,
            applicationDate: new Date(item.createdDate),
            dietaryRestrictions: Array.isArray(dietaryRestrictions)
                ? dietaryRestrictions
                : [dietaryRestrictions],
            howHeardAbout: Array.isArray(howHeardAbout)
                ? howHeardAbout
                : [howHeardAbout],
            members,
            firstName,
            lastName,
            pronouns,
            email,
            haveHackathonExperience,
            tShirtSize,
            resume,
            discord,
            instagram,
            github,
            linkedin,
            portfolio,
            otherLinks,
            school,
            background,
            yearOfStudy,
            major,
            excitement,
            problemOrSkill,
            dreamProject,
            teamMember1,
            teamMember2,
            teamMember3,
            teamMember4,
            shareResume,
            acceptMLH,
            acceptSFSS,
            acceptEmails,
            authorizeMLH,
            photoRelease,
            checkIns,
        };
    });
}
