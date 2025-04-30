'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Label } from '@/components/ui/label/label';
import { FormTextInput } from '@/components/ui/input/input';
import { prepareEmailPreview } from '../emailPreview';
import { type NewEmailTemplate } from '@/db/schema/emails';

export type EmailTemplateFormData = NewEmailTemplate;

const AVAILABLE_PLACEHOLDERS = [
    { placeholder: '{{firstName}}', description: "Applicant's first name" },
    { placeholder: '{{lastName}}', description: "Applicant's last name" },
    { placeholder: '{{applicationDate}}', description: 'Date of submission' },
    {
        placeholder: '{{eventName}}',
        description: 'Name of the event (e.g., JourneyHacks 2025)',
    },
    { placeholder: '{{teamMate1}}', description: 'Team mate 1 name' },
    { placeholder: '{{teamMate2}}', description: 'Team mate 2 name' },
    { placeholder: '{{teamMate3}}', description: 'Team mate 3 name' },
    { placeholder: '{{qrCode}}', description: 'URL to a unique QR code image' },
    {
        placeholder: '{{acceptanceStatus}}',
        description: "Applicant's acceptance status",
    },
    { placeholder: '{{eventDate}}', description: 'Date of the event' },
    { placeholder: '{{eventLocation}}', description: 'Location of the event' },
    {
        placeholder: '{{rsvpDeadline}}',
        description: 'Deadline to RSVP for the event',
    },
];

interface EmailTemplateFormProps {
    initialData?: Partial<EmailTemplateFormData> & { id?: number };
    onSubmit: (
        data: EmailTemplateFormData & { id?: number }
    ) => Promise<void> | void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function EmailTemplateForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: EmailTemplateFormProps) {
    const [formData, setFormData] = useState<EmailTemplateFormData>({
        title: '',
        purpose: '',
        description: '',
        content: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>(
        []
    );
    const [previewContent, setPreviewContent] = useState<string>('');
    const [showHighlights, setShowHighlights] = useState<boolean>(true);

    const detectPlaceholders = (content: string) => {
        const regex = /{{([a-zA-Z0-9]+)}}/g;
        const matches = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            const fullMatch = match[0];
            if (
                AVAILABLE_PLACEHOLDERS.some((p) => p.placeholder === fullMatch)
            ) {
                matches.push(fullMatch);
            }
        }

        setDetectedPlaceholders([...new Set(matches)]);

        let formattedContent = content;
        [...new Set(matches)].forEach((placeholder) => {
            const escapedPlaceholder = placeholder.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );
            formattedContent = formattedContent.replace(
                new RegExp(escapedPlaceholder, 'g'),
                showHighlights
                    ? `<span class="placeholder-highlight">${placeholder}</span>`
                    : placeholder
            );
        });

        setPreviewContent(formattedContent);
    };

    useEffect(() => {
        if (formData.content) {
            detectPlaceholders(formData.content);
        }
    }, [showHighlights, formData.content]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                purpose: initialData.purpose || '',
                description: initialData.description || '',
                content: initialData.content || '',
            });

            if (initialData.content) {
                detectPlaceholders(initialData.content);
            }
        }
    }, [initialData]);

    const handleInputChange = (value: string, name: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (name === 'content') {
            detectPlaceholders(value);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Purpose is required';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Email content is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(
                initialData?.id ? { ...formData, id: initialData.id } : formData
            );
        }
    };

    const getPlaceholderDescription = (placeholder: string): string => {
        const found = AVAILABLE_PLACEHOLDERS.find(
            (p) => p.placeholder === placeholder
        );
        return found ? found.description : 'Unknown placeholder';
    };

    const toggleHighlights = () => {
        setShowHighlights((prev) => !prev);
    };

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title" required>
                                Title
                            </Label>
                            <FormTextInput
                                id="title"
                                name="title"
                                type="text"
                                defaultValue={formData.title}
                                onLazyChange={(value) =>
                                    handleInputChange(value, 'title')
                                }
                                errorMsg={errors.title}
                                lazy={true}
                                placeholder="e.g., Acceptance Email"
                            />
                        </div>

                        <div>
                            <Label htmlFor="purpose" required>
                                Purpose
                            </Label>
                            <FormTextInput
                                id="purpose"
                                name="purpose"
                                type="text"
                                defaultValue={formData.purpose}
                                onLazyChange={(value) =>
                                    handleInputChange(value, 'purpose')
                                }
                                errorMsg={errors.purpose}
                                lazy={true}
                                placeholder="e.g., Notify applicants"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <FormTextArea
                                id="description"
                                name="description"
                                defaultValue={formData.description || ''}
                                lazy={true}
                                onLazyChange={(value) =>
                                    handleInputChange(value, 'description')
                                }
                                placeholder="Optional description of when and how this template is used"
                                rows={3}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="content" required>
                                Email Content (HTML)
                            </Label>
                            <FormTextArea
                                id="content"
                                name="content"
                                defaultValue={formData.content}
                                lazy={true}
                                onLazyChange={(value) =>
                                    handleInputChange(value, 'content')
                                }
                                placeholder="<p>Dear {{firstName}},</p><p>We are pleased to inform you...</p>"
                                rows={12}
                                className="font-mono text-sm"
                            />
                            {errors.content && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.content}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                        >
                            {isLoading
                                ? 'Saving...'
                                : initialData?.id
                                  ? 'Update Template'
                                  : 'Create Template'}
                        </Button>

                        {onCancel && (
                            <Button
                                type="button"
                                onClick={onCancel}
                                variant="brand"
                                hierarchy="secondary"
                                size="cozy"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>

                <div className="mt-8">
                    <h3 className="mb-2 text-lg font-medium">
                        Available Placeholders
                    </h3>
                    <div className="rounded-md border bg-neutral-900 p-4">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {AVAILABLE_PLACEHOLDERS.map((p) => (
                                <div
                                    key={p.placeholder}
                                    className="flex items-start"
                                >
                                    <code className="rounded bg-neutral-700 px-1 font-mono text-sm">
                                        {p.placeholder}
                                    </code>
                                    <span className="ml-2 text-sm">
                                        {p.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="sticky top-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium">Preview</h3>
                        <Button
                            type="button"
                            onClick={toggleHighlights}
                            variant="brand"
                            hierarchy="tertiary"
                            size="cozy"
                        >
                            {showHighlights
                                ? 'Hide Highlights'
                                : 'Show Highlights'}
                        </Button>
                    </div>

                    {detectedPlaceholders.length > 0 && (
                        <div className="mb-4 bg-neutral-900 p-3">
                            <h4 className="mb-2 text-sm font-medium">
                                Detected Placeholders:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {detectedPlaceholders.map((placeholder) => (
                                    <div
                                        key={placeholder}
                                        className="rounded-full bg-neutral-700 px-2 py-1 text-xs"
                                        title={getPlaceholderDescription(
                                            placeholder
                                        )}
                                    >
                                        {placeholder}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-md border">
                        <div className="flex items-center border-b bg-gray-50 px-4 py-2 dark:bg-gray-800">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Email Preview
                            </span>
                        </div>
                        <div className="h-[500px] overflow-auto">
                            <iframe
                                srcDoc={prepareEmailPreview(formData.content, {
                                    showPlaceholders: showHighlights,
                                    placeholders: detectedPlaceholders,
                                })}
                                title="Email Preview"
                                className="h-full w-full border-0"
                                sandbox="allow-same-origin allow-scripts"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
