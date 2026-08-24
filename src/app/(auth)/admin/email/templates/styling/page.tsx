'use client';

import { useState } from 'react';
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/trpc/client';
import { EMAIL_STYLING_BODY_PLACEHOLDER } from '@/db/schema/emails';
import { prepareEmailPreview } from '../emailPreview';

const SAMPLE_BODY =
    '<p>Hello {{firstName}}!</p><p>This is how the styling looks with sample body content.</p>';

const pageShellClass = 'w-full max-w-full min-w-0';

function formatTimestamp(value: Date | string): string {
    return dayjs(value).format('MMMM D, YYYY [@] h:mm A');
}

export default function EmailTemplateStylingPage() {
    const { toast } = useToast();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const {
        data: stylingList,
        isLoading,
        refetch,
    } = trpc.emailTemplateStyling.getList.useQuery();

    const deleteMutation = trpc.emailTemplateStyling.delete.useMutation({
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Styling deleted successfully',
                variant: 'default',
            });
            refetch();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: `Error deleting styling: ${error.message}`,
                variant: 'default',
            });
        },
    });

    const handleDelete = async (id: number) => {
        if (!confirm('DELETE')) return;
        await deleteMutation.mutateAsync({ id });
        if (expandedId === id) {
            setExpandedId(null);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    if (isLoading) {
        return (
            <div className={`${pageShellClass} text-center text-white/60`}>
                Loading stylings...
            </div>
        );
    }

    const list = stylingList ?? [];
    const invalidCount = list.filter(
        (s) => !s.html.includes(EMAIL_STYLING_BODY_PLACEHOLDER)
    ).length;

    return (
        <div className={pageShellClass}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-[29px] font-semibold tracking-tight text-white">
                        Email Template Styling
                    </h1>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link href="/admin/email/templates">
                            <Button
                                variant="default"
                                hierarchy="secondary"
                                size="cozy"
                                leadingIconChild={
                                    <ArrowLeftIcon className="size-4" />
                                }
                            >
                                Back to Templates
                            </Button>
                        </Link>
                        <Link href="/admin/email/templates/styling/new">
                            <Button
                                variant="brand"
                                hierarchy="primary"
                                size="cozy"
                                trailingIconChild={
                                    <PlusIcon className="size-4" />
                                }
                            >
                                Create Styling
                            </Button>
                        </Link>
                    </div>
                </div>

                <p className="text-base text-white/60">
                    Styling templates define the HTML wrapper (doctype, head,
                    styles, body shell). Use{' '}
                    <code className="rounded-md bg-neutral-800 px-1.5 py-0.5 text-sm text-white">
                        {EMAIL_STYLING_BODY_PLACEHOLDER}
                    </code>{' '}
                    in the HTML where the email body should be injected.
                </p>

                {invalidCount > 0 && (
                    <Alert
                        variant="warning"
                        className="border-caution-900 bg-caution-950/60 rounded-xl"
                    >
                        <AlertTitle className="text-caution-400 text-base font-semibold">
                            Incomplete stylings
                        </AlertTitle>
                        <AlertDescription className="text-sm text-white">
                            {invalidCount} styling
                            {invalidCount === 1 ? '' : 's'}{' '}
                            {invalidCount === 1 ? 'is' : 'are'} missing{' '}
                            <code className="rounded bg-neutral-800 px-1">
                                {EMAIL_STYLING_BODY_PLACEHOLDER}
                            </code>
                            . Email templates using{' '}
                            {invalidCount === 1 ? 'it' : 'them'} won&apos;t
                            inject body content correctly.
                        </AlertDescription>
                    </Alert>
                )}

                {list.length === 0 ? (
                    <div className="rounded-xl border border-neutral-600/30 bg-neutral-800/60 px-6 py-10 text-center">
                        <p className="text-lg text-white/60">
                            No styling templates yet. Create one to reuse the
                            same layout across email templates.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {list.map((s) => {
                            const hasPlaceholder = s.html.includes(
                                EMAIL_STYLING_BODY_PLACEHOLDER
                            );
                            const isExpanded = expandedId === s.id;

                            return (
                                <div
                                    key={s.id}
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
                                        onClick={() => toggleExpand(s.id)}
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
                                                    {s.name}
                                                </h2>
                                                <p className="mt-0.5 text-base text-white/30">
                                                    HTML wrapper template
                                                </p>
                                            </div>
                                            {!hasPlaceholder && (
                                                <span className="bg-caution-950 text-caution-300 inline-flex h-7 w-fit items-center rounded-lg px-3 text-sm font-medium">
                                                    Missing{' '}
                                                    {
                                                        EMAIL_STYLING_BODY_PLACEHOLDER
                                                    }
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            className="flex shrink-0 items-center gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Link
                                                href={`/admin/email/templates/styling/edit?id=${s.id}`}
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
                                                    void handleDelete(s.id)
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
                                                            SAMPLE_BODY,
                                                            {
                                                                stylingHtml:
                                                                    s.html,
                                                            }
                                                        )}
                                                        title={`${s.name} preview`}
                                                        className="h-full min-h-[inherit] w-full border-0"
                                                        sandbox="allow-same-origin allow-scripts"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/60">
                                                <p>
                                                    Created:{' '}
                                                    {formatTimestamp(
                                                        s.createdAt
                                                    )}
                                                </p>
                                                <p>
                                                    Last Updated:{' '}
                                                    {formatTimestamp(
                                                        s.updatedAt
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
