'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const toggleVariants = cva(
    'inline-flex items-center justify-center border-x border-neutral-600/60 text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-colors',
    {
        variants: {
            variant: {
                default:
                    'bg-transparent hover:bg-neutral-750/30 bg-neutral-800/60 hover:text-white data-[state=on]:bg-brand-900 data-[state=on]:text-white',
                outline:
                    'bg-transparent hover:bg-neutral-750/30 hover:text-white data-[state=on]:bg-brand-900 data-[state=on]:text-white',
                rating: 'bg-transparent hover:bg-neutral-750/30 bg-neutral-800/60  hover:text-white data-[state=on]:bg-brand-900 data-[state=on]:text-white',
            },
            size: {
                default: 'h-11 px-3 min-w-10',
                sm: 'h-9 px-2.5 min-w-9',
                lg: 'h-11 px-5 min-w-11',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

const Toggle = React.forwardRef<
    React.ElementRef<typeof TogglePrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
        VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
    <TogglePrimitive.Root
        ref={ref}
        className={cn(toggleVariants({ variant, size, className }))}
        {...props}
    />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
