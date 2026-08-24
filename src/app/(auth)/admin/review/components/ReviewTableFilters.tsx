'use client';

import { useMemo, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/16/solid';
import type { SortingState } from '@tanstack/react-table';
import type { DisplayRole } from '@/components/application_components/types';

export type ReviewFilterFieldKind =
    | 'currentStatus'
    | 'pendingStatus'
    | 'values'
    | 'multiValues';

export type ReviewFilterField = {
    id: string;
    label: string;
    kind: ReviewFilterFieldKind;
};

export type ReviewFilterValueOption = {
    value: string;
    label: string;
};

// application display roles whose answers may contain multiple values
export const MULTI_VALUE_FILTER_ROLES = [
    'dietaryRestrictions',
] as const satisfies readonly DisplayRole[];

export type MultiValueFilterRole = (typeof MULTI_VALUE_FILTER_ROLES)[number];

export const MULTI_VALUE_FILTER_LABELS: Record<MultiValueFilterRole, string> = {
    dietaryRestrictions: 'Dietary',
};

// split array or comma-joined answers into individual filterable values
export function splitMultiValueTokens(value: unknown): string[] {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) {
        return value
            .map((item) =>
                typeof item === 'string' ? item.trim() : String(item).trim()
            )
            .filter(Boolean);
    }
    return String(value)
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
}

type ReviewTableFiltersProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fields: ReviewFilterField[];
    getValueOptions: (field: ReviewFilterField) => ReviewFilterValueOption[];
    onSelectValue: (fieldId: string, value: string, valueLabel: string) => void;
    trigger: ReactNode;
};

function CurrentStatusOption({ option }: { option: ReviewFilterValueOption }) {
    const tone = currentStatusOptionTone(option.value);
    return (
        <span className={clsx('inline-flex items-center gap-1', tone.text)}>
            <span
                className={clsx('size-1.5 shrink-0 rounded-full', tone.dot)}
                aria-hidden
            />
            <span className="text-base tracking-tight">{option.label}</span>
        </span>
    );
}

function PendingStatusOption({ option }: { option: ReviewFilterValueOption }) {
    return (
        <span
            className={clsx(
                'inline-flex h-7 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap',
                pendingStatusOptionChipClass(option.value)
            )}
        >
            {option.label}
        </span>
    );
}

function currentStatusOptionTone(value: string): {
    text: string;
    dot: string;
} {
    switch (value) {
        case 'Accepted':
            return { text: 'text-success-300', dot: 'bg-success-300' };
        case 'Accepted - RSVP to Confirm':
        case 'Accepted - Pending Payment':
            return { text: 'text-brand-300', dot: 'bg-brand-300' };
        case 'rsvp-confirmed':
            return { text: 'text-brand-500', dot: 'bg-brand-500' };
        case 'Wait List':
            return { text: 'text-yellow-300', dot: 'bg-yellow-300' };
        case 'Withdrawn':
            return { text: 'text-fuchsia-500', dot: 'bg-fuchsia-500' };
        case 'Declined':
            return { text: 'text-danger-300', dot: 'bg-danger-400' };
        default:
            return { text: 'text-white/60', dot: 'bg-neutral-400' };
    }
}

function pendingStatusOptionChipClass(value: string): string {
    if (value === 'Accepted' || value.startsWith('Accepted')) {
        return 'bg-success-950 text-success-300';
    }
    switch (value) {
        case 'Wait List':
            return 'bg-yellow-950 text-yellow-300';
        case 'Declined':
            return 'bg-danger-950 text-danger-300';
        default:
            return 'bg-neutral-800 text-white';
    }
}

