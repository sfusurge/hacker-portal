'use client';

import Link from 'next/link';
import { ComponentProps, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NavLinkProps {
    href: string;
    label: string;
    icon?: string;
    iconAlt?: string;
}

const navLinkVariants = cva('h-16 text-xs font-medium', {
    variants: {
        variant: {},
        platform: {
            desktop: '',
            mobile: '',
        },
        active: {
            false: null,
            true: 'text-white',
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
    return (
        <Link
            href={href}
            {...props}
            className={cn(navLinkVariants({ className, platform, active }))}
        >
            {icon && iconAlt && (
                <Image src={icon} alt={iconAlt} width={20} height={20}></Image>
            )}
            <span>{label}</span>
        </Link>
    );
}
