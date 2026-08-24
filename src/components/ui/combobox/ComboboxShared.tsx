'use client';

import {
    type ReactNode,
    type RefObject,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input/input';
import inputStyle from '@/components/ui/input/input.module.css';

export function ComboboxRadioIndicator({ checked }: { checked: boolean }) {
    return (
        <span
            aria-hidden
            className={cn(
                'relative box-border size-5 shrink-0 rounded-full',
                'transition-all duration-[400ms] ease-out',
                checked
                    ? 'bg-[var(--outline-brand-primary)]'
                    : 'border border-[var(--neutral-500_60)] bg-transparent'
            )}
        >
            {checked && (
                <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            )}
        </span>
    );
}

export function ComboboxCheckboxIndicator({ checked }: { checked: boolean }) {
    return (
        <span
            aria-hidden
            className={cn(
                'flex size-5 min-w-5 shrink-0 items-center justify-center rounded border',
                'transition-colors duration-[400ms] ease-out',
                checked
                    ? 'border-[var(--outline-brand-primary)] bg-[var(--outline-brand-primary)] text-white'
                    : 'border-[var(--neutral-500_60)] bg-transparent'
            )}
        >
            {checked && <Check className="size-3.5" />}
        </span>
    );
}

export const comboboxNativeControlClass =
    'absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none border-0 opacity-0';

export function ComboboxOptionRow({
    children,
    className,
    selected,
}: {
    children: ReactNode;
    className?: string;
    selected?: boolean;
}) {
    return (
        <label
            className={cn(
                'group relative flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg p-3',
                'min-h-[44px] transition-colors duration-[400ms] ease-out',
                'hover:bg-neutral-700/30',
                selected && 'bg-[var(--background-brand-focus)]',
                className
            )}
        >
            {children}
        </label>
    );
}

export function ComboboxSearchInput({
    value,
    onChange,
    onEnter,
    placeholder = 'Search...',
    autoFocus,
}: {
    value: string;
    onChange: (value: string) => void;
    onEnter?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
}) {
    return (
        <div className="px-2 py-2 pb-1">
            <Input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        onEnter?.();
                    }
                }}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={cn(inputStyle.textinput, 'w-full')}
            />
        </div>
    );
}

export function ComboboxEmptyState({ children }: { children?: ReactNode }) {
    return (
        <div className="px-3 py-3 text-center text-sm text-neutral-400">
            {children ?? 'No results found'}
        </div>
    );
}

type ComboboxShellProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    displayText: string;
    placeholder: string;
    readOnly?: boolean;
    isInvalid?: boolean;
    hasValue?: boolean;
    onClear?: () => void;
    children: ReactNode;
    /** Sticky content above the scrollable list (e.g. search). */
    header?: ReactNode;
    /** Content rendered below the trigger (e.g. Other text field). */
    belowTrigger?: ReactNode;
    listRef?: RefObject<HTMLDivElement | null>;
    matchTriggerWidth?: boolean;
    /**
     * Reserve a fixed list height so async option loads don't resize the
     * popover and flip its collision side mid-open.
     */
    stableListHeight?: boolean;
};

/** ComboboxOptionRow min-h (2.75rem); list shows this many rows before scrolling. */
const VISIBLE_OPTION_COUNT = 6;
const OPTION_ROW_MIN_HEIGHT = '2.75rem';
const LIST_MAX_HEIGHT = `calc(${VISIBLE_OPTION_COUNT} * ${OPTION_ROW_MIN_HEIGHT})`;

export function ComboboxShell({
    open,
    onOpenChange,
    displayText,
    placeholder,
    readOnly,
    isInvalid = false,
    hasValue = false,
    onClear,
    children,
    header,
    belowTrigger,
    listRef,
    matchTriggerWidth = true,
    stableListHeight = false,
}: ComboboxShellProps) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [contentWidth, setContentWidth] = useState<number | undefined>();

    useLayoutEffect(() => {
        if (!matchTriggerWidth || !open) return;
        const el = triggerRef.current;
        if (!el) return;
        setContentWidth(el.offsetWidth);
    }, [matchTriggerWidth, open]);

    const showingPlaceholder = !hasValue;

    return (
        <div className="w-full max-w-[480px] min-w-0">
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <button
                        ref={triggerRef}
                        type="button"
                        data-validation-control
                        disabled={readOnly}
                        className={cn(
                            'flex min-w-0 items-center justify-between gap-2',
                            'min-h-[44px] w-full max-w-full',
                            'rounded-lg border bg-neutral-800/60 backdrop-blur-[8px]',
                            'px-3 py-2 text-base font-medium text-white',
                            'focus:border-[var(--outline-brand-primary)] focus:ring-0 focus:outline-none',
                            'transition-colors',
                            readOnly && 'cursor-not-allowed opacity-50',
                            isInvalid
                                ? 'border-[var(--danger-500)]'
                                : 'border-[var(--border-neutral-secondary)]'
                        )}
                    >
                        <span
                            className={cn(
                                'max-w-full min-w-0 flex-1 truncate text-left',
                                showingPlaceholder &&
                                    'text-[var(--text-tertiary)]'
                            )}
                        >
                            {showingPlaceholder ? placeholder : displayText}
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                            {hasValue && onClear && !readOnly && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Clear selection"
                                    className="rounded p-0.5 text-neutral-400 hover:bg-neutral-700/60 hover:text-white"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onClear();
                                    }}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' ||
                                            e.key === ' '
                                        ) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onClear();
                                        }
                                    }}
                                >
                                    <X className="size-4" />
                                </span>
                            )}
                            <ChevronsUpDown className="size-4 opacity-50" />
                        </span>
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    collisionPadding={16}
                    onOpenAutoFocus={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        const search = target.querySelector<HTMLInputElement>(
                            'input[type="search"]'
                        );
                        e.preventDefault();
                        search?.focus();
                    }}
                    style={
                        matchTriggerWidth && contentWidth
                            ? { width: contentWidth }
                            : undefined
                    }
                    className={cn(
                        'mr-0 flex max-w-[min(480px,calc(100vw-2rem))] flex-col gap-1 overflow-hidden p-1 text-white',
                        'rounded-lg border border-neutral-600/30 bg-neutral-800',
                        'shadow-[0px_1px_3px_0px_rgba(0,0,0,0.12),0px_1px_2px_-1px_rgba(0,0,0,0.12)]'
                    )}
                >
                    {header}
                    <div
                        ref={listRef}
                        className="min-h-0 overflow-y-auto"
                        style={
                            stableListHeight
                                ? { height: LIST_MAX_HEIGHT }
                                : { maxHeight: LIST_MAX_HEIGHT }
                        }
                    >
                        {children}
                    </div>
                </PopoverContent>
            </Popover>
            {belowTrigger}
        </div>
    );
}