export const CURRENT_STATUS_FILTER_OPTIONS: ReviewFilterValueOption[] = [
    { value: 'Awaiting Review', label: 'To be reviewed' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Wait List', label: 'Waitlisted' },
    { value: 'Declined', label: 'Rejected' },
    { value: 'Withdrawn', label: 'Withdrawn' },
    { value: 'Accepted - RSVP to Confirm', label: 'Awaiting RSVP' },
    { value: 'rsvp-confirmed', label: 'RSVP Confirmed' },
];

export function getPendingStatusFilterOptions(
    multiLocation: boolean
): ReviewFilterValueOption[] {
    const acceptOptions: ReviewFilterValueOption[] = multiLocation
        ? [
              { value: 'Accepted', label: 'Accepted (Virtual)' },
              {
                  value: 'Accepted - Pending Payment',
                  label: 'Accepted (SFU)',
              },
              {
                  value: 'Accepted - RSVP to Confirm',
                  label: 'Accepted (Waterloo)',
              },
          ]
        : [{ value: 'Accepted', label: 'Accepted' }];

    return [
        { value: 'N/A', label: 'Under review' },
        ...acceptOptions,
        { value: 'Wait List', label: 'Waitlisted' },
        { value: 'Declined', label: 'Rejected' },
    ];
}

// map to the statuses that are allowed to be selected for the filter
export function resolveCurrentStatusFilterValues(value: string): string[] {
    if (value === 'rsvp-confirmed') {
        return ['Accepted'];
    }
    if (value === 'Accepted - RSVP to Confirm') {
        return ['Accepted - RSVP to Confirm', 'Accepted - Pending Payment'];
    }
    if (value === 'Accepted') {
        return [
            'Accepted',
            'Accepted - RSVP to Confirm',
            'Accepted - Pending Payment',
        ];
    }
    return [value];
}

export function ReviewTableFilters({
    open,
    onOpenChange,
    fields,
    getValueOptions,
    onSelectValue,
    trigger,
}: ReviewTableFiltersProps) {
    const [view, setView] = useState<'fields' | 'values'>('fields');
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
    const [query, setQuery] = useState('');

    const activeField = fields.find((f) => f.id === activeFieldId) ?? null;

    const filteredFields = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q || view !== 'fields') return fields;
        return fields.filter((f) => f.label.toLowerCase().includes(q));
    }, [fields, query, view]);

    const valueOptions = useMemo(() => {
        if (!activeField) return [];
        const options = getValueOptions(activeField);
        const q = query.trim().toLowerCase();
        if (!q || view !== 'values') return options;
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(q) ||
                o.value.toLowerCase().includes(q)
        );
    }, [activeField, getValueOptions, query, view]);

    const resetPanel = () => {
        setView('fields');
        setActiveFieldId(null);
        setQuery('');
    };

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (!next) resetPanel();
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => handleOpenChange(!open)}
                className={clsx(
                    'inline-flex min-h-9 items-center gap-2 rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700/60',
                    open && 'border-neutral-500 bg-neutral-700/80'
                )}
            >
                {trigger}
            </button>

            {open ? (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-40 cursor-default"
                        aria-label="Close filters"
                        onClick={() => handleOpenChange(false)}
                    />
                    <div className="bg-neutral-925 absolute top-full right-0 z-50 mt-2 flex w-[202px] flex-col gap-2 rounded border border-neutral-600/60 p-3 shadow-lg">
                        <div className="border-brand-500 flex h-[38px] items-center rounded border bg-neutral-700/20 px-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Filter by..."
                                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="h-px w-full bg-neutral-600/60" />
                        {view === 'fields' ? (
                            <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                                {filteredFields.map((field) => (
                                    <button
                                        key={field.id}
                                        type="button"
                                        className={clsx(
                                            'rounded px-2 py-2 text-left text-sm text-white hover:bg-neutral-700/60',
                                            activeFieldId === field.id &&
                                                'bg-neutral-700/60'
                                        )}
                                        onClick={() => {
                                            setActiveFieldId(field.id);
                                            setView('values');
                                            setQuery('');
                                        }}
                                    >
                                        {field.label}
                                    </button>
                                ))}
                                {filteredFields.length === 0 ? (
                                    <p className="px-2 py-2 text-sm text-white/50">
                                        No fields match
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                                <button
                                    type="button"
                                    className="rounded px-2 py-1 text-left text-xs text-white/50 hover:text-white"
                                    onClick={() => {
                                        setView('fields');
                                        setActiveFieldId(null);
                                        setQuery('');
                                    }}
                                >
                                    ← Back
                                </button>
                                {valueOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className="flex items-center rounded px-2 py-1 text-left hover:bg-neutral-700/60"
                                        onClick={() => {
                                            if (!activeField) return;
                                            onSelectValue(
                                                activeField.id,
                                                option.value,
                                                option.label
                                            );
                                            handleOpenChange(false);
                                        }}
                                    >
                                        {activeField?.kind ===
                                        'currentStatus' ? (
                                            <CurrentStatusOption
                                                option={option}
                                            />
                                        ) : activeField?.kind ===
                                          'pendingStatus' ? (
                                            <PendingStatusOption
                                                option={option}
                                            />
                                        ) : (
                                            <span className="text-sm text-white">
                                                {option.label}
                                            </span>
                                        )}
                                    </button>
                                ))}
                                {valueOptions.length === 0 ? (
                                    <p className="px-2 py-2 text-sm text-white/50">
                                        No values
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}

export function ReviewActiveFilterChips({
    activeFilters,
    onRemoveFilter,
    sorting,
    sortLabels,
    onClearSort,
}: {
    activeFilters: { id: string; label: string; valueLabel: string }[];
    onRemoveFilter: (fieldId: string) => void;
    sorting: SortingState;
    sortLabels: Record<string, string>;
    onClearSort: (columnId: string) => void;
}) {
    if (activeFilters.length === 0 && sorting.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2.5">
            {activeFilters.map((filter) => (
                <button
                    key={filter.id}
                    type="button"
                    onClick={() => onRemoveFilter(filter.id)}
                    className="bg-brand-900/30 inline-flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-white"
                >
                    <span>
                        <span className="font-medium">{filter.label}:</span>
                        {` ${filter.valueLabel}`}
                    </span>
                    <XMarkIcon className="size-4 shrink-0" />
                </button>
            ))}
            {sorting.map((sort) => (
                <button
                    key={sort.id}
                    type="button"
                    onClick={() => onClearSort(sort.id)}
                    className="bg-brand-900/30 inline-flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-white"
                >
                    <span>
                        <span className="font-medium">
                            {sortLabels[sort.id] ?? sort.id}:
                        </span>
                        {` ${sort.desc ? 'Z to A' : 'A to Z'}`}
                    </span>
                    <XMarkIcon className="size-4 shrink-0" />
                </button>
            ))}
        </div>
    );
}
