'use client';

import { trpc } from '@/trpc/client';
import {
    Fragment,
    HTMLProps,
    useCallback,
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
    RowSelectionState,
    Row,
    PaginationState,
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
import {
    StatusEnum,
    ApplicationStatus,
    APPLICATION_STATUS_ENUM,
} from '@/db/schema/applications';
import { FilterColumn } from './FilterColumn';

export type Applicant = {
    members: string[] | null;
    id: number;
    teamName: string | null;

    // Basic Information
    firstName: string;
    lastName: string;
    pronouns: string;
    email: string;
    haveHackathonExperience: string;
    howHeardAbout: string[];
    dietaryRestrictions?: string[];
    tShirtSize: string;
    resume?: string[];
    discord: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    otherLinks?: string;

    // School Information
    school?: string;
    background?: string;
    yearOfStudy?: string;
    major: string;

    // Short Answer Questions
    excitement: string;
    problemOrSkill: string;
    dreamProject: string;

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
    lastEmailSent: string;

    checkIns: {
        eventId: number;
        eventTitle: string;
        checkedIn: boolean;
        checkInTime: Date | null;
    }[];
};

type ReviewApplicationsTableProps = {
    data: Applicant[];
    applicationCount: number;
    applicationDataMap: Map<number, ApplicationWithTeamInfo>;
    fetchNextPage: () => Promise<void>;
    onRowClick?: (app: Applicant, idx: number) => void;
    hackathonId: number;
};

export const sideCardAtomSJ = atom<ApplicationWithTeamInfo>();

const csvConfig = mkConfig({
    fieldSeparator: ',',
    filename: 'Data',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

export default function ReviewApplicationsTable({
    data,
    applicationCount,
    applicationDataMap,
    fetchNextPage,
    onRowClick,
    hackathonId,
}: ReviewApplicationsTableProps) {
    const hackathon = useAtomValue(hackathonAtom);

    // Fetch email templates
    const { data: emailTemplates, isLoading: templatesLoading } =
        trpc.emailTemplates.getEmailTemplates.useQuery();

    // Data state
    //const data: Applicant[] = transformResponse(applications);

    const checkedInInfoColumns: ColumnDef<Applicant>[] =
        data[0]?.checkIns?.map(({ eventTitle, eventId }) => {
            return {
                accessorFn: (row: Applicant) => {
                    const checkIn = row.checkIns?.find(
                        (c) => c.eventId === eventId
                    );
                    if (checkIn?.checkInTime) {
                        try {
                            return dayjs(checkIn.checkInTime).format(
                                'MM-DD HH:mm'
                            );
                        } catch (e) {
                            return '';
                        }
                    }
                    return '';
                },
                header: eventTitle,
                enableColumnFilter: true,
                id: `checkin-${eventId}`,
                size: 150,
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
            // id: 'teamName',
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
            accessorKey: 'currentStatus',
            header: 'Current Status',
            cell: (info) => {
                const value = info.getValue<string>();
                return (
                    <span
                        className={`rounded-md px-3 py-0.5 text-xs ${
                            value === 'Accepted' ||
                            value === 'Accepted - Pending Payment' ||
                            value === 'Accepted - RSVP to Confirm'
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
            enableColumnFilter: true,
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
                            value === 'Accepted - Pending Payment' ||
                            value === 'Accepted - RSVP to Confirm'
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
            enableColumnFilter: true,
        },
        {
            accessorKey: 'lastEmailSent',
            header: 'Last Email Sent',
            size: 200,
            minSize: 150,
        },
        {
            accessorKey: 'applicationDate',
            header: 'Date',
            size: 100,
            minSize: 100,
            cell: (info) =>
                dayjs(info.getValue() as Date).format('MM-DD HH:mm'),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 225,
            minSize: 150,
        },
        {
            accessorKey: 'age',
            header: 'Age',
            size: 100,
            minSize: 100,
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
            accessorKey: 'background',
            header: 'background',
            size: 120,
            minSize: 100,
        },
        {
            accessorKey: 'haveHackathonExperience',
            header: 'Hackathon Experience',
            size: 200,
            minSize: 150,
            cell: (info) => {
                const value = info.getValue();
                return Array.isArray(value) ? value.join(', ') : value || 'N/A';
            },
        },
        {
            accessorKey: 'howHeardAbout',
            header: 'How Heard About',
            size: 200,
            minSize: 150,
            cell: (info) => {
                const value = info.getValue();
                return Array.isArray(value) ? value.join(', ') : value || 'N/A';
            },
        },
        {
            accessorKey: 'dietaryRestrictions',
            header: 'Dietary Restrictions',
            size: 200,
            minSize: 150,
            filterFn: 'arrIncludes',
            cell: (info) => {
                const value = info.getValue();
                return Array.isArray(value) ? value.join(', ') : value || 'N/A';
            },
        },
        {
            accessorKey: 'resume',
            header: 'Resume',
            size: 200,
            minSize: 150,
            enableGlobalFilter: false,
            enableColumnFilter: false,
            cell: (info) => {
                const url: string = ((info.getValue() as string[]) ?? [''])[0];

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

    return (
        <MyTable
            applicationCount={applicationCount}
            applicationDataMap={applicationDataMap}
            data={data}
            defaultColumns={defaultColumns}
            emailTemplates={emailTemplates}
            templatesLoading={templatesLoading}
            //toggleSideCard={toggleSideCard}
            fetchNextPage={fetchNextPage}
            onRowClick={onRowClick}
            hackathonId={hackathonId}
        />
    );
}

function getStatusCounts(applications: Applicant[]) {
    const counts: Record<ApplicationStatus, number> = {
        'N/A': 0,
        Accepted: 0,
        Declined: 0,
        'Awaiting Review': 0,
        'Wait List': 0,
        Withdrawn: 0,
        'Accepted - Pending Payment': 0,
        'Accepted - RSVP to Confirm': 0,
    };

    for (const app of applications) {
        const status = app.currentStatus as ApplicationStatus;
        if (counts[status] !== undefined) {
            counts[status]++;
        } else {
            counts['N/A']++;
        }
    }

    return counts;
}
// Put this outside of ReviewApplicationsTable cuz updating table state keeps
// infinte loop of fetching data, and updating table state
function MyTable({
    applicationCount,
    data,
    defaultColumns,
    emailTemplates,
    templatesLoading,
    //toggleSideCard,
    applicationDataMap,
    fetchNextPage,
    onRowClick,
    hackathonId,
}: {
    applicationCount: number;
    data: Applicant[];
    defaultColumns: ColumnDef<Applicant>[];
    emailTemplates?: any[];
    templatesLoading: boolean;
    //toggleSideCard: () => void;
    applicationDataMap: Map<number, ApplicationWithTeamInfo>;
    fetchNextPage: () => Promise<void>;
    onRowClick?: (app: Applicant, idx: number) => void;
    hackathonId: number;
}) {
    //const hackathon = useAtomValue(hackathonAtom);
    const utils = trpc.useUtils();

    const setSideCardInfo = useSetAtom(sideCardAtomSJ);

    const sendEmail = trpc.emails.sendEmail.useMutation();
    const updateLastEmailSent =
        trpc.applications.updateLastEmailSent.useMutation();
    const queueBatchEmails = trpc.emailQueue.queueBatchEmails.useMutation();
    const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
        null
    );
    const { toast } = useToast();

    const statusCounts = useMemo(() => getStatusCounts(data), [data]);

    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: parseInt(localStorage.getItem('pagesize') ?? '200'),
        pageIndex: parseInt(localStorage.getItem('pageindex') ?? '0'),
    });

    const table = useReactTable({
        data,
        columns: defaultColumns,
        state: { globalFilter, sorting, rowSelection, pagination },
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
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
    });

    const toggleEmailPopup = () => {
        setIsEmailPopupOpen(!isEmailPopupOpen);
    };

    const batchUpdateApplicationStatus =
        trpc.applications.updateApplicationBatch.useMutation({
            onSuccess: async (updatedEntries) => {
                // https://github.com/vercel/next.js/discussions/81503
                // Cancel outgoing fetches
                await utils.applications.getApplications.cancel();

                const userIdToUpdatedEntries = new Map(
                    updatedEntries.map((entry) => [entry.userId, entry])
                );

                console.debug('Updating table with updated entry');

                utils.applications.getApplications.setInfiniteData(
                    {
                        hackathonId,
                    },
                    (old) => {
                        if (!old) {
                            return {
                                pageParams: [],
                                pages: [],
                            };
                        }

                        return {
                            ...old,
                            pages: old.pages.map((page) => {
                                return {
                                    ...page,
                                    applications: page.applications.map(
                                        (application) => {
                                            if (
                                                !userIdToUpdatedEntries.has(
                                                    application.userId
                                                )
                                            ) {
                                                return application;
                                            }

                                            const updatedEntry =
                                                userIdToUpdatedEntries.get(
                                                    application.userId
                                                )!;

                                            return {
                                                ...application,
                                                currentStatus:
                                                    updatedEntry.currentStatus,
                                                pendingStatus:
                                                    updatedEntry.pendingStatus,
                                            };
                                        }
                                    ),
                                };
                            }),
                        };
                    }
                );
            },
        });

    const batchUpdateApplicants = async (
        rows: Row<Applicant>[],
        {
            pendingStatus,
            status,
        }: { status?: StatusEnum; pendingStatus?: StatusEnum }
    ) => {
        const ids = rows.map((row) => row.original.id);

        if (ids.length === 0) {
            console.debug(
                `No user ids to update status pendingStatus=${pendingStatus} status=${status}`
            );
            return;
        }

        console.debug(
            `Setting Applications pendingStatus=${pendingStatus}, status=${status}`
        );

        await batchUpdateApplicationStatus.mutateAsync({
            hackathonId,
            userIds: ids,
            pendingStatus,
            status,
        });

        // unselect those rows
        setRowSelection((prev) => {
            const { ...newSelection } = prev;

            rows.forEach((row) => {
                delete newSelection[row.id];
            });

            return newSelection;
        });
    };

    //sends emails to selected users
    const handleSendingEmails = async (rows: Row<Applicant>[]) => {
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

            const selectedTemplate = emailTemplates?.find(
                (t) => t.id === selectedTemplateId
            );
            if (!selectedTemplate) {
                throw new Error('Selected template not found');
            }

            const rowData = rows.map((row) => ({
                id: row.original.id,
                firstName: row.original.firstName,
                lastName: row.original.lastName,
                email: row.original.email,
                pendingStatus: row.original.pendingStatus,
                currentStatus: row.original.currentStatus,
            }));

            // Queue emails for sending
            const queueResult = await queueBatchEmails.mutateAsync({
                templateId: selectedTemplateId,
                users: rowData.map((r) => ({
                    id: r.id,
                    email: r.email,
                    firstName: r.firstName,
                    lastName: r.lastName,
                })),
                hackathonId,
                emailType: selectedTemplate.purpose,
            });

            // Update statuses immediately
            for (const row of rowData) {
                try {
                    await updateLastEmailSent.mutateAsync({
                        hackathonId,
                        userId: row.id,
                        emailType: selectedTemplate.purpose,
                    });

                    await batchUpdateApplicationStatus.mutateAsync({
                        userIds: [row.id],
                        hackathonId,
                        pendingStatus: 'N/A',
                    });
                } catch (error) {
                    console.error(
                        `Error updating status for ${row.email}:`,
                        error
                    );
                }
            }

            const updateApplicationStatusInfos = rowData
                .filter(
                    (r) =>
                        r.pendingStatus !== 'N/A' &&
                        r.currentStatus !== 'Accepted'
                )
                .map((r) => ({
                    id: r.id,
                    status: r.pendingStatus as StatusEnum,
                }));

            const statusToIds = Object.groupBy(
                updateApplicationStatusInfos,
                ({ status }) => status
            );

            await Promise.all(
                Object.entries(statusToIds).map(async ([status, items]) => {
                    const userIds = items.map(({ id }) => id);

                    console.debug(`Updating status to pendingStatus ${status}`);

                    try {
                        await batchUpdateApplicationStatus.mutateAsync({
                            userIds,
                            hackathonId,
                            status: status as StatusEnum,
                        });
                    } catch (error) {
                        console.error(error);

                        console.error(
                            `failed userIds: [${userIds.join(', ')}]`
                        );

                        toast({
                            title: 'Error',
                            description: `Failed to update status to ${status}`,
                        });
                    }
                })
            );

            // TODO: update text
            toast({
                title: 'Emails Queued',
                description: `${queueResult.queued} emails queued for sending`,
                className: 'bg-neutral-900 text-white border-neutral-700/18',
            });

            setIsEmailPopupOpen(false);
            setIsSending(false);
        } catch (error) {
            console.error('Error in email sending process:', error);
            toast({
                title: 'Error',
                description: 'Failed to queue emails.',
            });
            setIsSending(false);
        }
    };

    useEffect(() => {
        localStorage.setItem('pagesize', `${pagination.pageSize}`);
    }, [pagination.pageSize]);

    useEffect(() => {
        localStorage.setItem('pageindex', `${pagination.pageIndex}`);
    }, [pagination.pageIndex]);

    useEffect(() => {
        (async () => {
            if (table.getPageCount() - (pagination.pageIndex + 1) <= 1) {
                await fetchNextPage();
            }
        })();
    }, [table.getPageCount(), pagination.pageIndex, fetchNextPage, table]);

    const exportExcel = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const allCheckInTitles = Array.from(
            new Set(
                (data ?? []).flatMap(
                    (r) => r.checkIns?.map((ci) => ci.eventTitle) ?? []
                )
            )
        );

        const tempData = selectedRows.map(({ original }) => {
            const { applicationDate, checkIns, ...rest } = original;
            const checkInColumns = (checkIns ?? []).reduce<
                Record<string, string>
            >((acc, ci) => {
                if (ci?.eventTitle) {
                    acc[ci.eventTitle] = ci?.checkInTime
                        ? dayjs(ci.checkInTime).format('MM-DD HH:mm')
                        : '';
                }
                return acc;
            }, {});
            for (const title of allCheckInTitles) {
                if (!(title in checkInColumns)) {
                    checkInColumns[title] = '';
                }
            }

            return {
                ...rest,
                applicationDate: dayjs(applicationDate).format('MM-DD HH:mm'),
                howHeardAbout: original.howHeardAbout?.join(', ') || '',
                dietaryRestrictions:
                    original.dietaryRestrictions?.join(', ') || '',
                resume: original.resume?.join(', ') || '',
                members: Array.isArray(original.members)
                    ? original.members.join(', ')
                    : '',
                ...checkInColumns,
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

    return (
        <div className="overflow-hidden">
            {/* Status Summary */}
            <div className="flex flex-wrap gap-3 p-4 text-sm text-white">
                {APPLICATION_STATUS_ENUM.map((status: ApplicationStatus) => (
                    <div
                        key={status}
                        className="rounded-md bg-neutral-800 px-3 py-2"
                    >
                        <span className="font-medium">{status}:</span>{' '}
                        {statusCounts[status]}
                    </div>
                ))}
            </div>

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
                                <Fragment key={headerGroup.id}>
                                    <tr>
                                        {headerGroup.headers.map(
                                            (header, index) => (
                                                <th
                                                    key={header.id}
                                                    colSpan={header.colSpan}
                                                    style={{
                                                        width: header.getSize(),
                                                        minWidth:
                                                            header.column
                                                                .columnDef
                                                                .minSize,
                                                    }}
                                                    className={`relative overflow-hidden px-4 py-4 text-sm overflow-ellipsis ${
                                                        index === 0
                                                            ? 'sticky left-0 z-20 bg-neutral-900' // First column
                                                            : index === 1
                                                              ? 'sticky left-[50px] z-20 bg-neutral-900' // Second column
                                                              : ''
                                                    }`}
                                                    onClick={
                                                        header.column.getCanMultiSort()
                                                            ? header.column.getToggleSortingHandler()
                                                            : undefined
                                                    }
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column
                                                                  .columnDef
                                                                  .header,
                                                              header.getContext()
                                                          )}
                                                    {header.column.getCanSort() && (
                                                        <span>
                                                            {header.column.getIsSorted() ===
                                                                'asc' && ' ▲'}
                                                            {header.column.getIsSorted() ===
                                                                'desc' && ' ▼'}
                                                            {header.column.getIsSorted() ===
                                                                false && ' -'}
                                                        </span>
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
                                    <tr>
                                        {headerGroup.headers.map(
                                            (header, index) => (
                                                <th
                                                    key={header.id}
                                                    style={{
                                                        width: header.getSize(),
                                                        minWidth:
                                                            header.column
                                                                .columnDef
                                                                .minSize,
                                                    }}
                                                    className={`relative px-4 py-2 text-sm ${
                                                        index === 0
                                                            ? 'sticky left-0 z-20 bg-neutral-900'
                                                            : index === 1
                                                              ? 'sticky left-[50px] z-20 bg-neutral-900'
                                                              : ''
                                                    }`}
                                                >
                                                    {header.column.getCanFilter() ? (
                                                        <FilterColumn
                                                            column={
                                                                header.column
                                                            }
                                                        />
                                                    ) : null}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </Fragment>
                            ))}
                        </thead>

                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <Fragment key={row.id}>
                                    <tr
                                        className="cursor-pointer hover:bg-gray-800"
                                        onClick={() => {
                                            //toggleSideCard();
                                            setSideCardInfo(
                                                applicationDataMap.get(
                                                    row.original.id
                                                )
                                            );
                                            if (onRowClick) {
                                                onRowClick(
                                                    row.original,
                                                    row.index
                                                );
                                            }
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
                            Selected. Total applications count:{' '}
                            {applicationCount}
                        </div>

                        <div className="flex flex-row items-center gap-1">
                            <header>Rows per page:</header>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => {
                                    table.setPageSize(parseInt(e.target.value));
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
                                    }}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<<'}
                                </button>
                                <button
                                    className=""
                                    onClick={() => {
                                        table.previousPage();
                                    }}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {'<'}
                                </button>
                                <button
                                    className=""
                                    onClick={() => {
                                        table.nextPage();
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

            <div className="flex flex-wrap justify-end gap-3 p-4">
                <button
                    className={`flex flex-row items-center justify-center gap-2 rounded-md px-4 py-2 text-sm whitespace-nowrap ${
                        Object.keys(rowSelection).length === 0
                            ? 'cursor-not-allowed bg-neutral-500/18 text-white/18'
                            : 'bg-success-700 text-white'
                    }`}
                    type="button"
                    onClick={() =>
                        batchUpdateApplicants(
                            table.getSelectedRowModel().rows,
                            {
                                pendingStatus: 'Accepted - RSVP to Confirm',
                            }
                        )
                    }
                    disabled={Object.keys(rowSelection).length === 0}
                >
                    Accept Selected Entries
                </button>

                <button
                    className={`flex flex-row items-center justify-center gap-2 rounded-md px-4 py-2 text-sm whitespace-nowrap ${
                        Object.keys(rowSelection).length === 0
                            ? 'cursor-not-allowed bg-neutral-500/18 text-white/18'
                            : 'bg-danger-700 text-white'
                    }`}
                    type="button"
                    onClick={() =>
                        batchUpdateApplicants(
                            table.getSelectedRowModel().rows,
                            { pendingStatus: 'Declined' }
                        )
                    }
                    disabled={Object.keys(rowSelection).length === 0}
                >
                    Reject Selected Entries
                </button>

                <button
                    className={`flex flex-row items-center justify-center gap-2 rounded-md px-4 py-2 text-sm whitespace-nowrap ${
                        Object.keys(rowSelection).length === 0
                            ? 'cursor-not-allowed bg-neutral-500/18 text-white/18'
                            : 'bg-neutral-700 text-white'
                    }`}
                    type="button"
                    onClick={() =>
                        batchUpdateApplicants(
                            table.getSelectedRowModel().rows,
                            { pendingStatus: 'Wait List' }
                        )
                    }
                    disabled={Object.keys(rowSelection).length === 0}
                >
                    Waitlist Selected Entries
                </button>

                <button
                    className={`flex flex-row items-center justify-center gap-2 rounded-md px-4 py-2 text-sm whitespace-nowrap ${
                        Object.keys(rowSelection).length === 0
                            ? 'cursor-not-allowed bg-neutral-500/18 text-white/18'
                            : 'bg-brand-700 text-white'
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
