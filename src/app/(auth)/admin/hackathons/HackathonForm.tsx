'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label/label';
import { useToast } from '@/hooks/use-toast';
import type { HackathonConfigInput } from '@/db/schema/hackathons';
import {
    pacificInputToUtc,
    startEndToInput,
    utcToPacificInput,
} from '@/lib/datetime/pacific';
import { DateField, TextField } from './fields';

export interface HackathonFormValues {
    name: string;
    startDate: string;
    endDate: string;
    eventPageSlug: string;
    submissionDeadline: string;
    applicationOpen: string;
    applicationCloses: string;
    submissionOpen: string;
    projectGalleryOpen: string;
    paymentDeadline: string;
    audienceVotingOpen: string;
    audienceVotingCloses: string;
    isActive: boolean;
    isVisible: boolean;
    isPaid: boolean;
    isMultipleLocations: boolean;
    audienceVotingEnabled: boolean;
}

export const EMPTY_HACKATHON_FORM_VALUES: HackathonFormValues = {
    name: '',
    startDate: '',
    endDate: '',
    eventPageSlug: 'stormhacks',
    submissionDeadline: '',
    applicationOpen: '',
    applicationCloses: '',
    submissionOpen: '',
    projectGalleryOpen: '',
    paymentDeadline: '',
    audienceVotingOpen: '',
    audienceVotingCloses: '',
    isActive: false,
    isVisible: false,
    isPaid: false,
    isMultipleLocations: false,
    audienceVotingEnabled: false,
};

export interface HackathonRowForForm {
    name: string;
    startDate: string;
    endDate: string;
    eventPageSlug: string;
    submissionDeadline: Date | string | null;
    applicationOpen: Date | string | null;
    applicationCloses: Date | string | null;
    submissionOpen: Date | string | null;
    projectGalleryOpen: Date | string | null;
    paymentDeadline: Date | string | null;
    audienceVotingOpen: Date | string | null;
    audienceVotingCloses: Date | string | null;
    isActive: boolean;
    isVisible: boolean;
    isPaid: boolean;
    isMultipleLocations: boolean;
    audienceVotingEnabled: boolean;
}

export function hackathonToFormValues(
    row: HackathonRowForForm
): HackathonFormValues {
    return {
        name: row.name,
        startDate: startEndToInput(row.startDate),
        endDate: startEndToInput(row.endDate),
        eventPageSlug: row.eventPageSlug,
        submissionDeadline: utcToPacificInput(row.submissionDeadline),
        applicationOpen: utcToPacificInput(row.applicationOpen),
        applicationCloses: utcToPacificInput(row.applicationCloses),
        submissionOpen: utcToPacificInput(row.submissionOpen),
        projectGalleryOpen: utcToPacificInput(row.projectGalleryOpen),
        paymentDeadline: utcToPacificInput(row.paymentDeadline),
        audienceVotingOpen: utcToPacificInput(row.audienceVotingOpen),
        audienceVotingCloses: utcToPacificInput(row.audienceVotingCloses),
        isActive: row.isActive,
        isVisible: row.isVisible,
        isPaid: row.isPaid,
        isMultipleLocations: row.isMultipleLocations,
        audienceVotingEnabled: row.audienceVotingEnabled,
    };
}

// Pacific-time datetime windows, rendered in one loop.
const DATETIME_FIELDS: {
    key: keyof HackathonFormValues;
    label: string;
    required?: boolean;
}[] = [
    { key: 'applicationOpen', label: 'Application opens' },
    { key: 'applicationCloses', label: 'Application closes' },
    { key: 'submissionOpen', label: 'Submission opens' },
    { key: 'submissionDeadline', label: 'Submission deadline', required: true },
    { key: 'projectGalleryOpen', label: 'Project gallery opens' },
    { key: 'paymentDeadline', label: 'Payment deadline' },
    { key: 'audienceVotingOpen', label: 'Audience voting opens' },
    { key: 'audienceVotingCloses', label: 'Audience voting closes' },
];

const FLAG_FIELDS: {
    key: keyof HackathonFormValues;
    label: string;
    help?: string;
}[] = [
    {
        key: 'isActive',
        label: 'Active',
        help: 'Only one hackathon can be active. Turning this on deactivates the others.',
    },
    { key: 'isVisible', label: 'Visible in navigation' },
    { key: 'isPaid', label: 'Paid event' },
    { key: 'isMultipleLocations', label: 'Multiple locations' },
    { key: 'audienceVotingEnabled', label: 'Audience voting enabled' },
];

function toEpoch(pacificInput: string): number | null {
    const utc = pacificInputToUtc(pacificInput);
    return utc ? utc.getTime() : null;
}

interface HackathonFormProps {
    initialValues: HackathonFormValues;
    submitLabel: string;
    submitting: boolean;
    onSubmit: (input: HackathonConfigInput) => void;
    onCancel?: () => void;
    formId?: string;
    hideActions?: boolean;
}

