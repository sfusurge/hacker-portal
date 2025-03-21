'use client';
import { ComponentProps, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ButtonProps {
    leadingIcon?: string;
    leadingIconAlt?: string;
    leadingIconChild?: React.ReactElement;
    trailingIcon?: string;
    trailingIconAlt?: string;
    trailingIconChild?: React.ReactElement;
    type?: 'button' | 'submit' | 'reset';
    size?: 'compact' | 'cozy';
    mobileSize?: 'compact' | 'cozy';
}

const buttonVariants = cva(
    'text-white font-medium text-center flex items-center justify-center transition-colors cursor-pointer',
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
                className:
                    'shadow-none text-brand-400/18 bg-brand-950 pointer-events-none',
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
                className: 'bg-danger-700 hover:bg-danger-600',
            },
            {
                variant: 'caution',
                hierarchy: 'secondary',
                className:
                    'bg-neutral-850 text-danger-400 hover:bg-neutral-750 border-neutral-600/60 font-medium',
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
            size = 'compact',
            mobileSize,
            hierarchy,
            disabled,
            leadingIcon,
            leadingIconAlt,
            leadingIconChild,
            trailingIcon,
            trailingIconAlt,
            trailingIconChild,
            type,
            ...props
        },
        ref
    ) => {
        const sizeClasses = cn(
            size === 'compact'
                ? 'h-9 rounded-md text-sm'
                : 'h-11 rounded-lg text-md',
            mobileSize === 'compact'
                ? 'md:h-9 md:rounded-md md:text-sm'
                : 'md:h-11 md:rounded-lg md:text-md'
        );

        const leadingIconStyles = cn({
            'ml-2': size === 'compact' && (leadingIcon || leadingIconChild),
            'ml-3': size === 'cozy' && (leadingIcon || leadingIconChild),
            'md:ml-2':
                mobileSize === 'compact' && (leadingIcon || leadingIconChild),
            'md:ml-3':
                mobileSize === 'cozy' && (leadingIcon || leadingIconChild),
        });

        const trailingIconStyles = cn({
            'mr-2': size === 'compact' && (trailingIcon || trailingIconChild),
            'mr-3': size === 'cozy' && (trailingIcon || trailingIconChild),
            'md:mr-2':
                mobileSize === 'compact' && (trailingIcon || trailingIconChild),
            'md:mr-3':
                mobileSize === 'cozy' && (trailingIcon || trailingIconChild),
        });

        // Handle padding for text content
        const contentStyles = cn({
            'p-2': size === 'compact',
            'p-3': size === 'cozy',
            'md:p-2': mobileSize === 'compact',
            'md:p-3': mobileSize === 'cozy',
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
                        hierarchy,
                    }),
                    sizeClasses
                )}
                type={type}
            >
                {leadingIcon && leadingIconAlt && (
                    <Image
                        src={leadingIcon}
                        alt={leadingIconAlt}
                        width={20}
                        height={20}
                        className={leadingIconStyles}
                    />
                )}

                {leadingIconChild && (
                    <span className={leadingIconStyles}>
                        {leadingIconChild}
                    </span>
                )}

                <span className={contentStyles}>{props.children}</span>

                {trailingIcon && trailingIconAlt && (
                    <Image
                        src={trailingIcon}
                        alt={trailingIconAlt}
                        width={20}
                        height={20}
                        className={trailingIconStyles}
                    />
                )}

                {trailingIconChild && (
                    <span className={trailingIconStyles}>
                        {trailingIconChild}
                    </span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
