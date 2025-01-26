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

const navLinkVariants = cva(
    'h-16 text-xs font-medium flex items-center justify-center rounded-lg flex-1',
    {
        variants: {
            variant: {},
            platform: {
                desktop: '',
                mobile: 'flex-col',
            },
            active: {
                true: 'text-white bg-brand-900',
                false: 'text-white/60',
            },
        },
    }
);

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
                <div className={cn('h-6 w-6 mb-2', iconStyles)}>{icon}</div>
            )}
            <span className="leading-none">{label}</span>
        </Link>
    );
}
