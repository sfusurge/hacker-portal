'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { ArrowPathIcon, PaperAirplaneIcon } from '@heroicons/react/16/solid';
import { trpc } from '@/trpc/client';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input/input';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    HACKATHON_EMAIL_TYPE_LABELS,
    type HackathonEmailType,
} from '@/db/schema/emails';

const pageShellClass = 'w-full max-w-full min-w-0';

const STATUS_FILTER_VALUES = ['all', 'pending', 'sent', 'failed'] as const;
type StatusFilter = (typeof STATUS_FILTER_VALUES)[number];

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
    all: 'All statuses',
    pending: 'Pending',
    sent: 'Sent',
    failed: 'Failed',
};

const ALL = 'all';

function statusChipClass(status: string): string {
    switch (status) {
        case 'sent':
            return 'bg-success-950 text-success-300';
        case 'pending':
            return 'bg-caution-950 text-caution-300';
        case 'failed':
            return 'bg-danger-950 text-danger-300';
        default:
            return 'bg-neutral-800 text-white';
    }
}

function statusChipLabel(status: string): string {
    switch (status) {
        case 'sent':
            return 'Sent';
        case 'pending':
            return 'Pending';
        case 'failed':
            return 'Failed';
        default:
            return status;
    }
}

function formatEmailType(emailType: string | null): string {
    if (!emailType) return '—';
    return (
        HACKATHON_EMAIL_TYPE_LABELS[emailType as HackathonEmailType] ??
        emailType
    );
}

function formatTimestamp(value: Date | string | null): string {
    if (!value) return '—';
    return dayjs(value).format('MMM D, YYYY h:mm A');
}

function formatName(firstName: string | null, lastName: string | null): string {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    return name.length > 0 ? name : '—';
}

function StatChip({ label, value }: { label: string; value: number }) {
    return (
        <span className="inline-flex h-8 items-center rounded-lg bg-neutral-800 px-3 text-sm font-medium text-white">
            {label}: {value}
        </span>
    );
}

const filterControlClass =
    'h-9 w-full rounded-md border border-[var(--border-neutral-secondary)] bg-[var(--background-neutral-secondary)] px-3 text-sm text-white shadow-xs outline-none placeholder:text-neutral-400 focus-visible:border-brand-500 focus-visible:ring-[3px] focus-visible:ring-brand-500/50 [color-scheme:dark]';

function FilterField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-sm text-white/50">{label}</span>
            {children}
        </div>
    );
}

