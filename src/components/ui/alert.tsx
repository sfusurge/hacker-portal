import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ShieldExclamationIcon,
    InformationCircleIcon,
    XCircleIcon,
} from '@heroicons/react/20/solid';

import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-lg border p-3 text-sm', {
    variants: {
        variant: {
            default: 'border-neutral-600 bg-neutral-800/60 text-white',
            success: 'border-success-900 bg-success-950/60 text-success-400',
            warning: 'border-caution-900 bg-caution-950/60 text-caution-400',
            danger: 'border-danger-900 bg-danger-950/60 text-danger-400',
            info: 'border-brand-900 bg-brand-950/60 text-brand-400',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> &
        VariantProps<typeof alertVariants> & { onClose?: () => void }
>(({ className, variant, onClose, ...props }, ref) => {
    const IconComponent = React.useMemo(() => {
        switch (variant) {
            case 'success':
                return <CheckCircleIcon className="text-success-400 h-4 w-4" />;
            case 'warning':
                return (
                    <ExclamationTriangleIcon className="text-caution-400 h-4 w-4" />
                );
            case 'danger':
                return (
                    <ShieldExclamationIcon className="text-danger-400 h-4 w-4" />
                );
            case 'info':
                return (
                    <InformationCircleIcon className="text-brand-400 h-4 w-4" />
                );
            default:
                return (
                    <InformationCircleIcon className="h-4 w-4 text-neutral-400" />
                );
        }
    }, [variant]);

    return (
        <div
            ref={ref}
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        >
            <div className="flex gap-2">
                {IconComponent}
                <div className="flex-1">{props.children}</div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex h-4 w-4 cursor-pointer items-center justify-center text-white/30 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
                    >
                        <XCircleIcon className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                )}
            </div>
        </div>
    );
});
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn(
            'mb-2 leading-none font-semibold tracking-tight',
            className
        )}
        {...props}
    />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('text-xs text-white [&_p]:leading-relaxed', className)}
        {...props}
    />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
