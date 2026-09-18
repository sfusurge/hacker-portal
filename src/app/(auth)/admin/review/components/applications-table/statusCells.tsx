'use client';

import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import type { StatusEnum } from '@/db/schema/applications';
import {
    DropdownMenuItem,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

/** Pending-status empty state is stored as N/A; legacy rows may still be Awaiting Review. */
export function normalizePendingStatus(status: string): StatusEnum {
    if (!status || status === 'Awaiting Review') {
        return 'N/A';
    }
    return status as StatusEnum;
}

export function statusDisplayLabel(status: string): string {
    switch (status) {
        case 'N/A':
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
    acceptPendingStatus,
    onChange,
    disabled,
    readOnly,
}: {
    value: string;
    acceptPendingStatus: StatusEnum;
    onChange: (next: StatusEnum) => void;
    disabled?: boolean;
    readOnly?: boolean;
}) {
    const menuId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<{
        top: number;
        left: number;
        maxHeight: number;
    } | null>(null);

    const normalizedValue = normalizePendingStatus(value);
    const selectableValues: StatusEnum[] = [
        'N/A',
        acceptPendingStatus,
        'Wait List',
        'Declined',
    ];
    const uniqueValues = Array.from(
        new Set(
            selectableValues.includes(normalizedValue)
                ? selectableValues
                : [...selectableValues, normalizedValue]
        )
    );

    const stopRowInteraction = (e: SyntheticEvent) => {
        e.stopPropagation();
    };

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) {
            setMenuPos(null);
            return;
        }

        const rect = triggerRef.current.getBoundingClientRect();
        const menuWidth = 180;
        const estimatedMenuHeight = 16 + uniqueValues.length * 44;
        const pad = 8;
        const spaceBelow = window.innerHeight - rect.bottom - pad;
        const spaceAbove = rect.top - pad;
        const placeTop =
            spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
        const maxHeight = Math.max(120, placeTop ? spaceAbove : spaceBelow);
        const left = Math.min(
            Math.max(pad, rect.left),
            window.innerWidth - menuWidth - pad
        );
        const top = placeTop
            ? Math.max(pad, rect.top - Math.min(estimatedMenuHeight, maxHeight))
            : rect.bottom;

        setMenuPos({ top, left, maxHeight });
    }, [open, uniqueValues.length]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (
                triggerRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return;
            }
            setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        const onScroll = (event: Event) => {
            if (
                event.target instanceof Node &&
                menuRef.current?.contains(event.target)
            ) {
                return;
            }
            setOpen(false);
        };

        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('scroll', onScroll, true);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [open]);

    if (readOnly) {
        return (
            <div className="absolute inset-0 z-10 flex w-full min-w-0 items-center px-3">
                <StatusChip status={normalizedValue} />
            </div>
        );
    }

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                disabled={disabled}
                data-state={open ? 'open' : 'closed'}
                className="absolute inset-0 z-10 flex w-full min-w-0 items-center justify-between gap-2 px-3 outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
                onPointerDown={stopRowInteraction}
                onMouseDown={stopRowInteraction}
                onClick={(e) => {
                    stopRowInteraction(e);
                    if (!disabled) setOpen((prev) => !prev);
                }}
            >
                <StatusChip status={normalizedValue} />
                <ChevronDownIcon className="size-4 shrink-0 text-white/60" />
            </button>

            {open && menuPos
                ? createPortal(
                      <div
                          ref={menuRef}
                          id={menuId}
                          role="menu"
                          aria-label="Select status"
                          className="z-[21000] w-[180px] overflow-y-auto rounded-lg border border-neutral-600/30 bg-neutral-900 p-1 text-white shadow-lg"
                          style={{
                              position: 'fixed',
                              top: menuPos.top,
                              left: menuPos.left,
                              maxHeight: menuPos.maxHeight,
                          }}
                          onClick={stopRowInteraction}
                          onPointerDown={stopRowInteraction}
                      >
                          <p className="px-2 pt-2 pb-1 font-mono text-xs font-medium text-white/60">
                              SELECT STATUS
                          </p>
                          {uniqueValues.map((status) => {
                              const selected = status === normalizedValue;
                              return (
                                  <button
                                      key={status}
                                      type="button"
                                      role="menuitem"
                                      className={clsx(
                                          'relative flex w-full cursor-pointer rounded-sm p-2 text-left hover:bg-neutral-800/80',
                                          selected &&
                                              'before:absolute before:top-1 before:bottom-1 before:left-0 before:w-0.5 before:rounded-full before:bg-white'
                                      )}
                                      onClick={() => {
                                          onChange(status);
                                          setOpen(false);
                                      }}
                                  >
                                      <StatusChip status={status} />
                                  </button>
                              );
                          })}
                      </div>,
                      document.body
                  )
                : null}
        </>
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
        'N/A',
        acceptPendingStatus,
        'Wait List',
        'Declined',
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
