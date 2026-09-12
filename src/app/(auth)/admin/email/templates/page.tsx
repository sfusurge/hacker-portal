'use client';

import { useState, useEffect, useRef } from 'react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    Cog6ToothIcon,
    PencilSquareIcon,
    PlusIcon,
    QueueListIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import {
    HACKATHON_EMAIL_TYPE_LABELS,
    hackathonEmailTypeEnum,
    type HackathonEmailType,
} from '@/db/schema/emails';
import { prepareEmailPreview } from './emailPreview';

const pageShellClass = 'w-full max-w-full min-w-0';

const REQUIRED_EMAIL_TYPES = (
    hackathonEmailTypeEnum.enumValues as HackathonEmailType[]
).filter((type) => type !== 'custom');

function emailTypeChipLabel(emailType: string | null | undefined): string {
    switch (emailType) {
        case 'hacker_accepted':
            return 'Hacker Accepted';
        case 'hacker_declined':
            return 'Hacker Declined';
        case 'hacker_applied':
            return 'Hacker Applied';
        case 'hacker_waitlisted':
            return 'Hacker waitlisted';
        case 'rsvp_received':
            return 'RSVP Payment Received';
        case 'rsvp_paid':
            return 'RSVP Confirmed';
        case 'custom':
            return 'Custom';
        default:
            if (emailType && emailType in HACKATHON_EMAIL_TYPE_LABELS) {
                return HACKATHON_EMAIL_TYPE_LABELS[
                    emailType as HackathonEmailType
                ];
            }
            return emailType ?? 'Untyped';
    }
}

function emailTypeChipClass(emailType: string | null | undefined): string {
    switch (emailType) {
        case 'hacker_accepted':
            return 'bg-success-950 text-success-300';
        case 'hacker_declined':
            return 'bg-danger-950 text-danger-300';
        case 'hacker_waitlisted':
            return 'bg-caution-950 text-caution-300';
        case 'rsvp_received':
            return 'bg-[#082f49] text-[#0ea5e9]';
        case 'rsvp_paid':
            return 'bg-brand-950 text-brand-300';
        case 'custom':
            return 'bg-fuchsia-950 text-fuchsia-200';
        case 'hacker_applied':
        default:
            return 'bg-neutral-800 text-white';
    }
}

function formatTemplateTimestamp(value: Date | string): string {
    return dayjs(value).format('MMMM D, YYYY [@] h:mm A');
}

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