export default function EmailQueuePage() {
    const { toast } = useToast();
    const utils = trpc.useUtils();
    const activeHackathon = useAtomValue(hackathonAtom);

    const [selectedHackathonId, setSelectedHackathonId] = useState<
        number | null
    >(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [emailTypeFilter, setEmailTypeFilter] = useState<string>(ALL);
    const [templateFilter, setTemplateFilter] = useState<string>(ALL);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    const [sentFrom, setSentFrom] = useState('');
    const [sentTo, setSentTo] = useState('');
    const [processOpen, setProcessOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const hasSetInitialHackathon = useRef(false);
    const { data: hackathons = [] } = trpc.hackathons.getHackathons.useQuery();

    useEffect(() => {
        if (hasSetInitialHackathon.current) return;
        if (activeHackathon?.id) {
            hasSetInitialHackathon.current = true;
            setSelectedHackathonId(activeHackathon.id);
        }
    }, [activeHackathon]);

    const enabled = selectedHackathonId != null;
    const hackathonIdInput = selectedHackathonId ?? undefined;

    const { data: counts } = trpc.emailQueue.getQueueStatus.useQuery(
        { hackathonId: hackathonIdInput },
        { enabled }
    );
    const { data: breakdown = [] } = trpc.emailQueue.getQueueBreakdown.useQuery(
        { hackathonId: hackathonIdInput },
        { enabled }
    );
    const { data: templates = [] } =
        trpc.emailTemplates.getEmailTemplates.useQuery(
            { hackathonId: selectedHackathonId ?? 0 },
            { enabled }
        );

    const emailTypeOptions = useMemo(() => {
        const set = new Set<string>();
        for (const row of breakdown) {
            if (row.emailType) set.add(row.emailType);
        }
        return [...set];
    }, [breakdown]);

    const itemsQuery = trpc.emailQueue.getQueueItems.useInfiniteQuery(
        {
            hackathonId: hackathonIdInput,
            status: statusFilter === 'all' ? undefined : statusFilter,
            emailType: emailTypeFilter === ALL ? undefined : emailTypeFilter,
            templateId:
                templateFilter === ALL ? undefined : Number(templateFilter),
            search: debouncedSearch.trim() || undefined,
            createdFrom: createdFrom ? `${createdFrom}T00:00:00` : undefined,
            createdTo: createdTo ? `${createdTo}T23:59:59` : undefined,
            sentFrom: sentFrom ? `${sentFrom}T00:00:00` : undefined,
            sentTo: sentTo ? `${sentTo}T23:59:59` : undefined,
        },
        {
            enabled,
            getNextPageParam: (last) => last.nextToken,
        }
    );

    const items = itemsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    const maxRetries = counts?.maxRetries ?? 3;

    const refetchAll = () => {
        utils.emailQueue.getQueueStatus.invalidate();
        utils.emailQueue.getQueueBreakdown.invalidate();
        utils.emailQueue.getQueueItems.invalidate();
    };

    const processNow = trpc.emailQueue.processQueueNow.useMutation({
        onSuccess: (res) => {
            toast({
                title: 'Queue processed',
                description:
                    res.message ?? `Sent ${res.sent}, failed ${res.failed}.`,
                variant: 'success',
            });
            refetchAll();
        },
        onError: (e) =>
            toast({
                title: 'Could not process queue',
                description: e.message,
                variant: 'error',
            }),
    });

    const sendNow = trpc.emailQueue.sendNow.useMutation({
        onSuccess: (res) => {
            toast({
                title: 'Sent',
                description: `Sent ${res.sent}, failed ${res.failed}.`,
                variant: 'success',
            });
            refetchAll();
        },
        onError: (e) =>
            toast({
                title: 'Could not send',
                description: e.message,
                variant: 'error',
            }),
    });

    const retryFailed = trpc.emailQueue.retryFailed.useMutation({
        onSuccess: (res) => {
            toast({
                title: 'Retrying',
                description: `${res.retried} email(s) reset to pending.`,
                variant: 'success',
            });
            refetchAll();
        },
        onError: (e) =>
            toast({
                title: 'Could not retry',
                description: e.message,
                variant: 'error',
            }),
    });

    const busy =
        processNow.isPending || sendNow.isPending || retryFailed.isPending;

    const selectedHackathonName =
        hackathons.find((h) => h.id === selectedHackathonId)?.name ??
        'Select hackathon';

    const headerActions = (
        <div className="flex flex-wrap items-center gap-2.5">
            {hackathons.length > 0 && (
                <Select
                    value={
                        selectedHackathonId != null
                            ? String(selectedHackathonId)
                            : undefined
                    }
                    onValueChange={(value) =>
                        setSelectedHackathonId(Number(value))
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select hackathon">
                            {selectedHackathonName}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {hackathons.map((h) => (
                            <SelectItem key={h.id} value={String(h.id)}>
                                {h.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            <Link href="/admin/email/templates">
                <Button variant="default" hierarchy="secondary" size="cozy">
                    Back to Templates
                </Button>
            </Link>
            <Button
                variant="brand"
                hierarchy="primary"
                size="cozy"
                disabled={!enabled || busy}
                onClick={() => setProcessOpen(true)}
                leadingIconChild={<PaperAirplaneIcon className="size-4" />}
            >
                Process queue now
            </Button>
        </div>
    );

    const pageHeader = (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-[29px] font-semibold tracking-tight text-white">
                Email Queue
            </h1>
            {headerActions}
        </div>
    );

    if (!enabled) {
        return (
            <div className={pageShellClass}>
                <div className="flex flex-col gap-6">
                    {pageHeader}
                    <div className="py-10 text-center">
                        <p className="text-lg text-white/60">
                            {hackathons.length > 0
                                ? 'Select a hackathon to view the email queue.'
                                : 'No hackathons found.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={pageShellClass}>
            <div className="flex flex-col gap-6">
                {pageHeader}

                <div className="flex flex-wrap items-center gap-2.5">
                    <StatChip label="Pending" value={counts?.pending ?? 0} />
                    <StatChip label="Sent" value={counts?.sent ?? 0} />
                    <StatChip label="Failed" value={counts?.failed ?? 0} />
                    <StatChip label="Total" value={counts?.total ?? 0} />
                    {(counts?.failed ?? 0) > 0 && (
                        <Button
                            variant="caution"
                            hierarchy="secondary"
                            size="compact"
                            disabled={busy}
                            onClick={() =>
                                retryFailed.mutate({
                                    hackathonId: hackathonIdInput,
                                })
                            }
                            leadingIconChild={
                                <ArrowPathIcon className="size-4" />
                            }
                        >
                            Retry all failed
                        </Button>
                    )}
                </div>

                {breakdown.length > 0 && (
                    <details className="overflow-hidden rounded-xl border border-neutral-600/30 bg-neutral-800/60">
                        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white/80 select-none">
                            Breakdown by category / template ({breakdown.length}
                            )
                        </summary>
                        <div className="border-t border-neutral-600/30 px-4 py-3">
                            <div className="flex flex-col gap-2">
                                {breakdown.map((row, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-neutral-900/50 px-3 py-2 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium text-white">
                                                {row.templateTitle ??
                                                    'No template'}
                                            </p>
                                            <p className="text-white/40">
                                                {formatEmailType(row.emailType)}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-white/70">
                                            <span>Pending {row.pending}</span>
                                            <span>Sent {row.sent}</span>
                                            <span>Failed {row.failed}</span>
                                            <span>Total {row.total}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </details>
                )}

                <div className="overflow-hidden rounded-xl border border-neutral-600/30 bg-neutral-800/60 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <FilterField label="Status">
                            <Select
                                value={statusFilter}
                                onValueChange={(v) =>
                                    setStatusFilter(v as StatusFilter)
                                }
                            >
                                <SelectTrigger className="w-full">
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
                        </FilterField>
                        <FilterField label="Email type">
                            <Select
                                value={emailTypeFilter}
                                onValueChange={setEmailTypeFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>
                                        All types
                                    </SelectItem>
                                    {emailTypeOptions.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {formatEmailType(t)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <FilterField label="Template">
                            <Select
                                value={templateFilter}
                                onValueChange={setTemplateFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>
                                        All templates
                                    </SelectItem>
                                    {templates.map((t) => (
                                        <SelectItem
                                            key={t.id}
                                            value={String(t.id)}
                                        >
                                            {t.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <FilterField label="Search">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name or email"
                                className={filterControlClass}
                            />
                        </FilterField>
                        <FilterField label="Created from">
                            <Input
                                type="date"
                                value={createdFrom}
                                onChange={(e) => setCreatedFrom(e.target.value)}
                                className={filterControlClass}
                            />
                        </FilterField>
                        <FilterField label="Created to">
                            <Input
                                type="date"
                                value={createdTo}
                                onChange={(e) => setCreatedTo(e.target.value)}
                                className={filterControlClass}
                            />
                        </FilterField>
                        <FilterField label="Sent from">
                            <Input
                                type="date"
                                value={sentFrom}
                                onChange={(e) => setSentFrom(e.target.value)}
                                className={filterControlClass}
                            />
                        </FilterField>
                        <FilterField label="Sent to">
                            <Input
                                type="date"
                                value={sentTo}
                                onChange={(e) => setSentTo(e.target.value)}
                                className={filterControlClass}
                            />
                        </FilterField>
                    </div>
                </div>

                {itemsQuery.isLoading ? (
                    <div className="py-10 text-center text-white/60">
                        Loading email queue...
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-lg text-white/60">
                            No emails in the queue for this filter.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-xl border border-neutral-600/30 bg-neutral-800/60">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Recipient</TableHead>
                                        <TableHead>Email Type</TableHead>
                                        <TableHead>Template</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Failed</TableHead>
                                        <TableHead>Error</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Sent</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium text-white">
                                                    {formatName(
                                                        item.firstName,
                                                        item.lastName
                                                    )}
                                                </div>
                                                <div className="text-white/50">
                                                    {item.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatEmailType(
                                                    item.emailType
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.templateTitle ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex h-7 items-center rounded-lg px-3 text-xs font-medium ${statusChipClass(
                                                        item.status
                                                    )}`}
                                                >
                                                    {statusChipLabel(
                                                        item.status
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {item.failedCount}
                                                {item.failedCount > 0
                                                    ? ` / ${maxRetries}`
                                                    : ''}
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                {item.errorMessage ? (
                                                    <details>
                                                        <summary className="cursor-pointer truncate text-white/60 select-none">
                                                            {item.errorMessage}
                                                        </summary>
                                                        <div className="mt-1 text-xs break-words whitespace-pre-wrap text-white/70">
                                                            {item.errorMessage}
                                                        </div>
                                                    </details>
                                                ) : (
                                                    <span className="text-white/40">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {formatTimestamp(
                                                    item.createdAt
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {formatTimestamp(item.sentAt)}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {item.status === 'pending' && (
                                                    <Button
                                                        variant="brand"
                                                        hierarchy="secondary"
                                                        size="compact"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            sendNow.mutate({
                                                                ids: [item.id],
                                                            })
                                                        }
                                                        leadingIconChild={
                                                            <PaperAirplaneIcon className="size-4" />
                                                        }
                                                    >
                                                        Send now
                                                    </Button>
                                                )}
                                                {item.status === 'failed' && (
                                                    <Button
                                                        variant="caution"
                                                        hierarchy="secondary"
                                                        size="compact"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            retryFailed.mutate({
                                                                ids: [item.id],
                                                            })
                                                        }
                                                        leadingIconChild={
                                                            <ArrowPathIcon className="size-4" />
                                                        }
                                                    >
                                                        Retry
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {itemsQuery.hasNextPage && (
                            <div className="flex justify-center">
                                <Button
                                    variant="default"
                                    hierarchy="secondary"
                                    size="cozy"
                                    disabled={itemsQuery.isFetchingNextPage}
                                    onClick={() => itemsQuery.fetchNextPage()}
                                >
                                    {itemsQuery.isFetchingNextPage
                                        ? 'Loading...'
                                        : 'Load more'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Dialog open={processOpen} onOpenChange={setProcessOpen}>
                <DialogContent className="border border-neutral-600/40">
                    <DialogHeader>
                        <DialogTitle>Process the queue now?</DialogTitle>
                        <DialogDescription>
                            This sends the pending emails for this hackathon
                            immediately instead of waiting for the 30-minute
                            cron. It respects the hourly sending quota.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            size="cozy"
                            onClick={() => setProcessOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            disabled={processNow.isPending}
                            onClick={() => {
                                processNow.mutate({
                                    hackathonId: hackathonIdInput,
                                });
                                setProcessOpen(false);
                            }}
                        >
                            {processNow.isPending
                                ? 'Processing...'
                                : 'Process now'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
