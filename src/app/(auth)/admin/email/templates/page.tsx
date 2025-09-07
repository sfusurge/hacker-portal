'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { prepareEmailPreview } from './emailPreview';

export default function EmailTemplatesPage() {
    const { toast } = useToast();
    const [expandedTemplate, setExpandedTemplate] = useState<number | null>(
        null
    );
    const [showHighlights, setShowHighlights] = useState<boolean>(true);
    const [detectedPlaceholders, setDetectedPlaceholders] = useState<
        Record<number, string[]>
    >({});

    const {
        data: templates,
        isLoading,
        refetch,
    } = trpc.emailTemplates.getEmailTemplates.useQuery();

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

    if (isLoading) {
        return (
            <div className="w-full py-10 text-center">Loading templates...</div>
        );
    }

    if (!templates || templates.length === 0) {
        return (
            <div className="w-full py-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Email Templates</h1>
                    <Link href="/admin/email/templates/edit">
                        <Button variant="brand" hierarchy="primary" size="cozy">
                            Create Template
                        </Button>
                    </Link>
                </div>
                <div className="py-10 text-center">
                    <p className="text-lg">No email templates found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Email Templates</h1>
                <Link href="/admin/email/templates/edit">
                    <Button variant="brand" hierarchy="primary" size="cozy">
                        Create Template
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {templates.map((template) => (
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
                            </div>
                            <div className="flex items-center space-x-2">
                                <Link
                                    href={`/admin/email/templates/edit?id=${template.id}`}
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
