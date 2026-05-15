'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Label } from '@/components/ui/label/label';
import { FormTextInput } from '@/components/ui/input/input';
import { prepareEmailPreview } from '../emailPreview';
import {
    type NewEmailTemplate,
    HACKATHON_EMAIL_TYPE_LABELS,
    hackathonEmailTypeEnum,
} from '@/db/schema/emails';
import type { HackathonEmailType } from '@/db/schema/emails';
import { trpc } from '@/trpc/client';
import {
    PlaceholdersSection,
    getDetectedPlaceholders,
} from './PlaceholdersSection';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type EmailTemplateFormData = NewEmailTemplate;

/** Form state allows hackathonId to be null until user selects one (or it's defaulted). */
type EmailTemplateFormState = Omit<EmailTemplateFormData, 'hackathonId'> & {
    hackathonId: number | null;
};

const AVAILABLE_PLACEHOLDERS = [
    { placeholder: '{{firstName}}', description: "Applicant's first name" },
    { placeholder: '{{lastName}}', description: "Applicant's last name" },
    { placeholder: '{{applicationDate}}', description: 'Date of submission' },
    {
        placeholder: '{{eventName}}',
        description: 'Name of the event (e.g., JourneyHacks 2025)',
    },
    { placeholder: '{{qrCode}}', description: 'URL to a unique QR code image' },
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
    const [formData, setFormData] = useState<EmailTemplateFormState>(() => {
        const base = {
            title: '',
            purpose: '',
            description: '',
            stylingId: null as number | null,
            content: '',
            hackathonId: null as number | null,
            emailType: 'custom' as HackathonEmailType,
        };
        if (initialData) {
            return {
                ...base,
                title: initialData.title || '',
                purpose: initialData.purpose || '',
                description: initialData.description ?? '',
                stylingId: initialData.stylingId ?? null,
                content: initialData.content || '',
                hackathonId:
                    initialData.hackathonId != null
                        ? Number(initialData.hackathonId)
                        : null,
                emailType:
                    (initialData.emailType as HackathonEmailType) ?? 'custom',
            };
        }
        return base;
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showHighlights, setShowHighlights] = useState<boolean>(true);

    const { data: stylingList = [] } =
        trpc.emailTemplateStyling.getList.useQuery();
    const { data: hackathons = [] } = trpc.hackathons.getHackathons.useQuery();
    const { data: selectedStyling, isLoading: isStylingLoading } =
        trpc.emailTemplateStyling.getById.useQuery(
            { id: formData.stylingId ?? 0 },
            { enabled: formData.stylingId != null }
        );

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

        if (formData.hackathonId == null) {
            newErrors.hackathon = 'Hackathon is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (value: string, name: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const toggleHighlights = () => {
        setShowHighlights((prev) => !prev);
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm() || formData.hackathonId == null) return;
        try {
            await onSubmit({
                ...formData,
                hackathonId: formData.hackathonId as number,
                id: initialData?.id,
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    useEffect(() => {
        if (!initialData) return;
        setFormData({
            title: initialData.title || '',
            purpose: initialData.purpose || '',
            description: initialData.description ?? '',
            stylingId: initialData.stylingId ?? null,
            content: initialData.content || '',
            hackathonId:
                initialData.hackathonId != null
                    ? Number(initialData.hackathonId)
                    : null,
            emailType:
                (initialData.emailType as HackathonEmailType) ?? 'custom',
        });
    }, [
        initialData?.id,
        initialData?.title,
        initialData?.purpose,
        initialData?.description,
        initialData?.stylingId,
        initialData?.content,
        initialData?.hackathonId,
        initialData?.emailType,
    ]);

    useEffect(() => {
        if (
            initialData?.id != null ||
            hackathons.length === 0 ||
            formData.hackathonId != null
        )
            return;
        setFormData((prev) => ({
            ...prev,
            hackathonId: hackathons[0].id,
        }));
    }, [hackathons, initialData?.id, formData.hackathonId]);

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
                                <p className="text-danger-500 mt-1 text-sm">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="hackathon" required>
                                Hackathon
                            </Label>
                            <Select
                                value={
                                    formData.hackathonId != null
                                        ? String(formData.hackathonId)
                                        : ''
                                }
                                onValueChange={(value) => {
                                    const id = value
                                        ? parseInt(value, 10)
                                        : null;
                                    const selected = hackathons.find(
                                        (h) => h.id === id
                                    );
                                    setFormData((prev) => ({
                                        ...prev,
                                        hackathonId: id,
                                        emailType:
                                            prev.emailType === 'rsvp_paid' &&
                                            selected &&
                                            !selected.isPaid
                                                ? 'custom'
                                                : prev.emailType,
                                    }));
                                    if (errors.hackathon) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.hackathon;
                                            return next;
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select hackathon" />
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
                            {errors.hackathon && (
                                <p className="text-danger-500 mt-1 text-sm">
                                    {errors.hackathon}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="emailType">Email type</Label>
                            <Select
                                value={formData.emailType ?? 'custom'}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        emailType: value as HackathonEmailType,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Custom" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(
                                        hackathonEmailTypeEnum.enumValues as HackathonEmailType[]
                                    )
                                        .filter((key) => {
                                            if (key !== 'rsvp_paid') {
                                                return true;
                                            }
                                            const h = hackathons.find(
                                                (x) =>
                                                    x.id ===
                                                    formData.hackathonId
                                            );
                                            return (
                                                h?.isPaid === true ||
                                                formData.emailType ===
                                                    'rsvp_paid'
                                            );
                                        })
                                        .map((key) => (
                                            <SelectItem key={key} value={key}>
                                                {
                                                    HACKATHON_EMAIL_TYPE_LABELS[
                                                        key
                                                    ]
                                                }
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <p className="mt-1 text-xs text-neutral-500">
                                Category for this hackathon email (e.g. Hacker
                                applied, RSVP received).{' '}
                                <span className="text-neutral-400">
                                    &quot;RSVP payment confirmed&quot; is only
                                    for paid hackathons.
                                </span>
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="styling">
                                Email Template Styling
                            </Label>
                            <Select
                                value={
                                    formData.stylingId != null
                                        ? String(formData.stylingId)
                                        : 'none'
                                }
                                onValueChange={(value) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        stylingId:
                                            value === 'none'
                                                ? null
                                                : parseInt(value, 10),
                                    }));
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="None (full HTML)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        None (full HTML)
                                    </SelectItem>
                                    {stylingList.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={String(s.id)}
                                        >
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="mt-1 text-xs text-neutral-500">
                                {formData.stylingId != null
                                    ? 'Content below is injected into the selected styling at the body slot.'
                                    : 'Use a styling to share the same wrapper (header, footer, styles) across templates.'}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="content" required>
                                {formData.stylingId != null
                                    ? 'Body content (Markdown)'
                                    : 'Email Content (HTML)'}
                            </Label>
                            <FormTextArea
                                id="content"
                                name="content"
                                defaultValue={formData.content}
                                lazy={true}
                                onLazyChange={(value) =>
                                    handleInputChange(value, 'content')
                                }
                                placeholder={
                                    formData.stylingId != null
                                        ? 'Hello {{firstName}}!\n\nWe are pleased to inform you...\n\n**Bold** and *italic* supported.'
                                        : '<p>Dear {{firstName}},</p><p>We are pleased to inform you...</p>'
                                }
                                rows={12}
                                className={
                                    formData.stylingId != null
                                        ? ''
                                        : 'font-mono text-sm'
                                }
                            />
                            {errors.content && (
                                <p className="text-danger-500 mt-1 text-sm">
                                    {errors.content}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full justify-end space-x-4">
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
                    <PlaceholdersSection
                        availablePlaceholders={AVAILABLE_PLACEHOLDERS}
                        emailContent={formData.content}
                        showHighlights={showHighlights}
                        toggleHighlights={toggleHighlights}
                    />

                    <div className="overflow-hidden rounded-md border">
                        <div className="flex items-center border-b bg-gray-50 px-4 py-2 dark:bg-gray-800">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Email Preview
                            </span>
                        </div>
                        <div className="h-[500px] overflow-auto">
                            {formData.stylingId != null && isStylingLoading ? (
                                <div className="flex h-full items-center justify-center text-neutral-500">
                                    Loading styling…
                                </div>
                            ) : (
                                <iframe
                                    key={`preview-${formData.stylingId ?? 'none'}-${selectedStyling?.id ?? ''}-${formData.content.length}`}
                                    srcDoc={prepareEmailPreview(
                                        formData.content,
                                        {
                                            showPlaceholders: showHighlights,
                                            placeholders:
                                                getDetectedPlaceholders(
                                                    formData.content,
                                                    AVAILABLE_PLACEHOLDERS
                                                ),
                                            stylingHtml:
                                                selectedStyling?.html ??
                                                undefined,
                                        }
                                    )}
                                    title="Email Preview"
                                    className="h-full w-full border-0"
                                    sandbox="allow-same-origin allow-scripts"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
