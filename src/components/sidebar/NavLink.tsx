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
    'group flex items-center rounded-lg transition-colors',
    {
        variants: {
            variant: {
                default: '',
                error: 'text-danger-400 bg-danger-950/0 hover:bg-danger-950/60',
            },
            platform: {
                desktop: 'h-11 flex-row text-base gap-3 px-3',
                mobile: 'h-16 flex-col justify-center text-xs font-medium gap-2',
            },
            active: {
                true: 'text-white bg-brand-950 hover:bg-brand-900',
                false: 'text-white/60 bg-transparent hover:bg-neutral-750/30',
            },
        },
    }
);

export function NavLink({
    className,
    variant,
    href,
    label,
    icon,
    iconAlt,
    platform,
    active,
    ...props
}: ComponentProps<'a'> & NavLinkProps & VariantProps<typeof navLinkVariants>) {
    const iconStyles = cn({
        'text-brand-400 group-hover:text-brand-200': active && icon,
        'text-white/30 group-hover:text-white/60': !active && icon,
        'text-danger-400/60 group-hover:text-danger-400':
            variant === 'error' && icon,
    });

    return (
        <Link
            href={href}
            {...props}
            className={cn(
                navLinkVariants({ variant, className, platform, active })
            )}
        >
            {icon && iconAlt && (
                <div className={cn('h-6 w-6 transition-colors', iconStyles)}>
                    {icon}
                </div>
            )}
            <span className="leading-none">{label}</span>
        </Link>
    );
}
