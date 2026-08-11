'use client';

import { useEffect, useRef, type HTMLProps } from 'react';
import {
    ArrowsUpDownIcon,
    CheckIcon,
    ChevronDownIcon,
    MinusIcon,
} from '@heroicons/react/16/solid';
import clsx from 'clsx';
import {
    resolveApplicationLinkUrl,
    shouldRenderApplicationReviewCellAsLink,
} from '@/lib/applications/applicationReviewExport';
import { getResponseValue } from '@/lib/admin/submissionExport';

export function reviewTableStickyColumnProps(
    columnIndex: number,
    options: {
        selectColWidth: number;
        flaggedColWidth: number;
        variant?: 'header' | 'body';
        selected?: boolean;
    }
): { styleLeft?: number; stickyClass: string; isSticky: boolean } {
    const {
        selectColWidth,
        flaggedColWidth,
        variant = 'header',
        selected = false,
    } = options;

    const zIndex = variant === 'body' ? 'z-20' : 'z-30';
    const bg =
        variant === 'body'
            ? selected
                ? 'bg-[color-mix(in_srgb,var(--color-neutral-700)_60%,var(--color-neutral-900))]'
                : 'bg-[color-mix(in_srgb,var(--color-neutral-800)_60%,var(--color-neutral-900))]'
            : 'bg-neutral-900';

    if (columnIndex === 0) {
        return {
            stickyClass: `sticky left-0 ${zIndex} ${bg}`,
            isSticky: true,
        };
    }
    if (columnIndex === 1) {
        return {
            styleLeft: selectColWidth,
            stickyClass: `sticky ${zIndex} ${bg}`,
            isSticky: true,
        };
    }
    if (columnIndex === 2) {
        return {
            styleLeft: selectColWidth + flaggedColWidth,
            stickyClass: `sticky ${zIndex} ${bg}`,
            isSticky: true,
        };
    }

    return { stickyClass: '', isSticky: false };
}

export function SortIndicator({
    sorted,
    sortIndex,
}: {
    sorted: false | 'asc' | 'desc';
    sortIndex?: number;
}) {
    const priority =
        sorted && sortIndex != null && sortIndex >= 0 ? (
            <span className="text-[10px] font-semibold text-white/60">
                {sortIndex + 1}
            </span>
        ) : null;

    if (sorted === 'asc') {
        return (
            <span className="inline-flex shrink-0 items-center gap-0.5">
                <ChevronDownIcon className="size-4 rotate-180 text-white/60" />
                {priority}
            </span>
        );
    }
    if (sorted === 'desc') {
        return (
            <span className="inline-flex shrink-0 items-center gap-0.5">
                <ChevronDownIcon className="size-4 text-white/60" />
                {priority}
            </span>
        );
    }
    return <ArrowsUpDownIcon className="size-4 text-white/60" />;
}

export function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement>(null);
    const isIndeterminate = Boolean(!rest.checked && indeterminate);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const isActive = Boolean(rest.checked) || isIndeterminate;

    return (
        <label
            className={clsx(
                'relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center',
                rest.disabled && 'cursor-not-allowed opacity-50',
                className
            )}
        >
            <input
                type="checkbox"
                ref={ref}
                className="absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
                {...rest}
                onClick={(e) => e.stopPropagation()}
            />
            <span
                aria-hidden
                className={clsx(
                    'pointer-events-none flex size-5 items-center justify-center rounded-[4px] border transition-colors',
                    isActive
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-neutral-500/60 bg-transparent'
                )}
            >
                {rest.checked ? (
                    <CheckIcon className="size-3.5" />
                ) : isIndeterminate ? (
                    <MinusIcon className="size-3.5" />
                ) : null}
            </span>
        </label>
    );
}

function formatApplicationCellValue(value: unknown): string {
    if (value == null || value === '') return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
}

export function ApplicationReviewAnswerCell({
    response,
    questionId,
    questionType,
}: {
    response: Record<string, unknown>;
    questionId: string;
    questionType: string;
}) {
    const raw = getResponseValue(response, questionId);

    if (shouldRenderApplicationReviewCellAsLink(questionType)) {
        const url = resolveApplicationLinkUrl(raw);
        if (url) {
            return (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-300 underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    View
                </a>
            );
        }
        return <span>—</span>;
    }

    const display = formatApplicationCellValue(raw);
    return (
        <span className="block max-w-full" title={display}>
            {display}
        </span>
    );
}
