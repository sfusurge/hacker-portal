'use client';

import { type SyntheticEvent } from 'react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import type { StatusEnum } from '@/db/schema/applications';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function statusDisplayLabel(status: string): string {
    switch (status) {
        case 'Awaiting Review':
            return 'Under review';
        case 'Wait List':
            return 'Waitlisted';
        case 'Declined':
            return 'Rejected';
        case 'Accepted - RSVP to Confirm':
        case 'Accepted - Pending Payment':
            return 'Accepted';
        default:
            return status;
    }
}

export function currentStatusDisplayLabel(status: string): string {
    switch (status) {
        case 'Awaiting Review':
            return 'To be reviewed';
        case 'Accepted - RSVP to Confirm':
        case 'Accepted - Pending Payment':
            return 'Awaiting RSVP';
        case 'Wait List':
            return 'Waitlisted';
        case 'Declined':
            return 'Rejected';
        default:
            return status;
    }
}

export function isAcceptedStatus(status: string): boolean {
    return (
        status === 'Accepted' ||
        status === 'Accepted - RSVP to Confirm' ||
        status === 'Accepted - Pending Payment'
    );
}

export function pendingStatusChipClass(status: string): string {
    if (isAcceptedStatus(status)) {
        return 'bg-success-950 text-success-300';
    }
    switch (status) {
        case 'Wait List':
            return 'bg-yellow-950 text-yellow-300';
        case 'Declined':
            return 'bg-danger-950 text-danger-300';
        default:
            return 'bg-neutral-800 text-white';
    }
}

// dot + text tones aligned with ApplicantStatusSummary KPI colors
export function currentStatusTone(status: string): {
    textClass: string;
    dotClass: string;
} {
    switch (status) {
        case 'Accepted':
            return {
                textClass: 'text-success-300',
                dotClass: 'bg-success-300',
            };
        case 'Accepted - RSVP to Confirm':
        case 'Accepted - Pending Payment':
            return {
                textClass: 'text-brand-300',
                dotClass: 'bg-brand-300',
            };
        case 'Wait List':
            return {
                textClass: 'text-yellow-300',
                dotClass: 'bg-yellow-300',
            };
        case 'Withdrawn':
            return {
                textClass: 'text-fuchsia-500',
                dotClass: 'bg-fuchsia-500',
            };
        case 'Declined':
            return {
                textClass: 'text-danger-300',
                dotClass: 'bg-danger-400',
            };
        case 'Awaiting Review':
        default:
            return {
                textClass: 'text-white/60',
                dotClass: 'bg-neutral-400',
            };
    }
}

export function StatusChip({
    status,
    className,
}: {
    status: string;
    className?: string;
}) {
    return (
        <span
            className={clsx(
                'inline-flex h-7 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap',
                pendingStatusChipClass(status),
                className
            )}
        >
            {statusDisplayLabel(status)}
        </span>
    );
}

export function CurrentStatusCell({ value }: { value: string }) {
    const status = value || 'N/A';
    const { textClass, dotClass } = currentStatusTone(status);

    return (
        <div
            className={clsx(
                'flex items-center gap-1 overflow-hidden text-base tracking-tight',
                textClass
            )}
        >
            <span
                className={clsx('size-1.5 shrink-0 rounded-full', dotClass)}
                aria-hidden
            />
            <span className="truncate">
                {currentStatusDisplayLabel(status)}
            </span>
        </div>
    );
}

export function PendingStatusSelect({
    value,
    currentStatus,
    acceptPendingStatus,
    onChange,
    disabled,
    readOnly,
}: {
    value: string;
    currentStatus: string;
    acceptPendingStatus: StatusEnum;
    onChange: (next: StatusEnum) => void;
    disabled?: boolean;
    readOnly?: boolean;
}) {
    const selectableValues: StatusEnum[] = [
        'Awaiting Review',
        acceptPendingStatus,
        'Wait List',
        'Declined',
    ];
    if (currentStatus !== 'Awaiting Review') {
        selectableValues.push('N/A');
    }
    const uniqueValues = Array.from(
        new Set(
            value && !selectableValues.includes(value as StatusEnum)
                ? [...selectableValues, value as StatusEnum]
                : selectableValues
        )
    );

    const stopRowInteraction = (e: SyntheticEvent) => {
        e.stopPropagation();
    };

    if (readOnly) {
        return (
            <div className="absolute inset-0 z-10 flex w-full min-w-0 items-center px-3">
                <StatusChip status={value || 'Awaiting Review'} />
            </div>
        );
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    className="absolute inset-0 z-10 flex w-full min-w-0 items-center justify-between gap-2 px-3 outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
                    onPointerDown={stopRowInteraction}
                    onMouseDown={stopRowInteraction}
                    onClick={stopRowInteraction}
                >
                    <StatusChip status={value || 'Awaiting Review'} />
                    <ChevronDownIcon className="size-4 shrink-0 text-white/60" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={0}
                className="z-[100] w-[180px] rounded-lg rounded-tl-none border-neutral-600/30 bg-neutral-900 p-1 text-white"
                onClick={stopRowInteraction}
                onPointerDown={stopRowInteraction}
            >
                <DropdownMenuLabel className="px-2 pt-2 pb-1 font-mono text-xs font-medium text-white/60">
                    SELECT STATUS
                </DropdownMenuLabel>
                {uniqueValues.map((status) => {
                    const selected = status === value;
                    return (
                        <DropdownMenuItem
                            key={status}
                            className={clsx(
                                'relative cursor-pointer rounded-sm p-2 focus:bg-transparent focus:text-white data-[highlighted]:bg-transparent data-[highlighted]:text-white',
                                selected &&
                                    'before:absolute before:top-1 before:bottom-1 before:left-0 before:w-0.5 before:rounded-full before:bg-white'
                            )}
                            onSelect={() => onChange(status)}
                        >
                            <StatusChip status={status} />
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function PendingStatusMenuItems({
    acceptPendingStatus,
    onSelect,
}: {
    acceptPendingStatus: StatusEnum;
    onSelect: (next: StatusEnum) => void;
}) {
    const options: StatusEnum[] = [
        'Awaiting Review',
        acceptPendingStatus,
        'Wait List',
        'Declined',
        'N/A',
    ];

    return (
        <>
            <DropdownMenuLabel className="px-2 pt-2 pb-1 font-mono text-xs font-medium text-white/60">
                SELECT STATUS
            </DropdownMenuLabel>
            {options.map((status) => (
                <DropdownMenuItem
                    key={status}
                    className="cursor-pointer rounded-sm p-2 focus:bg-transparent focus:text-white data-[highlighted]:bg-transparent data-[highlighted]:text-white"
                    onSelect={() => onSelect(status)}
                >
                    <StatusChip status={status} />
                </DropdownMenuItem>
            ))}
        </>
    );
}
