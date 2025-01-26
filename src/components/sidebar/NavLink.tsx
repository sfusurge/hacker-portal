'use client';

import Link from 'next/link';
import { act, ComponentProps, forwardRef, ReactNode } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NavLinkProps {
    href: string;
    label: string;
    icon?: ReactNode;
    iconAlt?: string;
}

const navLinkVariants = cva('flex items-center rounded-lg flex-1', {
    variants: {
        variant: {},
        platform: {
            desktop: 'h-11 flex-row text-base gap-3 px-3',
            mobile: 'h-16 flex-col justify-center text-xs font-medium gap-2',
        },
        active: {
            true: 'text-white bg-brand-900',
            false: 'text-white/60',
        },
    },
});

export function NavLink({
    className,
    href,
    label,
    icon,
    iconAlt,
    platform,
    active,
    ...props
}: ComponentProps<'a'> & NavLinkProps & VariantProps<typeof navLinkVariants>) {
    const iconStyles = cn({
        'text-brand-400': active && icon,
        'text-white/30': !active && icon,
    });

    return (
        <Link
            href={href}
            {...props}
            className={cn(navLinkVariants({ className, platform, active }))}
        >
            {icon && iconAlt && (
                <div className={cn('h-6 w-6', iconStyles)}>{icon}</div>
            )}
            <span className="leading-none">{label}</span>
        </Link>
    );
}
