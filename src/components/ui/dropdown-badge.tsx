'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

interface DropdownBadgeProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    count?: number;
    icon?: React.ReactNode;
    variant?: 'default' | 'brand' | 'destructive';
    hierarchy?: 'primary' | 'secondary' | 'tertiary';
    size?: 'default' | 'cozy';
    isOpen?: boolean;
}

export function DropdownBadge({
    className,
    label,
    count,
    icon,
    variant = 'default',
    hierarchy = 'primary',
    size = 'cozy',
    isOpen = false,
    ...props
}: DropdownBadgeProps) {
    const variantStyles = {
        default: 'bg-neutral-850 hover:bg-neutral-800',
        brand: 'bg-brand-600 hover:bg-brand-500',
        destructive: 'bg-destructive-600 hover:bg-destructive-500',
    };

    const hierarchyStyles = {
        primary: 'text-white',
        secondary: 'border border-neutral-700 text-white/80',
        tertiary: 'bg-transparent hover:bg-neutral-800/50 text-white/80',
    };

    const defaultIcon = isOpen ? (
        <ChevronUpIcon className="h-4 w-4 text-white/60" />
    ) : (
        <ChevronDownIcon className="h-4 w-4 text-white/60" />
    );

    return (
        <button
            type="button"
            className={cn(
                'focus:ring-brand-500/50 flex h-11 items-center gap-2 rounded-full border border-neutral-600/60 px-3 py-2 transition-colors focus:ring-2 focus:outline-none',
                variantStyles[variant],
                hierarchyStyles[hierarchy],
                className
            )}
            {...props}
        >
            <span>{label}</span>
            {count !== undefined && count > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-neutral-600 text-sm font-medium">
                    {count}
                </span>
            )}
            {icon || defaultIcon}
        </button>
    );
}
