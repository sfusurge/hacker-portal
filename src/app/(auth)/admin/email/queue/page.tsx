'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
import { trpc } from '@/trpc/client';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    HACKATHON_EMAIL_TYPE_LABELS,
    type HackathonEmailType,
} from '@/db/schema/emails';

const pageShellClass =
    'w-full max-w-full min-w-0 overflow-x-hidden px-3 py-6 sm:px-4 sm:py-10';

const hackathonSelectTriggerClass = 'w-full min-w-0 sm:w-[min(100%,280px)]';

type QueueStatus = 'pending' | 'sent' | 'failed';

const STATUS_FILTER_VALUES = ['all', 'pending', 'sent', 'failed'] as const;
type StatusFilter = (typeof STATUS_FILTER_VALUES)[number];

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
    all: 'All statuses',
    pending: 'Pending',
    sent: 'Sent',
    failed: 'Failed',
};

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'sent':
            return 'bg-success-950 text-success-300';
        case 'pending':
            return 'bg-yellow-950 text-yellow-300';
        case 'failed':
            return 'bg-danger-950 text-danger-300';
        default:
            return 'bg-neutral-600/30';
    }
}

function formatEmailType(emailType: string | null): string {
    if (!emailType) return '-';
    return (
        HACKATHON_EMAIL_TYPE_LABELS[emailType as HackathonEmailType] ??
        emailType
    );
}

function formatDate(value: Date | string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleString();
}

function formatName(firstName: string | null, lastName: string | null): string {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    return name.length > 0 ? name : '-';
}

export default function EmailQueuePage() {
    const activeHackathon = useAtomValue(hackathonAtom);
    const [selectedHackathonId, setSelectedHackathonId] = useState<
        number | null
    >(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const hasSetInitialHackathon = useRef(false);

    const { data: hackathons = [] } = trpc.hackathons.getHackathons.useQuery();

    useEffect(() => {
        if (hasSetInitialHackathon.current) return;
        if (activeHackathon?.id) {
            hasSetInitialHackathon.current = true;
            setSelectedHackathonId(activeHackathon.id);
        }
    }, [activeHackathon]);

    const hackathonIdInput = selectedHackathonId ?? undefined;
    const statusInput: QueueStatus | undefined =
        statusFilter === 'all' ? undefined : statusFilter;

    const { data: counts } = trpc.emailQueue.getQueueStatus.useQuery(
        { hackathonId: hackathonIdInput },
        { enabled: selectedHackathonId != null }
    );

    const { data: items, isLoading } = trpc.emailQueue.getQueueItems.useQuery(
        { hackathonId: hackathonIdInput, status: statusInput },
        { enabled: selectedHackathonId != null }
    );

    const header = (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl font-bold">Email Queue</h1>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="shrink-0 text-sm text-white/60">
                        Hackathon:
                    </span>
                    <Select
                        value={
                            selectedHackathonId != null
                                ? String(selectedHackathonId)
                                : ''
                        }
                        onValueChange={(value) =>
                            setSelectedHackathonId(Number(value))
                        }
                    >
                        <SelectTrigger className={hackathonSelectTriggerClass}>
                            <SelectValue placeholder="Select hackathon" />
                        </SelectTrigger>
                        <SelectContent>
                            {hackathons.map((h) => (
                                <SelectItem key={h.id} value={String(h.id)}>
                                    {h.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="shrink-0 text-sm text-white/60">
                        Status:
                    </span>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                            setStatusFilter(value as StatusFilter)
                        }
                    >
                        <SelectTrigger className="w-full min-w-0 sm:w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_FILTER_VALUES.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {STATUS_FILTER_LABELS[value]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Link href="/admin/email/templates">
                    <Button
                        variant="brand"
                        hierarchy="secondary"
                        size="cozy"
                        className="w-full sm:w-auto"
                    >
                        Back to Templates
                    </Button>
                </Link>
            </div>
        </div>
    );

    if (selectedHackathonId == null) {
        return (
            <div className={pageShellClass}>
                {header}
                <div className="py-10 text-center">
                    <p className="text-lg text-white/60">
                        {hackathons.length > 0
                            ? 'Select a hackathon to view the email queue.'
                            : 'No hackathons found.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={pageShellClass}>
            {header}

            <div className="mb-6 flex flex-wrap gap-3 text-sm text-white">
                <div className="rounded-md bg-neutral-800 px-3 py-2">
                    <span className="font-medium">Pending:</span>{' '}
                    {counts?.pending ?? 0}
                </div>
                <div className="rounded-md bg-neutral-800 px-3 py-2">
                    <span className="font-medium">Sent:</span>{' '}
                    {counts?.sent ?? 0}
                </div>
                <div className="rounded-md bg-neutral-800 px-3 py-2">
                    <span className="font-medium">Failed:</span>{' '}
                    {counts?.failed ?? 0}
                </div>
                <div className="rounded-md bg-neutral-800 px-3 py-2">
                    <span className="font-medium">Total:</span>{' '}
                    {counts?.total ?? 0}
                </div>
            </div>

            {isLoading ? (
                <div className="py-10 text-center text-white/60">
                    Loading email queue...
                </div>
            ) : !items || items.length === 0 ? (
                <div className="py-10 text-center">
                    <p className="text-lg text-white/60">
                        No emails in the queue for this filter.
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-white/60">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Recipient</TableHead>
                                <TableHead>Email Type</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Failed Count</TableHead>
                                <TableHead>Error</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Sent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">
                                            {formatName(
                                                item.firstName,
                                                item.lastName
                                            )}
                                        </div>
                                        <div className="text-white/60">
                                            {item.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {formatEmailType(item.emailType)}
                                    </TableCell>
                                    <TableCell>
                                        {item.templateTitle ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`rounded-md px-3 py-0.5 text-xs ${statusBadgeClass(
                                                item.status
                                            )}`}
                                        >
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{item.failedCount}</TableCell>
                                    <TableCell className="max-w-xs">
                                        <span className="block truncate text-white/60">
                                            {item.errorMessage ?? '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDate(item.createdAt)}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDate(item.sentAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
