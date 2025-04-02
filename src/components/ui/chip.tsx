import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
    'rounded-lg px-3 py-1 text-sm text-nowrap font-medium',
    {
        variants: {
            variant: {
                default: 'bg-neutral-800/90 text-white/60',
                success: 'bg-success-950 text-success-300',
                danger: 'bg-danger-950/60 text-danger-400',
                brand: 'bg-brand-950/60 text-brand-400',
                caution: 'bg-caution-950/60 text-caution-400',
                yellow: 'bg-yellow-950/60 text-yellow-400',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

interface ChipProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(chipVariants({ variant }), className)}
                {...props}
            />
        );
    }
);
Chip.displayName = 'Chip';

export { Chip, chipVariants };
