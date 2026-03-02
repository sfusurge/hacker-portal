'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { EMAIL_STYLING_BODY_PLACEHOLDER } from '@/db/schema/emails';
import { prepareEmailPreview } from '../emailPreview';

const SAMPLE_BODY =
    '<p>Hello {{firstName}}!</p><p>This is how the styling looks with sample body content.</p>';

export default function EmailTemplateStylingPage() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const { data: stylingList, isLoading } =
        trpc.emailTemplateStyling.getList.useQuery();

    if (isLoading) {
        return (
            <div className="w-full py-10 text-center">Loading stylings...</div>
        );
    }

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Email Template Styling</h1>
                <div className="flex gap-2">
                    <Link href="/admin/email/templates">
                        <Button
                            variant="brand"
                            hierarchy="secondary"
                            size="cozy"
                        >
                            Back to Templates
                        </Button>
                    </Link>
                    <Link href="/admin/email/templates/styling/new">
                        <Button variant="brand" hierarchy="primary" size="cozy">
                            Create Styling
                        </Button>
                    </Link>
                </div>
            </div>

            <p className="mb-6 text-neutral-400">
                Styling templates define the HTML wrapper (doctype, head,
                styles, body shell). Use{' '}
                <code className="rounded bg-neutral-800 px-1">
                    {EMAIL_STYLING_BODY_PLACEHOLDER}
                </code>{' '}
                in the HTML where the email body should be injected.
            </p>

            {!stylingList?.length ? (
                <div className="rounded-lg border border-white/20 p-8 text-center">
                    <p className="text-neutral-400">
                        No styling templates yet. Create one to reuse the same
                        layout across email templates.
                    </p>
                    <Link href="/admin/email/templates/styling/new">
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            className="mt-4"
                        >
                            Create Styling
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {stylingList.map((s) => {
                        const hasPlaceholder = s.html.includes(
                            EMAIL_STYLING_BODY_PLACEHOLDER
                        );
                        const isExpanded = expandedId === s.id;
                        return (
                            <div
                                key={s.id}
                                className="overflow-hidden rounded-lg border border-white/20"
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-semibold">
                                            {s.name}
                                        </h2>
                                        {!hasPlaceholder && (
                                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                                                Missing{' '}
                                                {EMAIL_STYLING_BODY_PLACEHOLDER}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="brand"
                                            hierarchy="tertiary"
                                            size="cozy"
                                            onClick={() =>
                                                setExpandedId(
                                                    isExpanded ? null : s.id
                                                )
                                            }
                                        >
                                            {isExpanded
                                                ? 'Hide preview'
                                                : 'Preview'}
                                        </Button>
                                        <Link
                                            href={`/admin/email/templates/styling/edit?id=${s.id}`}
                                        >
                                            <Button
                                                variant="brand"
                                                hierarchy="secondary"
                                                size="cozy"
                                            >
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <p className="border-t border-white/10 px-4 py-1 text-sm text-neutral-500">
                                    Updated{' '}
                                    {new Date(s.updatedAt).toLocaleString()}
                                </p>
                                {isExpanded && (
                                    <div className="border-t border-white/10 p-4">
                                        <p className="mb-2 text-sm text-neutral-500">
                                            Preview with sample body:
                                        </p>
                                        <div className="h-[400px] overflow-hidden rounded-md border border-white/10 bg-white">
                                            <iframe
                                                srcDoc={prepareEmailPreview(
                                                    SAMPLE_BODY,
                                                    {
                                                        stylingHtml: s.html,
                                                    }
                                                )}
                                                title={`${s.name} preview`}
                                                className="h-full w-full border-0"
                                                sandbox="allow-same-origin allow-scripts"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
