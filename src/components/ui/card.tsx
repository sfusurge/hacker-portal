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
            'flex h-max flex-1 flex-col rounded-xl border border-neutral-600/30 bg-neutral-900',
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
    React.HTMLAttributes<HTMLDivElement> & {
        className?: string;
        multiAction?: boolean;
    }
>(({ className, multiAction, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex w-full flex-row items-center justify-between border-b border-b-neutral-600/30 p-5',
            multiAction &&
                '@max-[565px]/header-actions:flex-col @max-[565px]/header-actions:items-stretch',
            className
        )}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

const CardHeaderColumn = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex min-h-12 min-w-0 flex-1 flex-col justify-between gap-2',
            className
        )}
        {...props}
    />
));
CardHeaderColumn.displayName = 'CardHeaderColumn';

const CardHeaderTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement> & { className?: string }
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            'truncate text-left text-xl font-semibold tracking-tight',
            className
        )}
        {...props}
    />
));
CardHeaderTitle.displayName = 'CardHeaderTitle';

const CardHeaderDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement> & { className?: string }
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            'truncate text-sm leading-none font-medium text-white/60',
            className
        )}
        {...props}
    />
));
CardHeaderDescription.displayName = 'CardHeaderDescription';

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        className?: string;
    }
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-1 flex-col gap-4 p-5', className)}
        {...props}
    />
));
CardContent.displayName = 'CardContent';

const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement> & { className?: string }
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn('text-lg font-semibold text-white', className)}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement> & { className?: string }
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-pretty text-white/60', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('w-full border-t border-t-neutral-600/30 p-5', className)}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export {
    Card,
    CardHeader,
    CardHeaderColumn,
    CardHeaderTitle,
    CardHeaderDescription,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter,
};
