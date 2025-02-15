'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import style from './label.module.css';
import { cn } from '@/lib/utils';

const labelVariants = cva(
    'max-w-[400px] text-white/60 mb-1.5 block text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
        VariantProps<typeof labelVariants> & { required?: boolean }
>(({ required = false, className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className, {
            [style.required]: required,
        })}
        {...props}
    />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
