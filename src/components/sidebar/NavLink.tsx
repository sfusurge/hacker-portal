'use client';

import Link from 'next/link';
import { ComponentProps, ReactNode } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DropdownItem {
    label: string;
    href: string;
}

interface NavLinkProps {
    href: string;
    label: string;
    icon?: ReactNode | string;
    iconAlt?: string;
    collapsed?: boolean;
    disabled?: boolean;
    dropdownItems?: DropdownItem[];
    badge?: number;
}

export const navLinkVariants = cva(
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
    active: isActive,
    collapsed,
    dropdownItems,
    badge,
    ...props
}: ComponentProps<'a'> & NavLinkProps & VariantProps<typeof navLinkVariants>) {
    const pathname = usePathname();
    const isCollapsed = collapsed || className?.includes('justify-center');

    const linkContent = (
        <>
            {icon && iconAlt && (
                <div className="relative flex h-6 w-6 items-center justify-center">
                    {typeof icon === 'string' ? (
                        <img
                            src={icon}
                            alt={iconAlt}
                            className="h-6 w-6 rounded-lg object-contain"
                        />
                    ) : (
                        <div className="h-6 w-6 [&>svg]:h-full [&>svg]:w-full">
                            {icon}
                        </div>
                    )}
                    {badge != null && badge > 0 && (
                        <span className="bg-danger-500 absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] leading-none font-bold text-white">
                            {badge > 99 ? '99+' : badge}
                        </span>
                    )}
                </div>
            )}
            {!isCollapsed ? (
                <motion.span
                    className="leading-none whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {label}
                </motion.span>
            ) : null}
        </>
    );

    return (
        <motion.div
            initial={false}
            animate={{
                width: isCollapsed ? '48px' : '100%',
            }}
            transition={{ ease: 'easeInOut' }}
        >
            {dropdownItems && dropdownItems.length > 0 ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Link
                            href={href}
                            {...props}
                            className={cn(
                                navLinkVariants({
                                    variant,
                                    platform,
                                    active:
                                        isActive ||
                                        pathname === href ||
                                        pathname.startsWith(href + '/'),
                                    disabled,
                                }),
                                isCollapsed
                                    ? 'justify-start'
                                    : 'w-full justify-start',
                                className
                            )}
                        >
                            {linkContent}
                        </Link>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-48"
                    >
                        {dropdownItems.map((item, idx) => {
                            const isChildActive =
                                pathname === item.href ||
                                pathname.startsWith(item.href + '/') ||
                                (pathname === href && idx === 0);

                            return (
                                <DropdownMenuItem asChild key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                                            isChildActive
                                                ? 'bg-brand-950 text-white'
                                                : 'text-white/80 hover:bg-neutral-800'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
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
                        isCollapsed ? 'justify-start' : 'w-full justify-start',
                        className
                    )}
                >
                    {linkContent}
                </Link>
            )}
        </motion.div>
    );
}
