'use client';

import Link from 'next/link';
import { ComponentProps, ReactNode, useState } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import * as PopoverPrimitive from '@radix-ui/react-popover';

interface DropdownItem {
    label: string;
    href: string;
    icon?: ReactNode;
    iconAlt?: string;
}

interface NavLinkProps {
    href: string;
    label: string;
    icon?: ReactNode | string;
    iconAlt?: string;
    collapsed?: boolean;
    disabled?: boolean;
    dropdownItems?: DropdownItem[];
    badge?: string;
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
    const [submenuOpen, setSubmenuOpen] = useState(false);

    const dropdownActive =
        dropdownItems?.some(
            (item) =>
                pathname === item.href || pathname.startsWith(item.href + '/')
        ) ?? false;

    const active =
        Boolean(isActive) ||
        pathname === href ||
        pathname.startsWith(href + '/') ||
        dropdownActive;

    const iconNode =
        icon && iconAlt ? (
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
                {badge && (
                    <span className="bg-danger-500 absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] leading-none font-bold text-white">
                        {badge}
                    </span>
                )}
            </div>
        ) : null;

    const linkContent = (
        <>
            {iconNode}
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

    const triggerClassName = cn(
        navLinkVariants({
            variant,
            platform,
            active,
            disabled,
        }),
        isCollapsed ? 'justify-start' : 'w-full justify-start',
        'cursor-pointer',
        className
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
                <Popover open={submenuOpen} onOpenChange={setSubmenuOpen}>
                    <PopoverTrigger asChild>
                        <div className={triggerClassName}>
                            {isCollapsed ? (
                                <PopoverPrimitive.Anchor asChild>
                                    <div>{iconNode}</div>
                                </PopoverPrimitive.Anchor>
                            ) : (
                                <>
                                    {iconNode}
                                    <motion.div
                                        className="flex w-full items-center justify-between"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <span className="leading-none whitespace-nowrap">
                                            {label}
                                        </span>
                                        <PopoverPrimitive.Anchor asChild>
                                            <span className="inline-flex size-6 shrink-0 items-center justify-center">
                                                <ChevronRightIcon className="h-4 w-4" />
                                            </span>
                                        </PopoverPrimitive.Anchor>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent
                        side="right"
                        align="center"
                        sideOffset={24}
                        className="z-[2000] w-48 border border-neutral-600/30"
                    >
                        {dropdownItems.map((item) => (
                            <NavLink
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                iconAlt={item.iconAlt}
                                platform="desktop"
                                active={
                                    pathname === item.href ||
                                    pathname.startsWith(item.href + '/')
                                }
                                onClick={() => setSubmenuOpen(false)}
                            />
                        ))}
                    </PopoverContent>
                </Popover>
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
