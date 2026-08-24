'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
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

const pageShellClass =
    'w-full max-w-full min-w-0 overflow-x-hidden px-3 py-6 sm:px-4 sm:py-10';

const STATUS_FILTER_VALUES = ['all', 'pending', 'sent', 'failed'] as const;
type StatusFilter = (typeof STATUS_FILTER_VALUES)[number];

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
    all: 'All statuses',
    pending: 'Pending',
    sent: 'Sent',
    failed: 'Failed',
};

const ALL = 'all';

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

    // Each keystroke would otherwise fire an ILIKE across three unindexed columns.
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

    const header = (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl font-bold">Email Queue</h1>
            <div className="flex min-w-0 flex-wrap items-center gap-3">
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
                    <SelectTrigger className="w-full min-w-0 sm:w-[240px]">
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
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    disabled={!enabled || busy}
                    onClick={() => setProcessOpen(true)}
                >
                    Process queue now
                </Button>
                <Link href="/admin/email/templates">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        Back to Templates
                    </Button>
                </Link>
            </div>
        </div>
    );

    if (!enabled) {
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

            {/* status tiles */}
            <div className="mb-6 flex flex-wrap gap-3 text-sm text-white">
                <StatTile label="Pending" value={counts?.pending ?? 0} />
                <StatTile label="Sent" value={counts?.sent ?? 0} />
                <StatTile label="Failed" value={counts?.failed ?? 0} />
                <StatTile label="Total" value={counts?.total ?? 0} />
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
                    >
                        Retry all failed
                    </Button>
                )}
            </div>

            {/* breakdown by category / template */}
            {breakdown.length > 0 && (
                <details className="mb-6 rounded-lg border border-white/15">
                    <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-white/80 select-none">
                        Breakdown by category / template ({breakdown.length})
                    </summary>
                    <div className="overflow-x-auto px-2 pb-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email Type</TableHead>
                                    <TableHead>Template</TableHead>
                                    <TableHead>Pending</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead>Failed</TableHead>
                                    <TableHead>Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {breakdown.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            {formatEmailType(row.emailType)}
                                        </TableCell>
                                        <TableCell>
                                            {row.templateTitle ?? '-'}
                                        </TableCell>
                                        <TableCell>{row.pending}</TableCell>
                                        <TableCell>{row.sent}</TableCell>
                                        <TableCell>{row.failed}</TableCell>
                                        <TableCell>{row.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </details>
            )}

            {/* filters */}
            <div className="mb-4 flex flex-wrap items-end gap-3">
                <FilterField label="Status">
                    <Select
                        value={statusFilter}
                        onValueChange={(v) =>
                            setStatusFilter(v as StatusFilter)
                        }
                    >
                        <SelectTrigger className="w-[160px]">
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
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All types</SelectItem>
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
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All templates</SelectItem>
                            {templates.map((t) => (
                                <SelectItem key={t.id} value={String(t.id)}>
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
                        className="w-[200px]"
                    />
                </FilterField>
                <FilterField label="Created from">
                    <Input
                        type="date"
                        value={createdFrom}
                        onChange={(e) => setCreatedFrom(e.target.value)}
                        className="w-[160px]"
                    />
                </FilterField>
                <FilterField label="Created to">
                    <Input
                        type="date"
                        value={createdTo}
                        onChange={(e) => setCreatedTo(e.target.value)}
                        className="w-[160px]"
                    />
                </FilterField>
                <FilterField label="Sent from">
                    <Input
                        type="date"
                        value={sentFrom}
                        onChange={(e) => setSentFrom(e.target.value)}
                        className="w-[160px]"
                    />
                </FilterField>
                <FilterField label="Sent to">
                    <Input
                        type="date"
                        value={sentTo}
                        onChange={(e) => setSentTo(e.target.value)}
                        className="w-[160px]"
                    />
                </FilterField>
            </div>

            {/* items table */}
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
                    <div className="overflow-x-auto rounded-lg border border-white/60">
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
                                                <span className="text-white/60">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(item.createdAt)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(item.sentAt)}
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
                        <div className="mt-4 flex justify-center">
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

function StatTile({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md bg-neutral-800 px-3 py-2">
            <span className="font-medium">{label}:</span> {value}
        </div>
    );
}

function FilterField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs text-white/50">{label}</span>
            {children}
        </div>
    );
}
