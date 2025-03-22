'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex h-max flex-1 flex-col gap-4 rounded-xl border border-neutral-600/30 bg-neutral-900 md:gap-5',
            className
        )}
        {...props}
    >
        {children}
    </div>
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex w-full flex-row justify-between border-b border-b-neutral-600/30 p-4 md:p-5',
            className
        )}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        className?: string;
        footer: boolean;
    }
>(({ className, footer, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex flex-1 flex-col gap-4 p-4 md:p-5',
            className,
            footer ? 'md:pb-0' : 'pb-4 md:pb-5'
        )}
        {...props}
    />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'w-full border-t border-t-neutral-600/30 p-4 md:p-5',
            className
        )}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
