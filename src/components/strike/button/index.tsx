import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 shadow-skeumorphic-sm px-1 py-2',
    {
        variants: {
            variant: {
                brand: 'bg-brand-700 text-white hover:bg-brand-600 active:bg-brand-500 disabled:bg-brand-950 disabled:text-brand-800',
                neutral:
                    'bg-neutral-700 text-white hover:bg-neutral-600 active:bg-neutral-500 disabled:bg-neutral-700/18 disabled:text-white/18',
                'neutral-secondary':
                    'border-solid border-1 border-neutral-600/60 bg-neutral-800/60 text-white hover:bg-neutral-750/60 active:bg-neutral-700/60 disabled:border-neutral-700/18 disabled:bg-neutral-800/18 disabled:text-white/18',
                'neutral-tertiary':
                    'text-white hover:bg-neutral-750/60 active:bg-neutral-700/60 disabled:bg-neutral-800/18',
                success:
                    'bg-sucess-700 text-white hover:bg-sucess-600 active:bg-sucess-500 disabled:bg-sucess-950 disabled:text-sucess-800',
                'success-secondary':
                    'bg-sucess-700 text-white hover:bg-sucess-600 active:bg-sucess-500 disabled:bg-sucess-950 disabled:text-sucess-800',
                caution:
                    'bg-caution-700 text-white hover:bg-caution-600 active:bg-caution-500 disabled:bg-caution-950 disabled:text-caution-800',
                'caution-secondary':
                    'bg-caution-700 text-white hover:bg-caution-600 active:bg-caution-500 disabled:bg-caution-950 disabled:text-caution-800',
                error: 'bg-error-700 text-white hover:bg-error-600 active:bg-error-500 disabled:bg-error-950 disabled:text-error-800',
                'error-secondary':
                    'bg-error-700 text-white hover:bg-error-600 active:bg-error-500 disabled:bg-error-950 disabled:text-error-800',
            },
            size: {
                cozy: 'min-w-11 min-h-11',
                compact: 'min-w-9 min-h-9',
            },
        },
        defaultVariants: { variant: 'brand', size: 'cozy' },
    }
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

// Copy from shadcn/ui
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant, size, asChild = false, children, ...props },
        ref
    ) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {children}
            </Comp>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
