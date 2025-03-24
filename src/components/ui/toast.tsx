'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ShieldExclamationIcon,
    InformationCircleIcon,
    Square2StackIcon,
} from '@heroicons/react/20/solid';

import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            'fixed top-20 z-[300] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[360px]',
            className
        )}
        {...props}
    />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
    'group pointer-events-auto relative w-full rounded-md border shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full',
    {
        variants: {
            variant: {
                default: 'border-neutral-700/30 bg-neutral-900 text-white',
                success:
                    'border-success-500/30 bg-gradient-to-l from-neutral-900 to-success-950/30 text-white',
                error: 'border-danger-500/30 bg-gradient-to-l from-neutral-900 to-danger-950/30 text-white',
                warning:
                    'border-caution-500/30 bg-gradient-to-l from-neutral-900 to-caution-950/30 text-white',
                info: 'border-brand-500/30 bg-gradient-to-l from-neutral-900 to-brand-950/30 text-white',
            },
            hierarchy: {
                cozy: 'p-4',
                compact: 'p-3 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            hierarchy: 'cozy',
        },
    }
);

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
        VariantProps<typeof toastVariants> & { icon?: React.ReactNode }
>(({ className, variant, hierarchy, icon, ...props }, ref) => {
    const MobileIcon = React.useMemo(() => {
        if (icon)
            return React.cloneElement(icon as React.ReactElement, {
                className: cn(
                    'h-6 w-6 text-neutral-400 flex-shrink-0',
                    (icon as React.ReactElement).props.className
                ),
            });

        switch (variant) {
            case 'success':
                return (
                    <CheckCircleIcon className="text-success-500 h-6 w-6 flex-shrink-0" />
                );
            case 'warning':
                return (
                    <ExclamationTriangleIcon className="text-caution-500 h-6 w-6 flex-shrink-0" />
                );
            case 'error':
                return (
                    <ShieldExclamationIcon className="text-danger-500 h-6 w-6 flex-shrink-0" />
                );
            case 'info':
                return (
                    <InformationCircleIcon className="text-brand-500 h-6 w-6 flex-shrink-0" />
                );
            default:
                return (
                    <Square2StackIcon className="h-6 w-6 flex-shrink-0 text-neutral-400" />
                );
        }
    }, [variant, icon]);

    const DesktopIcon = React.useMemo(() => {
        if (icon)
            return React.cloneElement(icon as React.ReactElement, {
                className: cn(
                    'h-6 w-6 text-neutral-400 flex-shrink-0',
                    (icon as React.ReactElement).props.className
                ),
            });

        switch (variant) {
            case 'success':
                return (
                    <div className="bg-success-500/20 flex h-12 w-12 items-center justify-center rounded-full">
                        <CheckCircleIcon className="text-success-500 h-6 w-6 flex-shrink-0" />
                    </div>
                );
            case 'warning':
                return (
                    <div className="bg-caution-500/20 flex h-12 w-12 items-center justify-center rounded-full">
                        <ExclamationTriangleIcon className="text-caution-500 h-6 w-6 flex-shrink-0" />
                    </div>
                );
            case 'error':
                return (
                    <div className="bg-danger-500/20 flex h-12 w-12 items-center justify-center rounded-full">
                        <ShieldExclamationIcon className="text-danger-500 h-6 w-6 flex-shrink-0" />
                    </div>
                );
            case 'info':
                return (
                    <div className="bg-brand-500/20 flex h-12 w-12 items-center justify-center rounded-full">
                        <InformationCircleIcon className="text-brand-500 h-6 w-6 flex-shrink-0" />
                    </div>
                );
            default:
                return (
                    <Square2StackIcon className="h-6 w-6 flex-shrink-0 text-neutral-400" />
                );
        }
    }, [variant]);

    return (
        <ToastPrimitives.Root
            ref={ref}
            className={cn(
                toastVariants({ variant }),
                'p-3 text-sm sm:p-4 sm:text-base',
                className
            )}
            {...props}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 block sm:hidden">{MobileIcon}</div>
                    <div className="mt-0.5 hidden sm:block">{DesktopIcon}</div>
                    <div className="flex-1">{props.children}</div>
                </div>
                <ToastPrimitives.Close
                    className="rounded-md p-1 text-neutral-50/50 hover:text-neutral-50 focus:opacity-100 focus:outline-none"
                    toast-close=""
                >
                    <X className="h-4 w-4" />
                </ToastPrimitives.Close>
            </div>
        </ToastPrimitives.Root>
    );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-neutral-700/30 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-neutral-700/30 focus:ring-2 focus:ring-neutral-400 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
            className
        )}
        {...props}
    />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        className={cn('text-base font-medium', className)}
        {...props}
    />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Description
        ref={ref}
        className={cn('hidden text-xs text-white/60 sm:block', className)}
        {...props}
    />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastAction,
};
