'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwitchProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    'aria-label'?: string;
}

/**
 * Accessible on/off switch (no external dependency). Brand track when on,
 * neutral when off, with a sliding knob — matches the Strike design system.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    (
        { checked = false, onCheckedChange, disabled, id, className, ...props },
        ref
    ) => (
        <button
            ref={ref}
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                'focus-visible:ring-brand-500/50 relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-brand-600' : 'bg-neutral-700',
                className
            )}
            {...props}
        >
            <span
                className={cn(
                    'pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition-transform',
                    checked ? 'translate-x-[22px]' : 'translate-x-0.5'
                )}
            >
                {checked ? (
                    <Check className="text-brand-600 h-3 w-3" strokeWidth={3} />
                ) : (
                    <X className="h-3 w-3 text-neutral-500" strokeWidth={3} />
                )}
            </span>
        </button>
    )
);
Switch.displayName = 'Switch';