export default function EmailTemplatesPage() {
    const { toast } = useToast();
    const [expandedTemplate, setExpandedTemplate] = useState<number | null>(
        null
    );
    const [selectedHackathonId, setSelectedHackathonId] = useState<
        number | null
    >(null);

    const hasSetInitialHackathon = useRef(false);

    const { data: hackathons = [] } = trpc.hackathons.getHackathons.useQuery();
    const activeHackathon = useAtomValue(hackathonAtom);

    const {
        data: templates,
        isLoading,
        refetch,
    } = trpc.emailTemplates.getEmailTemplates.useQuery(
        { hackathonId: selectedHackathonId! },
        { enabled: selectedHackathonId != null }
    );

    const deleteTemplateMutation =
        trpc.emailTemplates.deleteEmailTemplate.useMutation({
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Template deleted successfully',
                    variant: 'default',
                });
                refetch();
            },
            onError: (error) => {
                toast({
                    title: 'Error',
                    description: `Error deleting template: ${error.message}`,
                    variant: 'default',
                });
            },
        });

    useEffect(() => {
        if (hasSetInitialHackathon.current) return;
        if (activeHackathon?.id) {
            hasSetInitialHackathon.current = true;
            setSelectedHackathonId(activeHackathon.id);
        }
    }, [activeHackathon]);

    const handleDelete = async (id: number) => {
        if (confirm('DELETE')) {
            await deleteTemplateMutation.mutateAsync({ id });
            if (expandedTemplate === id) {
                setExpandedTemplate(null);
            }
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedTemplate((prev) => (prev === id ? null : id));
    };

    const missingEmailTypes =
        selectedHackathonId != null && templates
            ? REQUIRED_EMAIL_TYPES.filter(
                  (type) => !templates.some((t) => t.emailType === type)
              )
            : [];

    const hasHackathon = selectedHackathonId != null;
    const templatesList = hasHackathon ? (templates ?? []) : [];
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
            <Link href="/admin/email/queue">
                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<QueueListIcon className="size-4" />}
                >
                    Email Queue
                </Button>
            </Link>
            <Link href="/admin/email/templates/styling">
                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<Cog6ToothIcon className="size-4" />}
                >
                    Manage Stylings
                </Button>
            </Link>
            <Link
                href={
                    selectedHackathonId != null
                        ? `/admin/email/templates/edit?hackathonId=${selectedHackathonId}`
                        : '/admin/email/templates/edit'
                }
            >
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    trailingIconChild={<PlusIcon className="size-4" />}
                >
                    Create Template
                </Button>
            </Link>
        </div>
    );

    const pageHeader = (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-[29px] font-semibold tracking-tight text-white">
                Email Templates
            </h1>
            {headerActions}
        </div>
    );

    const missingAlert =
        hasHackathon && missingEmailTypes.length > 0 ? (
            <Alert
                variant="warning"
                className="border-caution-900 bg-caution-950/60 rounded-xl"
            >
                <AlertTitle className="text-caution-400 text-base font-semibold">
                    Missing templates for this hackathon
                </AlertTitle>
                <AlertDescription className="text-sm text-white">
                    You don&apos;t have an email template for these statuses
                    yet. Create one to cover missing hackathon email flows.
                </AlertDescription>
                <div className="mt-2 flex flex-wrap gap-3">
                    {missingEmailTypes.map((type) => (
                        <Link
                            key={type}
                            href={`/admin/email/templates/edit?hackathonId=${selectedHackathonId}&emailType=${type}`}
                        >
                            <Button
                                variant="default"
                                hierarchy="secondary"
                                size="compact"
                                trailingIconChild={
                                    <PlusIcon className="size-4" />
                                }
                            >
                                {emailTypeChipLabel(type)}
                            </Button>
                        </Link>
                    ))}
                </div>
            </Alert>
        ) : null;

    if (isLoading) {
        return (
            <div className={`${pageShellClass} text-center text-white/60`}>
                Loading templates...
            </div>
        );
    }

    if (!hasHackathon && hackathons.length === 0) {
        return (
            <div className={`${pageShellClass} text-center`}>
                <p className="text-lg text-white/60">
                    No hackathons found. Create a hackathon first to manage
                    email templates.
                </p>
            </div>
        );
    }

    return (
        <div className={pageShellClass}>
            <div className="flex flex-col gap-6">
                {pageHeader}
                {missingAlert}

                {!hasHackathon ? (
                    <div className="py-10 text-center">
                        <p className="text-lg text-white/60">
                            Select a hackathon to view and manage email
                            templates.
                        </p>
                    </div>
                ) : templatesList.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-lg text-white">
                            No email templates found for this hackathon.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {templatesList.map((template) => {
                            const isExpanded = expandedTemplate === template.id;

                            return (
                                <div
                                    key={template.id}
                                    className={clsx(
                                        'overflow-hidden rounded-xl border border-neutral-600/30 bg-neutral-800/60',
                                        isExpanded
                                            ? 'flex flex-col gap-4 px-4 py-4'
                                            : 'flex items-center gap-4 p-4'
                                    )}
                                >
                                    <div
                                        className={
                                            'flex w-full cursor-pointer items-center gap-4'
                                        }
                                        onClick={() =>
                                            toggleExpand(template.id)
                                        }
                                    >
                                        <span className="shrink-0 text-white">
                                            {isExpanded ? (
                                                <ChevronDownIcon className="size-6" />
                                            ) : (
                                                <ChevronRightIcon className="size-6" />
                                            )}
                                        </span>

                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <div className="min-w-0">
                                                <h2 className="text-xl font-semibold tracking-tight text-white">
                                                    {template.title}
                                                </h2>
                                                <p className="mt-0.5 text-base text-white/30">
                                                    {template.purpose}
                                                </p>
                                            </div>
                                            <div className="w-max">
                                                <EmailTypeChip
                                                    emailType={
                                                        template.emailType
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className="flex shrink-0 items-center gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Link
                                                href={`/admin/email/templates/edit?id=${template.id}`}
                                            >
                                                <Button
                                                    variant="default"
                                                    hierarchy="secondary"
                                                    size="compact"
                                                    leadingIconChild={
                                                        <PencilSquareIcon className="size-4" />
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                hierarchy="primary"
                                                size="compact"
                                                leadingIconChild={
                                                    <TrashIcon className="size-4" />
                                                }
                                                onClick={() =>
                                                    void handleDelete(
                                                        template.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <>
                                            <div className="w-full overflow-hidden rounded-xl bg-white">
                                                <div className="h-[min(50vh,360px)] min-h-[220px] w-full overflow-auto">
                                                    <iframe
                                                        srcDoc={prepareEmailPreview(
                                                            template.content,
                                                            {
                                                                stylingHtml:
                                                                    template.stylingHtml?.trim() ||
                                                                    undefined,
                                                                markdownBodyOnly:
                                                                    template.stylingId !=
                                                                        null &&
                                                                    !template.stylingHtml?.trim(),
                                                            }
                                                        )}
                                                        title={`${template.title} Preview`}
                                                        className="h-full min-h-[inherit] w-full border-0"
                                                        sandbox="allow-same-origin allow-scripts"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-wrap gap-x-6 gap-y-1 text-sm text-white/60">
                                                <p>
                                                    Created:{' '}
                                                    {formatTemplateTimestamp(
                                                        template.createdAt
                                                    )}
                                                </p>
                                                <p>
                                                    Last Updated:{' '}
                                                    {formatTemplateTimestamp(
                                                        template.updatedAt
                                                    )}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
