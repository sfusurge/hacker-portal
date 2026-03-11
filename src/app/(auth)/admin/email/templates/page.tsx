'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { prepareEmailPreview } from './emailPreview';
import {
    HACKATHON_EMAIL_TYPE_LABELS,
    hackathonEmailTypeEnum,
} from '@/db/schema/emails';
import type { HackathonEmailType } from '@/db/schema/emails';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const ALL_EMAIL_TYPES =
    hackathonEmailTypeEnum.enumValues as HackathonEmailType[];

export default function EmailTemplatesPage() {
    const { toast } = useToast();
    const [expandedTemplate, setExpandedTemplate] = useState<number | null>(
        null
    );
    const [showHighlights, setShowHighlights] = useState<boolean>(true);
    const [selectedHackathonId, setSelectedHackathonId] = useState<
        number | null
    >(null);
    const [detectedPlaceholders, setDetectedPlaceholders] = useState<
        Record<number, string[]>
    >({});

    const hasSetInitialHackathon = useRef(false);

    const { data: hackathons = [] } = trpc.hackathons.getHackathons.useQuery();
    const { data: activeHackathon } =
        trpc.hackathons.getActiveHackathon.useQuery();

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

    const detectPlaceholders = (content: string, templateId: number) => {
        const regex = /{{([a-zA-Z0-9]+)}}/g;
        const matches: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(content)) !== null) {
            const fullMatch = match[0];
            matches.push(fullMatch);
        }

        setDetectedPlaceholders((prev) => ({
            ...prev,
            [templateId]: [...new Set(matches)],
        }));
    };

    // hackathon filter to the active hackathon only on first load
    useEffect(() => {
        if (hasSetInitialHackathon.current) return;
        if (activeHackathon?.id) {
            hasSetInitialHackathon.current = true;
            setSelectedHackathonId(activeHackathon.id);
        }
    }, [activeHackathon]);

    useEffect(() => {
        if (expandedTemplate !== null && templates) {
            const template = templates.find((t) => t.id === expandedTemplate);
            if (template && !detectedPlaceholders[template.id]) {
                detectPlaceholders(template.content, template.id);
            }
        }
    }, [expandedTemplate, templates, detectedPlaceholders]);

    const handleDelete = async (id: number) => {
        if (confirm('DELETE')) {
            await deleteTemplateMutation.mutateAsync({ id });
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedTemplate(expandedTemplate === id ? null : id);
    };

    const toggleHighlights = () => {
        setShowHighlights((prev) => !prev);
    };

    const missingEmailTypes =
        selectedHackathonId != null && templates
            ? ALL_EMAIL_TYPES.filter(
                  (type) => !templates.some((t) => t.emailType === type)
              )
            : [];

    if (isLoading) {
        return (
            <div className="w-full py-10 text-center">Loading templates...</div>
        );
    }

    const hasHackathon = selectedHackathonId != null;
    const templatesList = hasHackathon ? (templates ?? []) : [];

    if (!hasHackathon && hackathons.length > 0) {
        return (
            <div className="w-full py-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Email Templates</h1>
                </div>
                <div className="py-10 text-center">
                    <p className="text-lg text-white/70">
                        Select a hackathon to view and manage email templates.
                    </p>
                    <div className="mt-4 flex justify-center">
                        <Select
                            value=""
                            onValueChange={(value) =>
                                setSelectedHackathonId(Number(value))
                            }
                        >
                            <SelectTrigger className="w-[220px]">
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
                </div>
            </div>
        );
    }

    if (!hasHackathon && hackathons.length === 0) {
        return (
            <div className="w-full py-10 text-center">
                <p className="text-lg text-white/70">
                    No hackathons found. Create a hackathon first to manage
                    email templates.
                </p>
            </div>
        );
    }

    if (templatesList.length === 0) {
        return (
            <div className="w-full py-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Email Templates</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-white/70">
                                Hackathon:
                            </span>
                            <Select
                                value={String(selectedHackathonId)}
                                onValueChange={(value) =>
                                    setSelectedHackathonId(Number(value))
                                }
                            >
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {hackathons.map((h) => (
                                        <SelectItem
                                            key={h.id}
                                            value={String(h.id)}
                                        >
                                            {h.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/admin/email/templates/styling">
                                <Button
                                    variant="brand"
                                    hierarchy="secondary"
                                    size="cozy"
                                >
                                    Manage stylings
                                </Button>
                            </Link>
                            <Link
                                href={`/admin/email/templates/edit?hackathonId=${selectedHackathonId}`}
                            >
                                <Button
                                    variant="brand"
                                    hierarchy="primary"
                                    size="cozy"
                                >
                                    Create Template
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="py-10 text-center">
                    <p className="text-lg">
                        No email templates found for this hackathon.
                    </p>
                    <div className="border-caution-500/50 bg-caution-500/10 mx-auto mt-6 max-w-xl rounded-lg border p-4 text-left">
                        <h2 className="text-caution-200 mb-2 font-semibold">
                            Missing templates for this hackathon
                        </h2>
                        <p className="mb-4 text-sm text-white/70">
                            Create templates for each email type to cover all
                            hackathon flows.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {ALL_EMAIL_TYPES.map((type) => (
                                <Link
                                    key={type}
                                    href={`/admin/email/templates/edit?hackathonId=${selectedHackathonId}&emailType=${type}`}
                                >
                                    <Button
                                        variant="brand"
                                        hierarchy="secondary"
                                        size="cozy"
                                    >
                                        + {HACKATHON_EMAIL_TYPE_LABELS[type]}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Email Templates</h1>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">
                            Hackathon:
                        </span>
                        <Select
                            value={String(selectedHackathonId)}
                            onValueChange={(value) =>
                                setSelectedHackathonId(Number(value))
                            }
                        >
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
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
                    <div className="flex gap-2">
                        <Link href="/admin/email/templates/styling">
                            <Button
                                variant="brand"
                                hierarchy="secondary"
                                size="cozy"
                            >
                                Manage stylings
                            </Button>
                        </Link>
                        <Link
                            href={`/admin/email/templates/edit?hackathonId=${selectedHackathonId}`}
                        >
                            <Button
                                variant="brand"
                                hierarchy="primary"
                                size="cozy"
                            >
                                Create Template
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {missingEmailTypes.length > 0 && (
                <div className="border-caution-500/50 bg-caution-500/10 mb-8 rounded-lg border p-4">
                    <h2 className="text-caution-200 mb-2 text-lg font-semibold">
                        Missing templates for this hackathon
                    </h2>
                    <p className="mb-4 text-sm text-white/70">
                        You don&apos;t have an email template for these types
                        yet. Create one to cover all hackathon email flows.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {missingEmailTypes.map((type) => (
                            <Link
                                key={type}
                                href={`/admin/email/templates/edit?hackathonId=${selectedHackathonId}&emailType=${type}`}
                            >
                                <Button
                                    variant="brand"
                                    hierarchy="secondary"
                                    size="cozy"
                                >
                                    + {HACKATHON_EMAIL_TYPE_LABELS[type]}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-6">
                {templatesList.map((template) => (
                    <div
                        key={template.id}
                        className="overflow-hidden rounded-lg border border-white/60"
                    >
                        <div
                            className="flex cursor-pointer items-center justify-between p-4"
                            onClick={() => toggleExpand(template.id)}
                        >
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {template.title}
                                </h2>
                                <p className="mt-1 text-sm text-white/60">
                                    {template.purpose}
                                </p>
                                {template.emailType && (
                                    <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs">
                                        {HACKATHON_EMAIL_TYPE_LABELS[
                                            template.emailType as HackathonEmailType
                                        ] ?? template.emailType}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Link
                                    href={`/admin/email/templates/edit?id=${template.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        variant="default"
                                        hierarchy="secondary"
                                        size="cozy"
                                    >
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="danger"
                                    hierarchy="primary"
                                    size="cozy"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(template.id);
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>

                        {expandedTemplate === template.id && (
                            <div className="p-4">
                                {template.description && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-white/60">
                                            Description
                                        </h3>
                                        <p className="mt-1">
                                            {template.description}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-white/60">
                                            Content
                                        </h3>
                                        <Button
                                            type="button"
                                            onClick={toggleHighlights}
                                            variant="brand"
                                            hierarchy="tertiary"
                                            size="cozy"
                                        >
                                            {showHighlights
                                                ? 'Hide Placeholders'
                                                : 'Show Placeholders'}
                                        </Button>
                                    </div>

                                    {/* Detected Placeholders */}
                                    {detectedPlaceholders[template.id]?.length >
                                        0 && (
                                        <div className="mb-4 bg-neutral-900 p-3">
                                            <h4 className="mb-2 text-sm font-medium">
                                                Detected Placeholders:
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {detectedPlaceholders[
                                                    template.id
                                                ].map((placeholder) => (
                                                    <div
                                                        key={placeholder}
                                                        className="rounded-full bg-neutral-700 px-2 py-1 text-xs"
                                                    >
                                                        {placeholder}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-2 overflow-hidden rounded-md">
                                        <div className="h-[400px] overflow-auto bg-white">
                                            <iframe
                                                srcDoc={prepareEmailPreview(
                                                    template.content,
                                                    {
                                                        showPlaceholders:
                                                            showHighlights,
                                                        placeholders:
                                                            detectedPlaceholders[
                                                                template.id
                                                            ] || [],
                                                    }
                                                )}
                                                title={`${template.title} Preview`}
                                                className="h-full w-full border-0"
                                                sandbox="allow-same-origin allow-scripts"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-sm text-white/60">
                                    <p>
                                        Created:{' '}
                                        {new Date(
                                            template.createdAt
                                        ).toLocaleString()}
                                    </p>
                                    <p>
                                        Last updated:{' '}
                                        {new Date(
                                            template.updatedAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
