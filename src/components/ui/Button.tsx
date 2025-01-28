'use client';
import { ComponentProps, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ButtonProps {
    leadingIcon?: string;
    leadingIconAlt?: string;
    trailingIcon?: string;
    trailingIconAlt?: string;
}

const buttonVariants = cva(
    'text-white font-medium text-center flex items-center justify-center transition-colors',
    {
        variants: {
            variant: {
                default: '',
                success: '',
                caution: '',
                error: '',
                brand: '',
            },
            hierarchy: {
                primary:
                    'shadow-[0px_1px_0px_0px_rgba(255,255,255,0.24)_inset,0px_0px_0px_1px_rgba(255,255,255,0.12)_inset]',
                secondary: 'border',
                tertiary: '',
            },
            size: {
                cozy: 'h-11 rounded-lg text-md',
                compact: 'h-9 rounded-md text-sm',
            },
            disabled: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            {
                variant: 'brand',
                hierarchy: 'primary',
                className: 'text-white bg-brand-600 hover:bg-brand-700',
            },
            {
                variant: 'brand',
                hierarchy: 'primary',
                disabled: true,
                className: 'text-brand-400/18 bg-brand-950 pointer-events-none',
            },
            {
                variant: 'default',
                hierarchy: 'primary',
                className: 'bg-neutral-700 hover:bg-neutral-600',
            },
            {
                variant: 'default',
                hierarchy: 'secondary',
                className:
                    'bg-neutral-800/60 hover:bg-neutral-750/60 border-neutral-600/60',
            },
            {
                variant: 'caution',
                hierarchy: 'primary',
                className: 'bg-caution-700 hover:bg-caution-600',
            },
        ],
    }
);

const Button = forwardRef<
    HTMLButtonElement,
    ComponentProps<'button'> & ButtonProps & VariantProps<typeof buttonVariants>
>(
    (
        {
            className,
            variant,
            size,
            hierarchy,
            disabled,
            leadingIcon,
            leadingIconAlt,
            trailingIcon,
            trailingIconAlt,
            ...props
        },
        ref
    ) => {
        const leadingIconStyles = cn({
            'ml-1': size === 'compact' && leadingIcon,
            'ml-2': size === 'cozy' && leadingIcon,
        });

        const trailingIconStyles = cn({
            'mr-1': size === 'compact' && leadingIcon,
            'mr-2': size === 'cozy' && leadingIcon,
        });

        return (
            <button
                ref={ref}
                {...props}
                disabled={disabled}
                className={cn(
                    buttonVariants({
                        className,
                        disabled,
                        variant,
                        size,
                        hierarchy,
                    })
                )}
            >
                {leadingIcon && leadingIconAlt && (
                    <Image
                        src={leadingIcon}
                        alt={leadingIconAlt}
                        width={20}
                        height={20}
                        className={leadingIconStyles}
                    ></Image>
                )}

                <span className="p-3">{props.children}</span>

                {trailingIcon && trailingIconAlt && (
                    <Image
                        src={trailingIcon}
                        alt={trailingIconAlt}
                        width={20}
                        height={20}
                        className={trailingIconStyles}
                    ></Image>
                )}
            </button>
        );
    }
);

export { Button, buttonVariants };
