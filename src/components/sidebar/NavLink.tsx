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
                false: 'text-white/60 hover:text-white bg-transparent hover:bg-neutral-750/30',
            },
            disabled: {
                true: 'text-white/18 pointer-events-none',
                false: '',
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
    disabled,
    iconAlt,
    platform,
    active,
    ...props
}: ComponentProps<'a'> & NavLinkProps & VariantProps<typeof navLinkVariants>) {
    const iconStyles = cn({
        'text-brand-400 group-hover:text-brand-200':
            active && !disabled && icon,
        'text-white/30 group-hover:text-white/60': !active && !disabled && icon,
        'text-danger-400/60 group-hover:text-danger-400':
            variant === 'error' && !disabled && icon,
        'text-white/18': disabled && icon,
    });

    const isCollapsed = className?.includes('justify-center');

    return (
        <Link
            href={href}
            {...props}
            className={cn(
                navLinkVariants({
                    variant,
                    platform,
                    active,
                    disabled,
                }),
                isCollapsed ? 'justify-center' : 'justify-start',
                className
            )}
        >
            {icon && iconAlt && (
                <div
                    className={cn(
                        'w-6 h-6 transition-colors flex items-center justify-center',
                        iconStyles
                    )}
                >
                    <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                        {icon}
                    </div>
                </div>
            )}
            {!isCollapsed && <span className="leading-none">{label}</span>}
        </Link>
    );
}
