'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Row } from '@tanstack/react-table';
import {
    ArrowUpIcon,
    ChevronUpDownIcon,
    EnvelopeIcon,
} from '@heroicons/react/16/solid';
import { FlagIcon } from '@heroicons/react/24/solid';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/trpc/client';
import {
    HACKATHON_EMAIL_TYPE_LABELS,
    type HackathonEmailType,
} from '@/db/schema/emails';
import type { StatusEnum } from '@/db/schema/applications';
import { prepareEmailPreview } from '@/app/(auth)/admin/email/templates/emailPreview';
import { CurrentStatusCell, StatusChip } from './statusCells';
import type { Applicant } from './types';

function emailTypeDisplayLabel(emailType: string | null | undefined): string {
    if (emailType && emailType in HACKATHON_EMAIL_TYPE_LABELS) {
        return HACKATHON_EMAIL_TYPE_LABELS[emailType as HackathonEmailType];
    }
    if (emailType) {
        return emailType;
    }
    return 'No type set';
}

function emailTypeChipLabel(emailType: string | null | undefined): string {
    switch (emailType) {
        case 'hacker_accepted':
            return 'Hacker Accepted';
        case 'hacker_declined':
            return 'Hacker Declined';
        case 'hacker_applied':
            return 'Hacker Applied';
        case 'hacker_waitlisted':
            return 'Waitlisted';
        case 'rsvp_received':
            return 'RSVP Received';
        case 'rsvp_paid':
            return 'RSVP Paid';
        case 'custom':
            return 'Custom';
        default:
            return emailTypeDisplayLabel(emailType);
    }
}

function emailTypeChipClass(emailType: string | null | undefined): string {
    switch (emailType) {
        case 'hacker_accepted':
        case 'rsvp_received':
        case 'rsvp_paid':
            return 'bg-success-950 text-success-300';
        case 'hacker_declined':
            return 'bg-danger-950 text-danger-300';
        case 'hacker_waitlisted':
            return 'bg-caution-950 text-caution-300';
        default:
            return 'bg-neutral-800 text-white';
    }
}

const REVIEW_BULK_ALLOWED_EMAIL_TYPES = new Set<HackathonEmailType>([
    'hacker_accepted',
    'hacker_waitlisted',
    'hacker_declined',
    'custom',
]);

function isTemplateEligibleForReviewBulkSend(
    emailType: string | null | undefined
): boolean {
    if (emailType == null || emailType === '') {
        return true;
    }
    return REVIEW_BULK_ALLOWED_EMAIL_TYPES.has(emailType as HackathonEmailType);
}

type ModalStep = 'template' | 'recipients' | 'confirm' | 'success';
type RecipientsSortKey = 'name' | 'status' | 'lastEmailSent';

type BulkEmailModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hackathonId: number;
    selectedRows: Row<Applicant>[];
    batchUpdateApplicationStatus: {
        mutateAsync: (input: {
            hackathonId: number;
            userIds: number[];
            pendingStatus?: StatusEnum;
            status?: StatusEnum;
        }) => Promise<unknown>;
    };
    onSent?: () => void;
};

function EmailTypeChip({
    emailType,
}: {
    emailType: string | null | undefined;
}) {
    return (
        <span
            className={clsx(
                'inline-flex h-7 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap',
                emailTypeChipClass(emailType)
            )}
        >
            {emailTypeChipLabel(emailType)}
        </span>
    );
}