export function HackathonForm({
    initialValues,
    submitLabel,
    submitting,
    onSubmit,
    onCancel,
    formId,
    hideActions = false,
}: HackathonFormProps) {
    const { toast } = useToast();
    const [values, setValues] = useState<HackathonFormValues>(initialValues);

    const setField = <K extends keyof HackathonFormValues>(
        key: K,
        value: HackathonFormValues[K]
    ) => setValues((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missing: string[] = [];
        if (!values.name.trim()) missing.push('Name');
        if (!values.startDate) missing.push('Start date');
        if (!values.endDate) missing.push('End date');
        if (!values.eventPageSlug.trim()) missing.push('Event page slug');
        if (!values.submissionDeadline) missing.push('Submission deadline');
        if (missing.length > 0) {
            toast({
                title: 'Missing required fields',
                description: missing.join(', '),
                variant: 'error',
            });
            return;
        }

        const submissionDeadline = toEpoch(values.submissionDeadline);
        if (submissionDeadline == null) {
            toast({
                title: 'Invalid submission deadline',
                description: 'Please pick a valid date and time.',
                variant: 'error',
            });
            return;
        }

        onSubmit({
            name: values.name.trim(),
            startDate: values.startDate,
            endDate: values.endDate,
            eventPageSlug: values.eventPageSlug.trim(),
            submissionDeadline,
            applicationOpen: toEpoch(values.applicationOpen),
            applicationCloses: toEpoch(values.applicationCloses),
            submissionOpen: toEpoch(values.submissionOpen),
            projectGalleryOpen: toEpoch(values.projectGalleryOpen),
            paymentDeadline: toEpoch(values.paymentDeadline),
            audienceVotingOpen: toEpoch(values.audienceVotingOpen),
            audienceVotingCloses: toEpoch(values.audienceVotingCloses),
            isActive: values.isActive,
            isVisible: values.isVisible,
            isPaid: values.isPaid,
            isMultipleLocations: values.isMultipleLocations,
            audienceVotingEnabled: values.audienceVotingEnabled,
        });
    };

    return (
        <form
            id={formId}
            onSubmit={handleSubmit}
            className="max-w-3xl space-y-8"
        >
            {/* Basics */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Basics</h2>
                <div>
                    <Label htmlFor="name" required>
                        Name
                    </Label>
                    <TextField
                        id="name"
                        className="mt-1"
                        value={values.name}
                        onChange={(e) => setField('name', e.target.value)}
                        placeholder="e.g. StormHacks 2026"
                    />
                </div>
                <div>
                    <Label htmlFor="eventPageSlug" required>
                        Event page slug
                    </Label>
                    <TextField
                        id="eventPageSlug"
                        className="mt-1"
                        value={values.eventPageSlug}
                        onChange={(e) =>
                            setField('eventPageSlug', e.target.value)
                        }
                        placeholder="stormhacks"
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="startDate" required>
                            Start date
                        </Label>
                        <div className="mt-1">
                            <DateField
                                id="startDate"
                                withTime
                                value={values.startDate}
                                onChange={(v) => setField('startDate', v)}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="endDate" required>
                            End date
                        </Label>
                        <div className="mt-1">
                            <DateField
                                id="endDate"
                                withTime
                                value={values.endDate}
                                onChange={(v) => setField('endDate', v)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Dates &amp; times</h2>
                <p className="text-sm text-white/60">
                    All times are entered and shown in Pacific time (PST/PDT).
                    Leave a field blank to leave it unset.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {DATETIME_FIELDS.map((field) => (
                        <div key={field.key}>
                            <Label
                                htmlFor={field.key}
                                required={field.required}
                            >
                                {field.label}
                            </Label>
                            <div className="mt-1">
                                <DateField
                                    id={field.key}
                                    withTime
                                    value={values[field.key] as string}
                                    onChange={(v) => setField(field.key, v)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Settings</h2>
                <div className="space-y-3">
                    {FLAG_FIELDS.map((field) => (
                        <label
                            key={field.key}
                            htmlFor={field.key}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-700/40 bg-neutral-900/40 px-3 py-2.5 transition-colors hover:border-neutral-600/60"
                        >
                            <Checkbox
                                id={field.key}
                                checked={values[field.key] as boolean}
                                onCheckedChange={(checked) =>
                                    setField(field.key, checked === true)
                                }
                                className="data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 mt-0.5 h-5 w-5 border-white/30 data-[state=checked]:text-white"
                            />
                            <span>
                                <span className="block text-sm font-medium text-white/90">
                                    {field.label}
                                </span>
                                {field.help && (
                                    <span className="mt-0.5 block text-xs text-white/45">
                                        {field.help}
                                    </span>
                                )}
                            </span>
                        </label>
                    ))}
                </div>
            </section>

            {!hideActions && (
                <div className="flex flex-col gap-3 border-t border-neutral-700/40 pt-6 sm:flex-row">
                    <Button
                        type="submit"
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        disabled={submitting}
                        className="bg-brand-600 hover:bg-brand-500 shadow-brand-950/40 px-8 text-base font-semibold shadow-lg"
                    >
                        {submitting ? 'Saving...' : submitLabel}
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="default"
                            hierarchy="secondary"
                            size="cozy"
                            onClick={onCancel}
                            className="px-8"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            )}
        </form>
    );
}
