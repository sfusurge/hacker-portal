'use client';

import Link from 'next/link';
import { act, ComponentProps, forwardRef, ReactNode } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
    href: string;
    label: string;
    icon?: ReactNode;
    iconAlt?: string;
}

const navLinkVariants = cva(
    'group flex items-center rounded-lg transition-colors pt-2 md:pt-0',
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
    active: propActive,
    ...props
}: ComponentProps<'a'> & NavLinkProps & VariantProps<typeof navLinkVariants>) {
    const pathname = usePathname();

    // Determine if this link should be active
    // Special case: Team nav item should be active for all team-related pages
    const isActive =
        propActive !== undefined
            ? propActive
            : pathname.startsWith(href) ||
              (href === '/team' &&
                  (pathname.includes('/team') || pathname.includes('/invite')));

    const iconStyles = cn({
        'text-brand-400 group-hover:text-brand-200':
            isActive && !disabled && icon,
        'text-white/30 group-hover:text-white/60':
            !isActive && !disabled && icon,
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
                    active: isActive,
                    disabled,
                }),
                isCollapsed ? 'justify-center' : 'justify-start',
                className
            )}
        >
            {icon && iconAlt && (
                <div
                    className={cn(
                        'flex h-6 w-6 items-center justify-center transition-colors',
                        iconStyles
                    )}
                >
                    <div className="h-6 w-6 [&>svg]:h-full [&>svg]:w-full">
                        {icon}
                    </div>
                </div>
            )}
            {!isCollapsed && <span className="leading-none">{label}</span>}
        </Link>
    );
}