export function BulkEmailModal({
    open,
    onOpenChange,
    hackathonId,
    selectedRows,
    batchUpdateApplicationStatus,
    onSent,
}: BulkEmailModalProps) {
    const batchUpdateLastEmailSent =
        trpc.applications.batchUpdateLastEmailSent.useMutation();
    const queueBatchEmails = trpc.emailQueue.queueBatchEmails.useMutation();
    const { data: hackathons = [] } = trpc.hackathons.getHackathons.useQuery();
    const [isSending, setIsSending] = useState(false);
    const [step, setStep] = useState<ModalStep>('template');
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
        null
    );
    const [selectedHackathonForEmail, setSelectedHackathonForEmail] = useState<
        number | null
    >(hackathonId);
    const [recipientsSort, setRecipientsSort] = useState<{
        key: RecipientsSortKey;
        desc: boolean;
    }>({ key: 'name', desc: false });
    const [queuedCount, setQueuedCount] = useState(0);
    const { toast } = useToast();

    const effectiveHackathonForEmail = selectedHackathonForEmail ?? hackathonId;
    const { data: emailTemplates, isLoading: templatesLoading } =
        trpc.emailTemplates.getEmailTemplates.useQuery({
            hackathonId: effectiveHackathonForEmail,
        });

    const recipients = useMemo(
        () => selectedRows.map((row) => row.original),
        [selectedRows]
    );

    const statusBreakdown = useMemo(() => {
        const counts = new Map<string, number>();
        for (const r of recipients) {
            const key = r.pendingStatus || 'N/A';
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
        const primary = sorted[0];
        const restCount = sorted.slice(1).reduce((sum, [, n]) => sum + n, 0);
        const restStatuses = Math.max(0, sorted.length - 1);
        return {
            primaryStatus: primary?.[0] ?? 'N/A',
            primaryCount: primary?.[1] ?? 0,
            restStatuses,
            restCount,
        };
    }, [recipients]);

    const selectedEmailTemplate = useMemo(() => {
        if (selectedTemplateId == null) return null;
        return emailTemplates?.find((t) => t.id === selectedTemplateId) ?? null;
    }, [emailTemplates, selectedTemplateId]);

    const resultingStatus = useMemo(() => {
        const counts = new Map<string, number>();
        for (const r of recipients) {
            const next =
                r.pendingStatus && r.pendingStatus !== 'N/A'
                    ? r.pendingStatus
                    : r.currentStatus;
            counts.set(next, (counts.get(next) ?? 0) + 1);
        }
        return (
            [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
            'Accepted'
        );
    }, [recipients]);

    const statusWillChange = useMemo(
        () =>
            recipients.some(
                (r) =>
                    r.pendingStatus &&
                    r.pendingStatus !== 'N/A' &&
                    r.pendingStatus !== r.currentStatus
            ),
        [recipients]
    );

    const previewHtml = useMemo(() => {
        if (!selectedEmailTemplate) return '';
        return prepareEmailPreview(selectedEmailTemplate.content, {
            stylingHtml: selectedEmailTemplate.stylingHtml?.trim() || undefined,
            markdownBodyOnly:
                selectedEmailTemplate.stylingId != null &&
                !selectedEmailTemplate.stylingHtml?.trim(),
        });
    }, [selectedEmailTemplate]);

    const sortedRecipients = useMemo(() => {
        const list = [...recipients];
        const { key, desc } = recipientsSort;
        list.sort((a, b) => {
            let cmp = 0;
            if (key === 'name') {
                cmp = `${a.firstName} ${a.lastName}`.localeCompare(
                    `${b.firstName} ${b.lastName}`
                );
            } else if (key === 'status') {
                cmp = (a.pendingStatus || '').localeCompare(
                    b.pendingStatus || ''
                );
            } else {
                cmp = (a.lastEmailSent || '').localeCompare(
                    b.lastEmailSent || ''
                );
            }
            return desc ? -cmp : cmp;
        });
        return list;
    }, [recipients, recipientsSort]);

    useEffect(() => {
        if (!open) return;
        setStep('template');
        setSelectedTemplateId(null);
        setSelectedHackathonForEmail(hackathonId);
        setIsSending(false);
        setQueuedCount(0);
        setRecipientsSort({ key: 'name', desc: false });
    }, [open, hackathonId]);

    useEffect(() => {
        setSelectedTemplateId(null);
    }, [effectiveHackathonForEmail]);

    const toggleRecipientsSort = (key: RecipientsSortKey) => {
        setRecipientsSort((prev) =>
            prev.key === key ? { key, desc: !prev.desc } : { key, desc: false }
        );
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    const handleSendingEmails = async () => {
        try {
            if (!selectedTemplateId || !selectedEmailTemplate) {
                toast({
                    title: 'Error',
                    description: 'Please select an email template',
                    variant: 'default',
                });
                return;
            }

            setIsSending(true);

            const rowData = recipients.map((r) => ({
                id: r.id,
                firstName: r.firstName,
                lastName: r.lastName,
                email: r.email,
                pendingStatus: r.pendingStatus,
                currentStatus: r.currentStatus,
            }));

            const queueResult = await queueBatchEmails.mutateAsync({
                templateId: selectedTemplateId,
                users: rowData.map((r) => ({
                    id: r.id,
                    email: r.email,
                    firstName: r.firstName,
                    lastName: r.lastName,
                })),
                hackathonId: effectiveHackathonForEmail,
                emailType:
                    selectedEmailTemplate.emailType ??
                    selectedEmailTemplate.purpose,
            });

            const userIds = rowData.map((r) => r.id);

            try {
                await batchUpdateLastEmailSent.mutateAsync({
                    hackathonId,
                    userIds,
                    emailType: selectedEmailTemplate.purpose,
                });

                await batchUpdateApplicationStatus.mutateAsync({
                    userIds,
                    hackathonId,
                    pendingStatus: 'N/A',
                });
            } catch (error) {
                console.error(
                    'Error batch-updating last email sent / pending status:',
                    error
                );
                toast({
                    title: 'Error',
                    description:
                        'Emails were queued, but updating applicant status failed.',
                });
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
                    const ids = items.map(({ id }) => id);

                    try {
                        await batchUpdateApplicationStatus.mutateAsync({
                            userIds: ids,
                            hackathonId,
                            status: status as StatusEnum,
                        });
                    } catch (error) {
                        console.error(error);
                        toast({
                            title: 'Error',
                            description: `Failed to update status to ${status}`,
                        });
                    }
                })
            );

            setQueuedCount(queueResult.queued);
            setStep('success');
            setIsSending(false);
            onSent?.();
        } catch (error) {
            console.error('Error in email sending process:', error);
            toast({
                title: 'Error',
                description: 'Failed to queue emails.',
            });
            setIsSending(false);
        }
    };

    if (!open) return null;

    const recipientCount = recipients.length;
    const canProceed = selectedTemplateId != null && recipientCount > 0;
    const showTabs = step === 'template' || step === 'recipients';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111]/50"
            onClick={handleClose}
        >
            <div
                className="flex max-h-[min(90vh,684px)] w-full max-w-[600px] flex-col overflow-hidden rounded-xl border border-neutral-600/60 bg-[#1f1f1f] text-white shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
                    {step === 'success' ? (
                        <SuccessStep
                            title={selectedEmailTemplate?.title ?? 'email'}
                            recipientCount={queuedCount || recipientCount}
                        />
                    ) : step === 'confirm' ? (
                        <ConfirmStep
                            template={selectedEmailTemplate}
                            previewHtml={previewHtml}
                            recipientCount={recipientCount}
                            resultingStatus={resultingStatus}
                            statusWillChange={statusWillChange}
                        />
                    ) : (
                        <>
                            <div className="flex items-center gap-2.5">
                                <h2 className="flex-1 text-2xl font-semibold tracking-tight text-white">
                                    Send Emails
                                </h2>
                                {showTabs && (
                                    <div className="flex overflow-hidden rounded-lg border border-neutral-600/60">
                                        <button
                                            type="button"
                                            className={clsx(
                                                'inline-flex min-h-9 items-center gap-2 border-r border-neutral-600/60 py-0 pr-4 pl-3 text-sm',
                                                step === 'template'
                                                    ? 'bg-brand-950 text-brand-50'
                                                    : 'bg-neutral-800/60 text-white'
                                            )}
                                            onClick={() => setStep('template')}
                                        >
                                            <EnvelopeIcon className="size-4" />
                                            Template
                                        </button>
                                        <button
                                            type="button"
                                            className={clsx(
                                                'inline-flex min-h-9 items-center gap-2 py-0 pr-4 pl-3 text-sm',
                                                step === 'recipients'
                                                    ? 'bg-brand-950 text-brand-50'
                                                    : 'bg-neutral-800/60 text-white'
                                            )}
                                            onClick={() =>
                                                setStep('recipients')
                                            }
                                        >
                                            <UserGroupIcon className="size-4" />
                                            Recipients
                                        </button>
                                    </div>
                                )}
                            </div>

                            <RecipientSummary
                                total={recipientCount}
                                breakdown={statusBreakdown}
                            />

                            {step === 'template' ? (
                                <TemplateStep
                                    hackathons={hackathons}
                                    selectedHackathonId={
                                        effectiveHackathonForEmail
                                    }
                                    onHackathonChange={
                                        setSelectedHackathonForEmail
                                    }
                                    templatesLoading={templatesLoading}
                                    templates={emailTemplates ?? []}
                                    selectedTemplateId={selectedTemplateId}
                                    onSelectTemplate={setSelectedTemplateId}
                                />
                            ) : (
                                <RecipientsStep
                                    recipients={sortedRecipients}
                                    sort={recipientsSort}
                                    onToggleSort={toggleRecipientsSort}
                                />
                            )}
                        </>
                    )}
                </div>

                <div className="shrink-0 border-t border-neutral-600/30 p-6">
                    {step === 'success' ? (
                        <Button
                            type="button"
                            variant="brand"
                            hierarchy="primary"
                            size="compact"
                            className="w-full"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    ) : step === 'confirm' ? (
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="default"
                                hierarchy="secondary"
                                size="compact"
                                className="flex-1"
                                onClick={() => setStep('template')}
                                disabled={isSending}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                variant="brand"
                                hierarchy="primary"
                                size="compact"
                                className="flex-1"
                                disabled={isSending || !canProceed}
                                onClick={() => void handleSendingEmails()}
                            >
                                {isSending ? 'Sending…' : 'Send'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="default"
                                hierarchy="secondary"
                                size="compact"
                                className="flex-1"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                hierarchy="secondary"
                                size="compact"
                                className="flex-1"
                                disabled={!canProceed}
                                onClick={() => setStep('confirm')}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <Toaster />
        </div>
    );
}

function RecipientSummary({
    total,
    breakdown,
}: {
    total: number;
    breakdown: {
        primaryStatus: string;
        primaryCount: number;
        restStatuses: number;
        restCount: number;
    };
}) {
    return (
        <div className="flex items-center gap-6 py-2">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-white">
                    Selected Recipients
                </p>
                <p className="text-2xl font-semibold tracking-tight text-white">
                    {total}
                </p>
            </div>
            <div className="flex flex-col gap-1.5 border-l border-neutral-600/60 px-5">
                <div className="flex items-center gap-6">
                    <StatusChip
                        status={breakdown.primaryStatus}
                        className="w-28"
                    />
                    <span className="w-9 text-base font-medium text-white">
                        {breakdown.primaryCount}
                    </span>
                </div>
                {breakdown.restStatuses > 0 && (
                    <div className="flex items-center gap-6">
                        <p className="w-28 text-sm text-white/60">
                            + {breakdown.restStatuses} status
                            {breakdown.restStatuses === 1 ? '' : 'es'}
                        </p>
                        <span className="w-9 text-base font-medium text-white">
                            {breakdown.restCount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function TemplateStep({
    hackathons,
    selectedHackathonId,
    onHackathonChange,
    templatesLoading,
    templates,
    selectedTemplateId,
    onSelectTemplate,
}: {
    hackathons: { id: number; name: string }[];
    selectedHackathonId: number;
    onHackathonChange: (id: number) => void;
    templatesLoading: boolean;
    templates: {
        id: number;
        title: string;
        purpose: string;
        emailType: string | null;
    }[];
    selectedTemplateId: number | null;
    onSelectTemplate: (id: number) => void;
}) {
    const selectedType =
        templates.find((t) => t.id === selectedTemplateId)?.emailType ?? null;

    return (
        <>
            <div className="flex w-full flex-col gap-2">
                <label className="flex gap-1 text-sm font-semibold text-white/60">
                    Hackathon
                    <span className="text-brand-400 font-medium">*</span>
                </label>
                <div className="relative">
                    <select
                        className="min-h-11 w-full appearance-none rounded-lg border border-neutral-600/60 bg-neutral-800/60 py-2 pr-10 pl-3 text-base font-medium text-white backdrop-blur-md outline-none"
                        value={selectedHackathonId}
                        onChange={(e) =>
                            onHackathonChange(Number(e.target.value))
                        }
                    >
                        {hackathons.length === 0 ? (
                            <option value={selectedHackathonId}>
                                Loading…
                            </option>
                        ) : (
                            hackathons.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.name}
                                </option>
                            ))
                        )}
                    </select>
                    <ChevronUpDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-white/60" />
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="flex gap-1 text-sm font-semibold text-white/60">
                    Email Template
                    <span className="text-brand-400 font-medium">*</span>
                </div>
                {templatesLoading ? (
                    <p className="text-sm text-white/60">Loading templates…</p>
                ) : templates.length === 0 ? (
                    <p className="text-sm text-white/60">
                        No email templates for this hackathon.
                    </p>
                ) : (
                    <div className="flex max-h-[275px] flex-col overflow-y-auto rounded-xl border border-neutral-600/30">
                        {templates.map((template) => {
                            const selected = selectedTemplateId === template.id;
                            const dimmed =
                                selectedTemplateId != null &&
                                !selected &&
                                selectedType != null &&
                                template.emailType !== selectedType;
                            const eligible =
                                isTemplateEligibleForReviewBulkSend(
                                    template.emailType
                                );

                            return (
                                <button
                                    type="button"
                                    key={template.id}
                                    onClick={() =>
                                        onSelectTemplate(template.id)
                                    }
                                    className={clsx(
                                        'flex w-full items-center gap-3 border border-neutral-600/60 p-3 text-left transition-colors',
                                        selected
                                            ? 'border-brand-900 bg-[rgba(29,27,75,0.6)]'
                                            : 'bg-neutral-800/60',
                                        dimmed && 'opacity-25',
                                        !eligible &&
                                            selectedTemplateId == null &&
                                            'opacity-60'
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border',
                                            selected
                                                ? 'border-brand-500 bg-brand-500'
                                                : 'border-neutral-500/60 bg-transparent'
                                        )}
                                        aria-hidden
                                    >
                                        {selected && (
                                            <span className="size-2 rounded-full bg-white" />
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-white">
                                            {template.title}
                                        </p>
                                        <p className="truncate text-xs font-medium text-white/30">
                                            {template.purpose}
                                        </p>
                                    </div>
                                    <EmailTypeChip
                                        emailType={template.emailType}
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

function RecipientsStep({
    recipients,
    sort,
    onToggleSort,
}: {
    recipients: Applicant[];
    sort: { key: RecipientsSortKey; desc: boolean };
    onToggleSort: (key: RecipientsSortKey) => void;
}) {
    const SortHeader = ({
        label,
        sortKey,
        className,
    }: {
        label: string;
        sortKey: RecipientsSortKey;
        className?: string;
    }) => (
        <button
            type="button"
            className={clsx(
                'inline-flex items-center gap-1 text-sm font-semibold text-white',
                className
            )}
            onClick={() => onToggleSort(sortKey)}
        >
            {label}
            <ChevronUpDownIcon
                className={clsx(
                    'size-3.5 text-white/50',
                    sort.key === sortKey && 'text-white'
                )}
            />
        </button>
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
            <p className="text-sm font-semibold text-white/60">
                Edit Recipients
            </p>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-neutral-600/30 bg-neutral-800/40">
                <table className="w-full table-fixed border-collapse text-left">
                    <thead className="sticky top-0 z-10 bg-neutral-800">
                        <tr className="border-b border-neutral-600/40">
                            <th className="h-12 px-3 font-normal">
                                <SortHeader label="Name" sortKey="name" />
                            </th>
                            <th className="h-12 px-3 font-normal">
                                <SortHeader label="Status" sortKey="status" />
                            </th>
                            <th className="h-12 px-3 font-normal" colSpan={2}>
                                <SortHeader
                                    label="Last Template Sent"
                                    sortKey="lastEmailSent"
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipients.map((r) => (
                            <tr
                                key={r.id}
                                className="border-b border-neutral-600/30 last:border-b-0"
                            >
                                <td className="h-11 truncate px-3 text-base text-white">
                                    {r.firstName} {r.lastName}
                                </td>
                                <td className="h-11 px-3">
                                    <StatusChip status={r.pendingStatus} />
                                </td>
                                <td className="h-11 truncate px-3 text-base text-white/80">
                                    {r.lastEmailSent || 'N/A'}
                                </td>
                                <td className="h-11 w-11 px-2">
                                    {r.flagged ? (
                                        <FlagIcon className="size-5 text-orange-400" />
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                        {recipients.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-3 py-8 text-center text-sm text-white/50"
                                >
                                    No recipients selected.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ConfirmStep({
    template,
    previewHtml,
    recipientCount,
    resultingStatus,
    statusWillChange,
}: {
    template: {
        title: string;
        purpose: string;
        content: string;
        stylingHtml?: string | null;
    } | null;
    previewHtml: string;
    recipientCount: number;
    resultingStatus: string;
    statusWillChange: boolean;
}) {
    return (
        <>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
                Confirm Email Settings
            </h2>

            <div className="min-h-[200px] flex-1 overflow-hidden rounded-xl bg-[#fafafa]">
                {template ? (
                    <iframe
                        title="Email preview"
                        srcDoc={previewHtml}
                        className="h-full min-h-[220px] w-full border-0"
                        sandbox="allow-same-origin"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                        No template selected
                    </div>
                )}
            </div>

            <div className="flex gap-6">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="text-sm font-medium text-white/60">Email</p>
                    <p className="text-base font-semibold text-white">
                        “{template?.title ?? '—'}”
                    </p>
                    <p className="text-sm font-medium text-white/60">
                        {template?.purpose}
                    </p>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="text-sm font-medium text-white/60">
                        Selected Recipients
                    </p>
                    <p className="text-[35px] leading-[1.125] font-semibold tracking-tight text-white">
                        {recipientCount}
                    </p>
                    <div className="flex items-center gap-0.5">
                        {statusWillChange && (
                            <span className="bg-success-950 inline-flex items-center justify-center rounded-lg px-0.5">
                                <ArrowUpIcon className="text-success-300 size-4" />
                            </span>
                        )}
                        <CurrentStatusCell value={resultingStatus} />
                    </div>
                </div>
            </div>

            <Alert
                variant="info"
                className="border-brand-900 rounded-xl bg-[rgba(29,27,75,0.6)] px-3 py-3"
            >
                <AlertTitle className="text-brand-400 text-base font-semibold">
                    This can’t be undone.
                </AlertTitle>
                <AlertDescription className="text-sm text-white">
                    Once you hit Send, this email is queued and sent to{' '}
                    {recipientCount} recipient
                    {recipientCount === 1 ? '' : 's'}.
                </AlertDescription>
            </Alert>
        </>
    );
}

function SuccessStep({
    title,
    recipientCount,
}: {
    title: string;
    recipientCount: number;
}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-6 text-center">
            <p className="text-brand-50 text-[29px] font-semibold tracking-tight">
                Emails have been queued!
            </p>
            <div className="h-[202px] w-[360px] overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/login/otter-mail.png"
                    alt=""
                    className="size-full object-cover"
                />
            </div>
            <p className="max-w-[368px] text-base leading-relaxed text-white/60">
                Your email &quot;{title}&quot; is on its way to {recipientCount}{' '}
                recipient{recipientCount === 1 ? '' : 's'}.
            </p>
        </div>
    );
}
